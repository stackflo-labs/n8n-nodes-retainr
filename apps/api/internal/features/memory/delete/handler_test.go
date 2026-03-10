package delete_test

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	memdelete "github.com/retainr/api/internal/features/memory/delete"
	"github.com/retainr/api/internal/middleware"
	"github.com/retainr/api/internal/platform/db"
	"github.com/retainr/api/internal/platform/logger"
	"github.com/retainr/api/internal/platform/migrate"
)

func setupDB(t *testing.T) (*pgxpool.Pool, string) {
	t.Helper()
	pool, err := db.Pool(context.Background(), "postgres://retainr:retainr@localhost:5432/retainr_dev?sslmode=disable")
	if err != nil {
		t.Skipf("postgres not available: %v", err)
	}
	if err := migrate.Run(context.Background(), db.StdDB(pool)); err != nil {
		t.Fatalf("migration: %v", err)
	}
	var wsID string
	pool.QueryRow(context.Background(),
		`INSERT INTO workspaces (name, email) VALUES ('DelTest','delete-test@example.com')
		 ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id::text`,
	).Scan(&wsID)
	t.Cleanup(func() {
		pool.Exec(context.Background(), "DELETE FROM memories WHERE workspace_id = $1", wsID)
	})
	return pool, wsID
}

func withWorkspace(r *http.Request, wsID string) *http.Request {
	ctx := context.WithValue(r.Context(), middleware.CtxWorkspaceID, wsID)
	return r.WithContext(ctx)
}

func TestDeleteMemories_RequiresFilter(t *testing.T) {
	pool, wsID := setupDB(t)
	log := logger.New("test")
	h := memdelete.Handler(pool, log)

	req := httptest.NewRequest(http.MethodDelete, "/v1/memories", bytes.NewBufferString(`{}`))
	req = withWorkspace(req, wsID)
	w := httptest.NewRecorder()
	h(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("expected 422 when no filter given, got %d", w.Code)
	}
}

func TestDeleteMemories_BySession(t *testing.T) {
	pool, wsID := setupDB(t)
	log := logger.New("test")

	// Seed a memory
	pool.Exec(context.Background(),
		`INSERT INTO memories (workspace_id, scope, session_id, content)
		 VALUES ($1, 'session', 'sess_del', 'to be deleted')`, wsID)

	h := memdelete.Handler(pool, log)
	req := httptest.NewRequest(http.MethodDelete, "/v1/memories",
		bytes.NewBufferString(`{"scope":"session","session_id":"sess_del"}`))
	req = withWorkspace(req, wsID)
	w := httptest.NewRecorder()
	h(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}
