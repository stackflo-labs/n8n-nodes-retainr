package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/retainr/api/internal/platform/config"
)

// RateLimit enforces per-workspace sliding window rate limiting using PostgreSQL.
// At MVP scale this is sufficient; replace with Redis atomic ops if needed at > 50k req/day.
func RateLimit(pool *pgxpool.Pool, cfg config.Config) func(http.Handler) http.Handler {
	planLimits := map[string]int{
		"free":    cfg.RateLimitFreeRPM,
		"builder": cfg.RateLimitBuilderRPM,
		"pro":     cfg.RateLimitProRPM,
		"agency":  cfg.RateLimitAgencyRPM,
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			wsID := WorkspaceIDFromCtx(r.Context())
			plan := PlanFromCtx(r.Context())

			limit, ok := planLimits[plan]
			if !ok {
				limit = cfg.RateLimitFreeRPM
			}

			// Count requests in current 1-minute window
			var count int
			windowStart := time.Now().Add(-time.Minute).Unix()
			err := pool.QueryRow(r.Context(), `
				SELECT COUNT(*) FROM audit_ops
				WHERE workspace_id = $1
				  AND created_at > TO_TIMESTAMP($2)
			`, wsID, windowStart).Scan(&count)

			if err == nil && count >= limit {
				w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
				w.Header().Set("X-RateLimit-Remaining", "0")
				w.Header().Set("Retry-After", "60")
				writeError(w, http.StatusTooManyRequests, "rate_limit_exceeded",
					fmt.Sprintf("Rate limit of %d req/min exceeded. Upgrade your plan for higher limits.", limit))
				return
			}

			remaining := limit - count - 1
			if remaining < 0 {
				remaining = 0
			}
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

			next.ServeHTTP(w, r)
		})
	}
}
