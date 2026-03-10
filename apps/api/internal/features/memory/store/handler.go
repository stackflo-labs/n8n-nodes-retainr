package store

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/apierr"
	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/api/internal/platform/embeddings"
)

type storeCommand struct {
	Content   string         `json:"content"`
	Scope     string         `json:"scope"`
	SessionID string         `json:"session_id"`
	UserID    string         `json:"user_id"`
	AgentID   string         `json:"agent_id"`
	Metadata  map[string]any `json:"metadata"`
	Tags      []string       `json:"tags"`
	TTLSecs   *int           `json:"ttl_seconds"`
}

func (c *storeCommand) validate() error {
	c.Content = strings.TrimSpace(c.Content)
	if c.Content == "" {
		return fmt.Errorf("content is required")
	}
	validScopes := map[string]bool{"session": true, "user": true, "agent": true, "global": true}
	if !validScopes[c.Scope] {
		return fmt.Errorf("scope must be one of: session, user, agent, global")
	}
	if c.Scope == "session" && c.SessionID == "" {
		return fmt.Errorf("session_id is required when scope is 'session'")
	}
	if c.Scope == "user" && c.UserID == "" {
		return fmt.Errorf("user_id is required when scope is 'user'")
	}
	if c.Scope == "agent" && c.AgentID == "" {
		return fmt.Errorf("agent_id is required when scope is 'agent'")
	}
	return nil
}

type storeResponse struct {
	ID          string     `json:"id"`
	WorkspaceID string     `json:"workspace_id"`
	Scope       string     `json:"scope"`
	SessionID   string     `json:"session_id,omitempty"`
	UserID      string     `json:"user_id,omitempty"`
	AgentID     string     `json:"agent_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	TTLAt       *time.Time `json:"ttl_at,omitempty"`
}

func Handler(pool *pgxpool.Pool, log *slog.Logger, voyageKey string) http.HandlerFunc {
	embedder := embeddings.NewVoyage(voyageKey)

	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())

		var cmd storeCommand
		if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "Invalid request body")
			return
		}

		if err := cmd.validate(); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
			return
		}

		// Generate embedding — if Voyage AI is down, store without embedding and retry later
		embedding, err := embedder.Embed(r.Context(), cmd.Content)
		if err != nil {
			log.Warn("embedding unavailable, storing without vector",
				"workspace_id", wsID, "error", err)
			embedding = nil
		}

		metadata := cmd.Metadata
		if metadata == nil {
			metadata = map[string]any{}
		}
		tags := cmd.Tags
		if tags == nil {
			tags = []string{}
		}

		var ttlAt *time.Time
		if cmd.TTLSecs != nil && *cmd.TTLSecs > 0 {
			t := time.Now().Add(time.Duration(*cmd.TTLSecs) * time.Second)
			ttlAt = &t
		}

		metadataJSON, _ := json.Marshal(metadata)

		var id, workspaceID string
		var createdAt time.Time
		var dbTTLAt *time.Time

		err = pool.QueryRow(r.Context(), `
			INSERT INTO memories
				(workspace_id, scope, session_id, user_id, agent_id, content, embedding, metadata, tags, ttl_at)
			VALUES
				($1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,''), $6, $7, $8, $9, $10)
			RETURNING id::text, workspace_id::text, created_at, ttl_at
		`,
			wsID, cmd.Scope, cmd.SessionID, cmd.UserID, cmd.AgentID,
			cmd.Content, vectorOrNull(embedding), metadataJSON, tags, ttlAt,
		).Scan(&id, &workspaceID, &createdAt, &dbTTLAt)

		if err != nil {
			log.Error("store memory", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to store memory")
			return
		}

		// Increment monthly ops counter (fire and forget)
		go pool.Exec(r.Context(),
			"UPDATE workspaces SET ops_this_month = ops_this_month + 1 WHERE id = $1", wsID)

		log.Info("memory stored",
			"workspace_id", wsID,
			"memory_id", id,
			"scope", cmd.Scope,
			"has_embedding", embedding != nil,
		)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(storeResponse{
			ID:          id,
			WorkspaceID: workspaceID,
			Scope:       cmd.Scope,
			SessionID:   cmd.SessionID,
			UserID:      cmd.UserID,
			AgentID:     cmd.AgentID,
			CreatedAt:   createdAt,
			TTLAt:       dbTTLAt,
		})
	}
}

func vectorOrNull(v []float32) any {
	if v == nil {
		return nil
	}
	// pgvector expects the []float32 directly via pgx
	return v
}
