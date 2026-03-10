package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/retainr/platform/logger"
)

func main() {
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	log := logger.New(env)
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Info("worker started", "env", env)

	// TODO: register jobs
	// - TTL memory cleanup (runs every hour)
	// - PDF job processor (polls pdf_jobs WHERE status='pending')

	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Info("worker stopped gracefully")
			return
		case <-ticker.C:
			log.Debug("worker heartbeat")
		}
	}
}
