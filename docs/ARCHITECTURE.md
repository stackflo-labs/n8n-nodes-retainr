# Architecture — retainr.dev

## Overview

Single-VPS architecture optimised for €0 → €1k MRR. No Kubernetes, no microservices.
Complexity is added only when revenue justifies it.

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Caddy (reverse proxy + automatic HTTPS)        │
│  api.retainr.dev → :8080                        │
│  retainr.dev     → :3000 (or Vercel)            │
└─────────────────────────────────────────────────┘
    │                           │
    ▼                           ▼
┌──────────────┐        ┌──────────────┐
│  Go API      │        │  Next.js     │
│  :8080       │        │  :3000       │
│              │        │              │
│  Chi router  │        │  Dashboard   │
│  CQRS slices │        │  Landing     │
└──────┬───────┘        └──────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  Go Worker   │
│  + pgvector  │  │              │
│              │  │  Embeddings  │
│  Workspaces  │  │  TTL cleanup │
│  API keys    │  │  PDF render  │
│  Memories    │  └──────┬───────┘
│  PDF jobs    │         │
└──────────────┘         ▼
                  ┌──────────────┐
                  │  Voyage AI   │  (embeddings)
                  │  Chromium    │  (PDF render)
                  │  Hetzner OS  │  (PDF storage)
                  └──────────────┘
```

## Request Flow — Memory Store

```
Client → POST /v1/memories
  │
  ├── middleware: RequestID (generate X-Request-ID)
  ├── middleware: Auth (hash API key → lookup workspace_id)
  ├── middleware: AuditLog (log after response: workspace, path, status, latency)
  ├── middleware: RateLimit (sliding window per workspace in PostgreSQL)
  │
  └── feature/memory/store handler
        │
        ├── parse + validate StoreCommand
        ├── call Voyage AI → get 1536-dim embedding
        ├── INSERT INTO memories (with embedding + metadata)
        ├── INSERT INTO audit_ops (for billing counter)
        └── return {id, created_at}
```

## CQRS Vertical Slices

Business logic is grouped by **feature + action**, not by layer.

```
internal/features/
├── memory/
│   ├── store/         ← POST /v1/memories
│   │   ├── command.go     (StoreCommand struct, validation)
│   │   └── handler.go     (HTTP handler, calls DB + Voyage AI)
│   ├── search/        ← POST /v1/memories/search
│   │   ├── command.go     (SearchCommand struct)
│   │   └── handler.go
│   ├── list/          ← GET /v1/memories
│   │   ├── query.go       (ListQuery struct, filters)
│   │   └── handler.go
│   └── delete/        ← DELETE /v1/memories
│       ├── command.go
│       └── handler.go
├── pdf/
│   └── generate/      ← POST /v1/pdf/generate
│       ├── command.go
│       └── handler.go
└── workspace/
    ├── register/      ← POST /v1/workspace/register
    └── apikey/        ← POST/DELETE /v1/workspace/apikeys
```

**Rule:** No shared service layer. Handlers depend on `*sql.DB` (via sqlc queries) and
platform interfaces (embeddings, storage). If two handlers share logic, extract to a named
helper in the same feature package — not a global "utils" package.

## Database Design

### Tenancy Model
Row-level tenancy: every table that holds customer data has `workspace_id UUID NOT NULL`.
PostgreSQL RLS enforces this as a safety net. Application code always filters by workspace_id
extracted from the authenticated API key — RLS is a second line of defence, not the primary one.

### Connection Pooling
`pgxpool` with:
- `MaxConns`: 20 (CX32 has 4 vCPUs, pg default is 100 max_connections)
- `MinConns`: 2
- `MaxConnLifetime`: 1 hour
- `HealthCheckPeriod`: 1 minute

### Job Queue (no Redis)
`SELECT ... FOR UPDATE SKIP LOCKED` on `pdf_jobs` and `pending_embeddings` tables.
Worker polls every 5 seconds. At MVP scale (< 100 jobs/hour) this is sufficient.
Upgrade path: add `pgmq` extension or external queue if > 10k jobs/day.

### Vector Search
pgvector HNSW index parameters:
- `m = 16` (default, good for cosine similarity)
- `ef_construction = 64` (default)
- `ef_search = 40` (set at query time for recall/speed tradeoff)

Query: `ORDER BY embedding <=> $1 LIMIT 10` with `workspace_id` filter applied BEFORE
vector search (pre-filter via exact match on workspace_id index).

## Authentication

API keys use Stripe-style format: `rec_live_<base58_32bytes>`

Storage: only the Argon2id hash is stored. The raw key is shown once at creation.

```
Lookup flow:
  raw_key from Authorization header
  → extract prefix (first 12 chars): "rec_live_xxxx"
  → SELECT * FROM api_keys WHERE key_prefix = $1  (fast, indexed)
  → argon2id.Verify(raw_key, stored_hash)
  → if ok: attach workspace_id to request context
```

## Middleware Chain

```go
r.Use(middleware.RequestID)      // generate X-Request-ID
r.Use(middleware.Recoverer)      // catch panics, return 500
r.Use(middleware.RealIP)         // trust X-Forwarded-For behind Caddy
r.Use(middleware.Auth(db))       // validate API key, set workspace in ctx
r.Use(middleware.AuditLog(log))  // structured log every request post-handler
r.Use(middleware.RateLimit(db))  // per-workspace sliding window
```

## Embeddings Interface

Abstracted so Voyage AI can be swapped without touching feature code:

```go
type Embedder interface {
    Embed(ctx context.Context, text string) ([]float32, error)
    EmbedBatch(ctx context.Context, texts []string) ([][]float32, error)
}
```

Implementations: `VoyageEmbedder`, `OpenAIEmbedder` (fallback), `NoopEmbedder` (testing).

## Storage Interface (PDFs)

```go
type ObjectStore interface {
    Put(ctx context.Context, key string, r io.Reader, contentType string) error
    PresignedURL(ctx context.Context, key string, ttl time.Duration) (string, error)
}
```

Implementation: `HetznerObjectStore` (S3-compatible). Testing: `MemoryObjectStore`.

## Structured Logging

All logs use `log/slog` with these standard fields:

| Field | Type | When |
|---|---|---|
| `request_id` | string | Every request |
| `workspace_id` | string | Every authenticated request |
| `method` | string | Every request |
| `path` | string | Every request |
| `status` | int | Every request (post-handler) |
| `latency_ms` | int64 | Every request |
| `error` | string | On error |
| `memory_id` | string | Memory operations |
| `job_id` | string | PDF operations |

Log format: JSON in production (stdout → systemd journal), text in development.

## Error Handling

HTTP errors use a consistent JSON envelope:

```json
{
  "error": {
    "code": "memory_not_found",
    "message": "No memory found with the given filters",
    "request_id": "01HX..."
  }
}
```

Error codes are kebab-case strings (not HTTP status numbers) — clients should match on `code`.

## Self-Healing

Claude Code runs on VPS with two triggers:

1. **Health check cron** (`*/15 * * * *`): curl `/health`, check error rate in logs.
   If health fails: read logs → fix → test → deploy.

2. **Explicit repair** (`/opt/retainr/scripts/repair.sh`): triggered manually or by
   monitoring alert. Runs full Claude Code session with log context.

Scope of autonomous repair:
- ✅ Fix compilation errors, test failures, lint issues
- ✅ Restart crashed services
- ✅ Roll back bad deploys
- ✅ Fix dependency version conflicts
- ❌ Structural refactors (escalate to owner)
- ❌ Data migrations on production (escalate to owner)
- ❌ Billing/Stripe logic changes (escalate to owner)

## CI/CD Pipeline

```
git push origin main
    │
    ▼
GitHub Actions: test.yml
    ├── go test ./... -race
    ├── golangci-lint
    └── pnpm test (web)
         │
         ▼ (on success)
GitHub Actions: deploy.yml
    ├── Build Go binary
    ├── rsync to Hetzner VPS
    ├── SSH: systemctl restart retainr-api retainr-worker
    └── Health check: curl https://api.retainr.dev/health
```

## Cost Model

| Service | Monthly Cost | Notes |
|---|---|---|
| Hetzner CX32 | ~€10 | 4 vCPU, 8GB RAM |
| Hetzner Volume (50GB) | ~€2.5 | Backups + PDF storage |
| Voyage AI | ~€0.5 | $0.02/1M tokens, ~25M tokens at 1k ops |
| Resend | €0 | Free tier: 3k emails/month |
| Uptime Robot | €0 | Free tier: 50 monitors |
| Stripe | 1.4% + €0.25 per transaction | EU cards |
| **Total at 0 customers** | **~€13/month** | |
| **Total at 10 paying customers** | **~€18/month** | Stripe fees variable |

Break-even: 1 Builder subscriber (€29) covers infrastructure costs.
