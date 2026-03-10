package bootstrap

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/retainr/api/internal/platform/config"
	"github.com/retainr/api/internal/platform/db"
	"github.com/retainr/api/internal/platform/migrate"
)

func Run(ctx context.Context, cfg config.Config, log *slog.Logger) error {
	// Database
	pool, err := db.Pool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("connect to database: %w", err)
	}
	defer pool.Close()
	log.Info("database connected")

	// Migrations: run before accepting traffic
	stdDB := db.StdDB(pool)
	if err := migrate.Run(ctx, stdDB); err != nil {
		return fmt.Errorf("run migrations: %w", err)
	}

	// HTTP server
	router := Routes(cfg, pool, log)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine, block on context cancellation
	errCh := make(chan error, 1)
	go func() {
		log.Info("server listening", "port", cfg.Port, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		log.Info("shutdown signal received, draining connections")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	case err := <-errCh:
		return err
	}
}
