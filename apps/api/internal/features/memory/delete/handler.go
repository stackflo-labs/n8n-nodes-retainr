package delete

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/apierr"
	"github.com/retainr/api/internal/middleware"
)

type deleteCommand struct {
	Scope     string `json:"scope"`
	SessionID string `json:"session_id"`
	UserID    string `json:"user_id"`
	AgentID   string `json:"agent_id"`
}

func (c *deleteCommand) validate() error {
	// At least one filter required — prevent accidental workspace wipe
	if c.Scope == "" && c.SessionID == "" && c.UserID == "" && c.AgentID == "" {
		return fmt.Errorf("at least one filter (scope, session_id, user_id, or agent_id) is required")
	}
	return nil
}

type deleteResponse struct {
	Deleted int64 `json:"deleted"`
}

func Handler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())

		var cmd deleteCommand
		if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "Invalid request body")
			return
		}

		if err := cmd.validate(); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
			return
		}

		args := []any{wsID}
		filter := "WHERE workspace_id = $1"
		idx := 2

		if cmd.Scope != "" {
			filter += fmt.Sprintf(" AND scope = $%d", idx)
			args = append(args, cmd.Scope)
			idx++
		}
		if cmd.SessionID != "" {
			filter += fmt.Sprintf(" AND session_id = $%d", idx)
			args = append(args, cmd.SessionID)
			idx++
		}
		if cmd.UserID != "" {
			filter += fmt.Sprintf(" AND user_id = $%d", idx)
			args = append(args, cmd.UserID)
			idx++
		}
		if cmd.AgentID != "" {
			filter += fmt.Sprintf(" AND agent_id = $%d", idx)
			args = append(args, cmd.AgentID)
		}

		tag, err := pool.Exec(r.Context(), "DELETE FROM memories "+filter, args...)
		if err != nil {
			log.Error("delete memories", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to delete memories")
			return
		}

		deleted := tag.RowsAffected()
		log.Info("memories deleted",
			"workspace_id", wsID,
			"count", deleted,
			"scope", cmd.Scope,
			"session_id", cmd.SessionID,
			"user_id", cmd.UserID,
		)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(deleteResponse{Deleted: deleted})
	}
}
