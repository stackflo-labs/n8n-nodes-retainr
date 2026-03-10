package apikey

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/apierr"
	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/api/internal/platform/keys"
)

type createRequest struct {
	Name string `json:"name"`
}

type createResponse struct {
	KeyID     string    `json:"key_id"`
	Name      string    `json:"name"`
	APIKey    string    `json:"api_key"`
	CreatedAt time.Time `json:"created_at"`
}

func CreateHandler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())

		var req createRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "Invalid request body")
			return
		}

		req.Name = strings.TrimSpace(req.Name)
		if req.Name == "" {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "name is required")
			return
		}

		rawKey, keyHash, keyPrefix, err := keys.Generate()
		if err != nil {
			log.Error("generate api key", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to generate API key")
			return
		}

		var keyID string
		var createdAt time.Time
		err = pool.QueryRow(r.Context(), `
			INSERT INTO api_keys (workspace_id, name, key_hash, key_prefix)
			VALUES ($1, $2, $3, $4)
			RETURNING id::text, created_at
		`, wsID, req.Name, keyHash, keyPrefix).Scan(&keyID, &createdAt)

		if err != nil {
			log.Error("create api key", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to create API key")
			return
		}

		log.Info("api key created", "workspace_id", wsID, "key_id", keyID, "name", req.Name)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(createResponse{
			KeyID:     keyID,
			Name:      req.Name,
			APIKey:    rawKey,
			CreatedAt: createdAt,
		})
	}
}

func RevokeHandler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())
		keyID := chi.URLParam(r, "keyID")

		tag, err := pool.Exec(r.Context(), `
			DELETE FROM api_keys WHERE id = $1 AND workspace_id = $2
		`, keyID, wsID)

		if err != nil {
			log.Error("revoke api key", "workspace_id", wsID, "key_id", keyID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to revoke API key")
			return
		}

		if tag.RowsAffected() == 0 {
			apierr.Write(w, http.StatusNotFound, "not_found", "API key not found")
			return
		}

		log.Info("api key revoked", "workspace_id", wsID, "key_id", keyID)
		w.WriteHeader(http.StatusNoContent)
	}
}
