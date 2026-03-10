package migrate

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"log/slog"

	"github.com/pressly/goose/v3"
)

//go:embed *.sql
var migrations embed.FS

// Run applies all pending migrations. Called on app startup before accepting traffic.
// Uses a PostgreSQL advisory lock so concurrent callers (e.g. parallel test packages)
// wait rather than race on CREATE TABLE / CREATE EXTENSION.
func Run(ctx context.Context, db *sql.DB) error {
	// Advisory lock key: arbitrary fixed number used only for migrations
	const lockKey = 8675309

	if _, err := db.ExecContext(ctx, "SELECT pg_advisory_lock($1)", lockKey); err != nil {
		return fmt.Errorf("acquire migration lock: %w", err)
	}
	defer db.ExecContext(ctx, "SELECT pg_advisory_unlock($1)", lockKey) //nolint:errcheck

	goose.SetBaseFS(migrations)
	goose.SetLogger(goose.NopLogger())

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("goose set dialect: %w", err)
	}

	current, err := goose.GetDBVersion(db)
	if err != nil {
		return fmt.Errorf("goose get version: %w", err)
	}

	if err := goose.UpContext(ctx, db, "."); err != nil {
		return fmt.Errorf("goose up: %w", err)
	}

	next, _ := goose.GetDBVersion(db)
	if next != current {
		slog.Info("migrations applied", "from_version", current, "to_version", next)
	} else {
		slog.Debug("migrations up to date", "version", current)
	}

	return nil
}
