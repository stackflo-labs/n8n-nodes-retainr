package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/retainr/api/internal/bootstrap"
	"github.com/retainr/api/internal/platform/config"
	"github.com/retainr/api/internal/platform/logger"
)

func main() {
	cfg := config.Load()
	log := logger.New(cfg.Env)
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := bootstrap.Run(ctx, cfg, log); err != nil {
		log.Error("server exited with error", "error", err)
		os.Exit(1)
	}

	log.Info("server stopped gracefully")
}
