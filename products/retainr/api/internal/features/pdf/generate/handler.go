package generate

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/platform/apierr"
)

type generateCommand struct {
	TemplateName string         `json:"template"`
	TemplateHTML string         `json:"template_html"`
	Data         map[string]any `json:"data"`
	WebhookURL   string         `json:"webhook_url"`
}

func (c *generateCommand) validate() error {
	if c.TemplateName == "" && c.TemplateHTML == "" {
		return fmt.Errorf("template or template_html is required")
	}
	if c.Data == nil {
		return fmt.Errorf("data is required")
	}
	validTemplates := map[string]bool{"invoice": true, "purchase_order": true, "quote": true}
	if c.TemplateName != "" && !validTemplates[c.TemplateName] {
		return fmt.Errorf("unknown template '%s'. Use one of: invoice, purchase_order, quote", c.TemplateName)
	}
	return nil
}

type generateResponse struct {
	JobID            string `json:"job_id"`
	Status           string `json:"status"`
	EstimatedSeconds int    `json:"estimated_seconds"`
}

type jobStatusResponse struct {
	JobID       string     `json:"job_id"`
	Status      string     `json:"status"`
	ResultURL   *string    `json:"result_url,omitempty"`
	Error       *string    `json:"error,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

func Handler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())

		var cmd generateCommand
		if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", "Invalid request body")
			return
		}

		if err := cmd.validate(); err != nil {
			apierr.Write(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
			return
		}

		dataJSON, _ := json.Marshal(cmd.Data)

		var jobID string
		err := pool.QueryRow(r.Context(), `
			INSERT INTO pdf_jobs (workspace_id, template_name, template_html, data, webhook_url)
			VALUES ($1, NULLIF($2,''), NULLIF($3,''), $4, NULLIF($5,''))
			RETURNING id::text
		`, wsID, cmd.TemplateName, cmd.TemplateHTML, dataJSON, cmd.WebhookURL).Scan(&jobID)

		if err != nil {
			log.Error("create pdf job", "workspace_id", wsID, "error", err)
			apierr.Write(w, http.StatusInternalServerError, "internal_error", "Failed to create PDF job")
			return
		}

		log.Info("pdf job created", "workspace_id", wsID, "job_id", jobID, "template", cmd.TemplateName)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(generateResponse{
			JobID:            jobID,
			Status:           "pending",
			EstimatedSeconds: 5,
		})
	}
}

func StatusHandler(pool *pgxpool.Pool, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		wsID := middleware.WorkspaceIDFromCtx(r.Context())
		jobID := chi.URLParam(r, "jobID")

		var resp jobStatusResponse
		err := pool.QueryRow(r.Context(), `
			SELECT id::text, status, result_url, error_message, created_at,
			       CASE WHEN status IN ('complete','failed') THEN updated_at ELSE NULL END
			FROM pdf_jobs
			WHERE id = $1 AND workspace_id = $2
		`, jobID, wsID).Scan(
			&resp.JobID, &resp.Status, &resp.ResultURL, &resp.Error,
			&resp.CreatedAt, &resp.CompletedAt,
		)

		if err != nil {
			apierr.Write(w, http.StatusNotFound, "not_found", "PDF job not found")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}
