package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	log := newLogger()
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	dsn := mustEnv("DATABASE_URL")
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Error("connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()
	log.Info("worker started")

	// Run jobs concurrently
	go runTTLCleanup(ctx, pool, log)
	go runPDFWorker(ctx, pool, log)

	<-ctx.Done()
	log.Info("worker shutting down")
}

// runTTLCleanup deletes expired memories every hour.
func runTTLCleanup(ctx context.Context, pool *pgxpool.Pool, log *slog.Logger) {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			tag, err := pool.Exec(ctx, "DELETE FROM memories WHERE ttl_at IS NOT NULL AND ttl_at < NOW()")
			if err != nil {
				log.Error("ttl cleanup", "error", err)
				continue
			}
			if tag.RowsAffected() > 0 {
				log.Info("ttl cleanup", "deleted", tag.RowsAffected())
			}
		}
	}
}

// runPDFWorker polls for pending PDF jobs and renders them.
func runPDFWorker(ctx context.Context, pool *pgxpool.Pool, log *slog.Logger) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := processPDFJob(ctx, pool, log); err != nil {
				log.Error("pdf worker", "error", err)
			}
		}
	}
}

// processPDFJob claims and processes one pending PDF job (SELECT FOR UPDATE SKIP LOCKED).
func processPDFJob(ctx context.Context, pool *pgxpool.Pool, log *slog.Logger) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var jobID, wsID string
	var templateName, templateHTML *string
	var dataJSON []byte
	var webhookURL *string

	err = tx.QueryRow(ctx, `
		SELECT id::text, workspace_id::text, template_name, template_html, data, webhook_url
		FROM pdf_jobs
		WHERE status = 'pending'
		ORDER BY created_at
		LIMIT 1
		FOR UPDATE SKIP LOCKED
	`).Scan(&jobID, &wsID, &templateName, &templateHTML, &dataJSON, &webhookURL)

	if err != nil {
		// No rows = no pending jobs, normal
		return nil
	}

	// Mark as processing
	tx.Exec(ctx, "UPDATE pdf_jobs SET status = 'processing', updated_at = NOW() WHERE id = $1", jobID)
	tx.Commit(ctx)

	log.Info("pdf job processing", "job_id", jobID, "workspace_id", wsID)

	// TODO: render PDF with chromedp
	// resultURL, err := renderPDF(ctx, templateName, templateHTML, dataJSON)
	// For now: mark complete with placeholder
	_, err = pool.Exec(ctx,
		"UPDATE pdf_jobs SET status = 'complete', result_url = $1, updated_at = NOW() WHERE id = $2",
		"https://placeholder.retainr.dev/pdf/"+jobID+".pdf", jobID)

	if err != nil {
		pool.Exec(ctx,
			"UPDATE pdf_jobs SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2",
			err.Error(), jobID)
		return err
	}

	// Fire webhook if configured
	if webhookURL != nil && *webhookURL != "" {
		go fireWebhook(ctx, *webhookURL, jobID, wsID, log)
	}

	return nil
}

func fireWebhook(ctx context.Context, url, jobID, wsID string, log *slog.Logger) {
	// TODO: POST webhook with HMAC signature
	log.Info("webhook fired", "job_id", jobID, "url", url)
}

func newLogger() *slog.Logger {
	env := os.Getenv("ENV")
	if env == "production" {
		return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	}
	return slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		slog.Error("required env var not set", "key", key)
		os.Exit(1)
	}
	return v
}
