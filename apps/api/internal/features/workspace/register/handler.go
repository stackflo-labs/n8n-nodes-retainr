package register

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/apierr"
	"github.com/retainr/api/internal/platform/keys"
)

type registerRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type registerResponse struct {
	WorkspaceID string `json:"workspace_id"`
	APIKey      string `json:"api_key"`
	KeyID       string `json:"key_id"`
	Plan        string `json:"plan"`
}

func Handler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req registerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "Invalid request body")
			return
		}

		req.Name = strings.TrimSpace(req.Name)
		req.Email = strings.ToLower(strings.TrimSpace(req.Email))

		if req.Name == "" || req.Email == "" {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "name and email are required")
			return
		}

		rawKey, keyHash, keyPrefix, err := keys.Generate()
		if err != nil {
			log.Error("generate api key", "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to generate API key")
			return
		}

		var workspaceID, keyID string
		err = pool.QueryRow(r.Context(), `
			WITH ws AS (
				INSERT INTO workspaces (name, email)
				VALUES ($1, $2)
				RETURNING id
			)
			INSERT INTO api_keys (workspace_id, name, key_hash, key_prefix)
			SELECT id, 'Default', $3, $4 FROM ws
			RETURNING workspace_id::text, id::text
		`, req.Name, req.Email, keyHash, keyPrefix).Scan(&workspaceID, &keyID)

		if err != nil {
			if strings.Contains(err.Error(), "unique") {
				apierr.Write(w, http.StatusConflict, "email_taken", "An account with this email already exists")
				return
			}
			log.Error("register workspace", "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Registration failed")
			return
		}

		log.Info("workspace registered", "workspace_id", workspaceID, "email", req.Email)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(registerResponse{
			WorkspaceID: workspaceID,
			APIKey:      rawKey,
			KeyID:       keyID,
			Plan:        "free",
		})
	}
}
