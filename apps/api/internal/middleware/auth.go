package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"log/slog"

	"github.com/alexedwards/argon2id"
	"github.com/jackc/pgx/v5/pgxpool"
)

type contextKey string

const (
	CtxWorkspaceID contextKey = "workspace_id"
	CtxPlan        contextKey = "plan"
)

type apiKeyRow struct {
	WorkspaceID string
	KeyHash     string
	Plan        string
}

// Auth validates the Bearer API key and injects workspace_id + plan into context.
func Auth(pool *pgxpool.Pool, log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			rawKey := extractBearerToken(r)
			if rawKey == "" {
				writeError(w, http.StatusUnauthorized, "unauthorized", "Missing or malformed Authorization header")
				return
			}

			if len(rawKey) < 12 {
				writeError(w, http.StatusUnauthorized, "unauthorized", "Invalid API key format")
				return
			}
			prefix := rawKey[:12]

			var row apiKeyRow
			err := pool.QueryRow(r.Context(), `
				SELECT ak.key_hash, ak.workspace_id, w.plan
				FROM api_keys ak
				JOIN workspaces w ON w.id = ak.workspace_id
				WHERE ak.key_prefix = $1
			`, prefix).Scan(&row.KeyHash, &row.WorkspaceID, &row.Plan)

			if err != nil {
				writeError(w, http.StatusUnauthorized, "unauthorized", "Invalid API key")
				return
			}

			match, err := argon2id.ComparePasswordAndHash(rawKey, row.KeyHash)
			if err != nil || !match {
				writeError(w, http.StatusUnauthorized, "unauthorized", "Invalid API key")
				return
			}

			// Update last_used_at asynchronously — don't block the request
			go func() {
				pool.Exec(context.Background(),
					"UPDATE api_keys SET last_used_at = NOW() WHERE key_prefix = $1", prefix)
			}()

			ctx := context.WithValue(r.Context(), CtxWorkspaceID, row.WorkspaceID)
			ctx = context.WithValue(ctx, CtxPlan, row.Plan)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func extractBearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}

func WorkspaceIDFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(CtxWorkspaceID).(string)
	return v
}

func PlanFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(CtxPlan).(string)
	if v == "" {
		return "free"
	}
	return v
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]any{
			"code":    code,
			"message": message,
		},
	})
}
