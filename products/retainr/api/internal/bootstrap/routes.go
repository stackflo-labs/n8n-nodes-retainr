package bootstrap

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/api/internal/platform/config"

	memorydel "github.com/retainr/api/internal/features/memory/delete"
	memorylist "github.com/retainr/api/internal/features/memory/list"
	memorysearch "github.com/retainr/api/internal/features/memory/search"
	memorystore "github.com/retainr/api/internal/features/memory/store"
	wskeyapi "github.com/retainr/api/internal/features/workspace/apikey"
	wsregister "github.com/retainr/api/internal/features/workspace/register"
)

func Routes(cfg config.Config, pool *pgxpool.Pool, log *slog.Logger) http.Handler {
	r := chi.NewRouter()

	// Global middleware (runs on every request)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.AuditLog(log, pool))

	// Health check — no auth
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Public: workspace registration (no API key required)
	r.Post("/v1/workspace/register", wsregister.Handler(pool, log))

	// Authenticated routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(pool, log))
		r.Use(middleware.RateLimit(pool, cfg))

		// Workspace / API key management
		r.Post("/v1/workspace/apikeys", wskeyapi.CreateHandler(pool, log))
		r.Delete("/v1/workspace/apikeys/{keyID}", wskeyapi.RevokeHandler(pool, log))

		// Memory API
		r.Post("/v1/memories", memorystore.Handler(pool, log, cfg.VoyageAPIKey))
		r.Post("/v1/memories/search", memorysearch.Handler(pool, log, cfg.VoyageAPIKey))
		r.Get("/v1/memories", memorylist.Handler(pool, log))
		r.Delete("/v1/memories", memorydel.Handler(pool, log))

	})

	return r
}
