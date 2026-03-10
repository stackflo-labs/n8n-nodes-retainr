package register_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/retainr/api/internal/features/workspace/register"
	"github.com/retainr/api/internal/platform/migrate"
	"github.com/retainr/api/internal/platform/db"
	"github.com/retainr/platform/logger"
)

func setupDB(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := "postgres://retainr:retainr@localhost:5432/retainr_dev?sslmode=disable"
	pool, err := db.Pool(context.Background(), dsn)
	if err != nil {
		t.Skipf("postgres not available: %v", err)
	}
	stdDB := db.StdDB(pool)
	if err := migrate.Run(context.Background(), stdDB); err != nil {
		t.Fatalf("migration failed: %v", err)
	}
	t.Cleanup(func() {
		pool.Exec(context.Background(), "DELETE FROM api_keys WHERE workspace_id IN (SELECT id FROM workspaces WHERE email LIKE '%-register@example.com')")
		pool.Exec(context.Background(), "DELETE FROM workspaces WHERE email LIKE '%-register@example.com'")
	})
	return pool
}

func TestRegisterWorkspace(t *testing.T) {
	pool := setupDB(t)
	log := logger.New("test")
	h := register.Handler(pool, log)

	body := `{"name":"Test Workspace","email":"test-register@example.com"}`
	req := httptest.NewRequest(http.MethodPost, "/v1/workspace/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.NewDecoder(w.Body).Decode(&resp)

	if resp["workspace_id"] == "" {
		t.Error("expected workspace_id in response")
	}
	apiKey, _ := resp["api_key"].(string)
	if len(apiKey) < 12 || apiKey[:9] != "rec_live_" {
		t.Errorf("expected API key starting with rec_live_, got: %s", apiKey)
	}
	if resp["plan"] != "free" {
		t.Errorf("expected plan=free, got: %v", resp["plan"])
	}
}

func TestRegisterWorkspace_DuplicateEmail(t *testing.T) {
	pool := setupDB(t)
	log := logger.New("test")
	h := register.Handler(pool, log)

	body := `{"name":"Dupe","email":"dupe-register@example.com"}`

	for i, wantCode := range []int{http.StatusCreated, http.StatusConflict} {
		req := httptest.NewRequest(http.MethodPost, "/v1/workspace/register", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		h(w, req)
		if w.Code != wantCode {
			t.Fatalf("request %d: expected %d, got %d: %s", i+1, wantCode, w.Code, w.Body.String())
		}
	}
}

func TestRegisterWorkspace_MissingFields(t *testing.T) {
	pool := setupDB(t)
	log := logger.New("test")
	h := register.Handler(pool, log)

	cases := []struct {
		name string
		body string
	}{
		{"missing email", `{"name":"Test"}`},
		{"missing name", `{"email":"x@x.com"}`},
		{"empty body", `{}`},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/v1/workspace/register", bytes.NewBufferString(tc.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			h(w, req)
			if w.Code != http.StatusUnprocessableEntity {
				t.Errorf("expected 422, got %d", w.Code)
			}
		})
	}
}
