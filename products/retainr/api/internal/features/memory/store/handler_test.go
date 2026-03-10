package store_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/retainr/api/internal/features/memory/store"
	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/api/internal/platform/db"
	"github.com/retainr/platform/logger"
	"github.com/retainr/api/internal/platform/migrate"
)

func setupDB(t *testing.T) (*pgxpool.Pool, string) {
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

	// Create a test workspace (idempotent)
	var wsID string
	pool.QueryRow(context.Background(),
		`INSERT INTO workspaces (name, email) VALUES ('Test', 'store-test@example.com')
		 ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id::text`,
	).Scan(&wsID)

	t.Cleanup(func() {
		pool.Exec(context.Background(), "DELETE FROM memories WHERE workspace_id = $1", wsID)
	})
	return pool, wsID
}

func withWorkspace(req *http.Request, wsID string) *http.Request {
	ctx := context.WithValue(req.Context(), middleware.CtxWorkspaceID, wsID)
	ctx = context.WithValue(ctx, middleware.CtxPlan, "free")
	return req.WithContext(ctx)
}

func TestStoreMemory_UserScope(t *testing.T) {
	pool, wsID := setupDB(t)
	log := logger.New("test")

	// Use noop embedder via empty voyage key (will fall back gracefully)
	h := store.Handler(pool, log, "noop_key_for_test")

	body := `{
		"content": "User prefers dark mode",
		"scope": "user",
		"user_id": "user_abc",
		"tags": ["preference","ui"]
	}`
	req := httptest.NewRequest(http.MethodPost, "/v1/memories", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req = withWorkspace(req, wsID)

	w := httptest.NewRecorder()
	h(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.NewDecoder(w.Body).Decode(&resp)
	if resp["id"] == "" {
		t.Error("expected id in response")
	}
	if resp["scope"] != "user" {
		t.Errorf("expected scope=user, got: %v", resp["scope"])
	}
}

func TestStoreMemory_ValidationErrors(t *testing.T) {
	pool, wsID := setupDB(t)
	log := logger.New("test")
	h := store.Handler(pool, log, "noop")

	cases := []struct {
		name string
		body string
	}{
		{"missing content", `{"scope":"user","user_id":"x"}`},
		{"invalid scope", `{"content":"hi","scope":"invalid"}`},
		{"user scope without user_id", `{"content":"hi","scope":"user"}`},
		{"session scope without session_id", `{"content":"hi","scope":"session"}`},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/v1/memories", bytes.NewBufferString(tc.body))
			req.Header.Set("Content-Type", "application/json")
			req = withWorkspace(req, wsID)
			w := httptest.NewRecorder()
			h(w, req)
			if w.Code != http.StatusUnprocessableEntity {
				t.Errorf("expected 422, got %d: %s", w.Code, w.Body.String())
			}
		})
	}
}

func TestStoreMemory_WithTTL(t *testing.T) {
	pool, wsID := setupDB(t)
	log := logger.New("test")
	h := store.Handler(pool, log, "noop")

	ttl := 3600
	body, _ := json.Marshal(map[string]any{
		"content":     "Temporary session note",
		"scope":       "session",
		"session_id":  "sess_123",
		"ttl_seconds": ttl,
	})

	req := httptest.NewRequest(http.MethodPost, "/v1/memories", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req = withWorkspace(req, wsID)
	w := httptest.NewRecorder()
	h(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.NewDecoder(w.Body).Decode(&resp)
	if resp["ttl_at"] == nil {
		t.Error("expected ttl_at in response when ttl_seconds > 0")
	}
}
