package middleware

import (
	"log/slog"
	"net/http"
	"time"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AuditLog logs every request after it completes with structured fields.
// It also asynchronously persists to audit_ops for compliance.
func AuditLog(log *slog.Logger, pool *pgxpool.Pool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := chimiddleware.NewWrapResponseWriter(w, r.ProtoMajor)

			next.ServeHTTP(ww, r)

			latency := time.Since(start)
			wsID := WorkspaceIDFromCtx(r.Context())
			reqID := chimiddleware.GetReqID(r.Context())

			log.Info("api.request",
				"request_id", reqID,
				"workspace_id", wsID,
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"latency_ms", latency.Milliseconds(),
				"bytes", ww.BytesWritten(),
			)

			// Persist audit record for authenticated requests
			if wsID != "" {
				go func() {
					pool.Exec(r.Context(), `
						INSERT INTO audit_ops (workspace_id, method, path, status_code, latency_ms, request_id)
						VALUES ($1, $2, $3, $4, $5, $6)
					`, wsID, r.Method, r.URL.Path, ww.Status(), latency.Milliseconds(), reqID)
				}()
			}
		})
	}
}
