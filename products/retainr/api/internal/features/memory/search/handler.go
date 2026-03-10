package search

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/apierr"
	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/api/internal/platform/embeddings"
)

type searchCommand struct {
	Query     string   `json:"query"`
	Scope     string   `json:"scope"`
	SessionID string   `json:"session_id"`
	UserID    string   `json:"user_id"`
	AgentID   string   `json:"agent_id"`
	Tags      []string `json:"tags"`
	Limit     int      `json:"limit"`
	Threshold float64  `json:"threshold"`
}

func (c *searchCommand) validate() error {
	if c.Query == "" {
		return fmt.Errorf("query is required")
	}
	if c.Limit <= 0 || c.Limit > 100 {
		c.Limit = 10
	}
	if c.Threshold <= 0 {
		c.Threshold = 0.5
	}
	return nil
}

type memoryResult struct {
	ID        string         `json:"id"`
	Content   string         `json:"content"`
	Score     float64        `json:"score"`
	Scope     string         `json:"scope"`
	SessionID *string        `json:"session_id,omitempty"`
	UserID    *string        `json:"user_id,omitempty"`
	AgentID   *string        `json:"agent_id,omitempty"`
	Metadata  map[string]any `json:"metadata"`
	Tags      []string       `json:"tags"`
	CreatedAt time.Time      `json:"created_at"`
}

type searchResponse struct {
	Results []memoryResult `json:"results"`
	Total   int            `json:"total"`
}

func Handler(pool *pgxpool.Pool, log *slog.Logger, voyageKey string) http.HandlerFunc {
	embedder := embeddings.NewVoyage(voyageKey)

	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())

		var cmd searchCommand
		if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "Invalid request body")
			return
		}

		if err := cmd.validate(); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
			return
		}

		queryEmbedding, err := embedder.Embed(r.Context(), cmd.Query)
		if err != nil {
			log.Error("embed search query", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusServiceUnavailable, "embedding_unavailable",
				"Semantic search is temporarily unavailable. Please try again.")
			return
		}

		// Build filter conditions
		args := []any{wsID, queryEmbedding, 1 - cmd.Threshold, cmd.Limit}
		filterSQL := "WHERE m.workspace_id = $1 AND m.embedding IS NOT NULL AND (m.embedding <=> $2) < $3"
		argIdx := 5

		if cmd.Scope != "" {
			filterSQL += fmt.Sprintf(" AND m.scope = $%d", argIdx)
			args = append(args, cmd.Scope)
			argIdx++
		}
		if cmd.SessionID != "" {
			filterSQL += fmt.Sprintf(" AND m.session_id = $%d", argIdx)
			args = append(args, cmd.SessionID)
			argIdx++
		}
		if cmd.UserID != "" {
			filterSQL += fmt.Sprintf(" AND m.user_id = $%d", argIdx)
			args = append(args, cmd.UserID)
			argIdx++
		}
		if cmd.AgentID != "" {
			filterSQL += fmt.Sprintf(" AND m.agent_id = $%d", argIdx)
			args = append(args, cmd.AgentID)
			argIdx++
		}
		if len(cmd.Tags) > 0 {
			filterSQL += fmt.Sprintf(" AND m.tags @> $%d", argIdx)
			args = append(args, cmd.Tags)
		}

		query := fmt.Sprintf(`
			SELECT
				m.id::text,
				m.content,
				1 - (m.embedding <=> $2) AS score,
				m.scope,
				m.session_id,
				m.user_id,
				m.agent_id,
				m.metadata,
				m.tags,
				m.created_at
			FROM memories m
			%s
			  AND (m.ttl_at IS NULL OR m.ttl_at > NOW())
			ORDER BY m.embedding <=> $2
			LIMIT $4
		`, filterSQL)

		rows, err := pool.Query(r.Context(), query, args...)
		if err != nil {
			log.Error("search memories", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Search failed")
			return
		}
		defer rows.Close()

		results := []memoryResult{}
		for rows.Next() {
			var m memoryResult
			var metadataRaw []byte
			if err := rows.Scan(
				&m.ID, &m.Content, &m.Score,
				&m.Scope, &m.SessionID, &m.UserID, &m.AgentID,
				&metadataRaw, &m.Tags, &m.CreatedAt,
			); err != nil {
				log.Error("scan memory row", "workspace_id", wsID, "error", err)
				continue
			}
			json.Unmarshal(metadataRaw, &m.Metadata)
			results = append(results, m)
		}

		go pool.Exec(r.Context(),
			"UPDATE workspaces SET ops_this_month = ops_this_month + 1 WHERE id = $1", wsID)

		log.Info("memory search",
			"workspace_id", wsID,
			"results", len(results),
			"scope", cmd.Scope,
		)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(searchResponse{
			Results: results,
			Total:   len(results),
		})
	}
}
