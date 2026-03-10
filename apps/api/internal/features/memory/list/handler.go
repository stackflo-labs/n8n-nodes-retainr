package list

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/apierr"
	"github.com/retainr/api/internal/middleware"
)

type memoryItem struct {
	ID        string         `json:"id"`
	Content   string         `json:"content"`
	Scope     string         `json:"scope"`
	SessionID *string        `json:"session_id,omitempty"`
	UserID    *string        `json:"user_id,omitempty"`
	AgentID   *string        `json:"agent_id,omitempty"`
	Metadata  map[string]any `json:"metadata"`
	Tags      []string       `json:"tags"`
	TTLAt     *time.Time     `json:"ttl_at,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
}

type listResponse struct {
	Memories []memoryItem `json:"memories"`
	Total    int          `json:"total"`
	Limit    int          `json:"limit"`
	Offset   int          `json:"offset"`
}

func Handler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())
		q := r.URL.Query()

		limit := queryInt(q.Get("limit"), 20)
		if limit > 100 {
			limit = 100
		}
		offset := queryInt(q.Get("offset"), 0)

		args := []any{wsID}
		filter := "WHERE m.workspace_id = $1 AND (m.ttl_at IS NULL OR m.ttl_at > NOW())"
		idx := 2

		if scope := q.Get("scope"); scope != "" {
			filter += " AND m.scope = $" + strconv.Itoa(idx)
			args = append(args, scope)
			idx++
		}
		if uid := q.Get("user_id"); uid != "" {
			filter += " AND m.user_id = $" + strconv.Itoa(idx)
			args = append(args, uid)
			idx++
		}
		if sid := q.Get("session_id"); sid != "" {
			filter += " AND m.session_id = $" + strconv.Itoa(idx)
			args = append(args, sid)
			idx++
		}
		if aid := q.Get("agent_id"); aid != "" {
			filter += " AND m.agent_id = $" + strconv.Itoa(idx)
			args = append(args, aid)
			idx++
		}
		if tags := q.Get("tags"); tags != "" {
			tagList := strings.Split(tags, ",")
			filter += " AND m.tags @> $" + strconv.Itoa(idx)
			args = append(args, tagList)
			idx++
		}

		// Count query
		var total int
		pool.QueryRow(r.Context(), "SELECT COUNT(*) FROM memories m "+filter, args...).Scan(&total)

		// Data query
		args = append(args, limit, offset)
		rows, err := pool.Query(r.Context(), `
			SELECT m.id::text, m.content, m.scope, m.session_id, m.user_id, m.agent_id,
			       m.metadata, m.tags, m.ttl_at, m.created_at
			FROM memories m
			`+filter+`
			ORDER BY m.created_at DESC
			LIMIT $`+strconv.Itoa(idx)+` OFFSET $`+strconv.Itoa(idx+1),
			args...)

		if err != nil {
			log.Error("list memories", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to list memories")
			return
		}
		defer rows.Close()

		memories := []memoryItem{}
		for rows.Next() {
			var m memoryItem
			var metadataRaw []byte
			if err := rows.Scan(
				&m.ID, &m.Content, &m.Scope,
				&m.SessionID, &m.UserID, &m.AgentID,
				&metadataRaw, &m.Tags, &m.TTLAt, &m.CreatedAt,
			); err != nil {
				continue
			}
			json.Unmarshal(metadataRaw, &m.Metadata)
			memories = append(memories, m)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(listResponse{
			Memories: memories,
			Total:    total,
			Limit:    limit,
			Offset:   offset,
		})
	}
}

func queryInt(s string, fallback int) int {
	if s == "" {
		return fallback
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return fallback
	}
	return n
}
