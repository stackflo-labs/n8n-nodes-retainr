# retainr

Persistent AI agent memory for Make.com, n8n, and Zapier automation workflows.

**Live:** [retainr.dev](https://retainr.dev) · **API:** `https://api.retainr.dev`

---

## What it does

retainr gives AI agents memory that persists across workflow executions. Install the n8n community node or Make.com module, add your API key, and your agents start remembering users, decisions, and context — automatically.

- **Store** — save any text as a memory with user/session scoping and tags
- **Search** — semantic similarity search via pgvector (not keyword matching)
- **Delete** — bulk-delete by user, session, or tag for GDPR compliance
- **PDF** — generate PDFs from HTML via headless Chromium (bonus module)

## Monorepo structure

```
apps/
  api/        Go API server (Chi, CQRS, pgvector)
  worker/     Background worker (TTL cleanup, PDF jobs)
  web/        Next.js marketing site + blog (retainr.dev)
packages/
  n8n-node/   n8n community node (npm: n8n-nodes-retainr)
infra/
  caddy/      Reverse proxy config
  scripts/    health-check.sh, backup.sh
  terraform/  Hetzner VPS + Cloudflare DNS
docs/
  API.md          Full API reference
  ARCHITECTURE.md System design
  ROADMAP.md      Milestones and revenue targets
  DECISIONS.md    Architecture decision log
```

## Dev setup

```bash
# Prerequisites: Go 1.22+, Node 20+, pnpm, Docker, task

task dev:infra      # Start PostgreSQL + pgvector
task dev:api        # Go API with hot reload (requires air)
task dev:worker     # Background worker
task dev:web        # Next.js dev server → http://localhost:3000
```

**First time:**
```bash
cp .env.example .env   # fill in VOYAGE_API_KEY, STRIPE_SECRET_KEY, etc.
task setup             # install Go tools + pnpm deps
```

## Key tasks

| Command | Description |
|---------|-------------|
| `task test` | Go tests with race detector |
| `task lint` | golangci-lint + prettier |
| `task build:api` | Compile API binary |
| `task deploy:production` | Build + rsync + restart on VPS |
| `task seo:lighthouse` | Lighthouse CI audit on web app |
| `task db:generate` | Regenerate sqlc types after schema change |

## API quick start

```bash
# Store a memory
curl -X POST https://api.retainr.dev/v1/memories \
  -H "Authorization: Bearer rec_live_..." \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers email over Slack", "user_id": "alice@example.com"}'

# Search memories
curl "https://api.retainr.dev/v1/memories/search?query=communication+preference&user_id=alice@example.com&limit=5" \
  -H "Authorization: Bearer rec_live_..."
```

Full reference: [retainr.dev/docs](https://retainr.dev/docs) or `docs/API.md`.

## Pricing

| Plan | Price | Memory ops/mo | PDFs/mo |
|------|-------|--------------|---------|
| Free | €0 | 1,000 | 10 |
| Builder | €29 | 20,000 | 200 |
| Pro | €79 | 100,000 | 2,000 |
| Agency | €199 | Unlimited | Unlimited |

## Tech stack

- **API** — Go, Chi, slog, goose, sqlc, argon2id
- **DB** — PostgreSQL 16 + pgvector (HNSW index, m=16)
- **Embeddings** — Voyage AI (`voyage-3-lite`, 1536 dims)
- **Web** — Next.js 16, Tailwind v4, contentlayer, next-mdx-remote
- **Infra** — Hetzner CX32, Caddy, systemd, GitHub Actions CI/CD
- **Billing** — Stripe · **Email** — Resend

## Operating rules

See [`CLAUDE.md`](CLAUDE.md) — autonomous operating rules for the Claude Code self-healing agent running on the VPS.
