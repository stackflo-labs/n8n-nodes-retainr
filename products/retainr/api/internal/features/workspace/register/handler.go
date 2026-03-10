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
	Name        string `json:"name"`
	Email       string `json:"email"`
	Platform    string `json:"platform"`
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
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

		attribution := buildAttribution(req)

		var workspaceID, keyID string
		err = pool.QueryRow(r.Context(), `
			WITH ws AS (
				INSERT INTO workspaces (name, email, signup_attribution)
				VALUES ($1, $2, $5)
				RETURNING id
			)
			INSERT INTO api_keys (workspace_id, name, key_hash, key_prefix)
			SELECT id, 'Default', $3, $4 FROM ws
			RETURNING workspace_id::text, id::text
		`, req.Name, req.Email, keyHash, keyPrefix, attribution).Scan(&workspaceID, &keyID)

		if err != nil {
			if strings.Contains(err.Error(), "unique") {
				apierr.Write(w, http.StatusConflict, "email_taken", "An account with this email already exists")
				return
			}
			log.Error("register workspace", "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Registration failed")
			return
		}

		log.Info("workspace registered", "workspace_id", workspaceID, "email", req.Email, "platform", req.Platform)

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

// buildAttribution serialises non-empty attribution fields to a JSON byte slice
// suitable for a PostgreSQL JSONB parameter. Returns nil when all fields are empty,
// which lets the DB store NULL rather than an empty object.
func buildAttribution(req registerRequest) []byte {
	m := make(map[string]string, 4)
	if req.Platform != "" {
		m["platform"] = req.Platform
	}
	if req.UTMSource != "" {
		m["utm_source"] = req.UTMSource
	}
	if req.UTMMedium != "" {
		m["utm_medium"] = req.UTMMedium
	}
	if req.UTMCampaign != "" {
		m["utm_campaign"] = req.UTMCampaign
	}
	if len(m) == 0 {
		return nil
	}
	b, _ := json.Marshal(m)
	return b
}
