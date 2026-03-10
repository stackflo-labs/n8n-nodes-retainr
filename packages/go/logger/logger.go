// Package logger provides structured slog setup for retainr platform services.
package logger

import (
	"log/slog"
	"os"
)

// New returns a configured *slog.Logger.
// Production: JSON handler at INFO level.
// Development: text handler at DEBUG level with source locations.
func New(env string) *slog.Logger {
	opts := &slog.HandlerOptions{
		Level:     slog.LevelDebug,
		AddSource: env != "production",
	}

	var handler slog.Handler
	if env == "production" {
		opts.Level = slog.LevelInfo
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler)
}
