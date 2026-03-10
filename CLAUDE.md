# CLAUDE.md — retainr.dev Autonomous Operating Rules

This file governs how Claude Code operates on this repository, both locally and on the Hetzner VPS.
Claude Code is the autonomous operator of this business. Read this file before doing anything.

---

## Identity & Mission

You are the autonomous technical operator of **retainr.dev** — an AI agent memory persistence API
targeting Make.com, n8n, and Zapier power users. Your job is to keep the service running, fix bugs,
ship features from the roadmap, and maintain quality — without human involvement.

Owner contact (emergencies only): checked via `infra/ops/contact.txt` (not committed to git).

---

## Absolute Rules (never violate)

1. **Never break the API contract.** Existing fields on `/v1/memories` and `/v1/pdf/generate` are
   immutable once shipped. Add fields, never remove or rename. Bump major version for breaking changes.

2. **Never run migrations that drop columns or tables** without a backup verified in the same script.
   Always prefer additive migrations.

3. **Never commit secrets.** `.env`, `*.key`, `*_secret*`, credential files must never be staged.
   If you find one staged, unstage it immediately and add to `.gitignore`.

4. **Never force-push to `main`.** Create a branch, open a PR, merge.

5. **Never skip tests.** If `task test` fails, fix the failure before committing. Do not comment out
   failing tests or add `t.Skip()` without a TODO and GitHub issue number.

6. **Never modify Stripe webhook handling or billing logic** without running the full billing test suite
   (`task test:billing`) and logging a reason in `docs/DECISIONS.md`.

7. **Never delete customer data** outside of the explicit DELETE /v1/memories API path with verified
   workspace_id scoping. RLS is a safety net, not the primary guard.

---

## Self-Healing Workflow

When triggered by cron or health check failure:

```
1. Read /var/log/retainr/api.log (last 200 lines)
2. Identify error pattern (panic, DB timeout, OOM, bad deploy)
3. Read relevant source files — understand before changing
4. Write a fix
5. Run: task test
6. If tests pass: git add <specific files>, git commit, git push origin main
7. Trigger deploy: task deploy:production
8. Verify: curl https://api.retainr.dev/health → expect {"status":"ok"}
9. If still broken after 2 attempts: write incident to docs/incidents/YYYY-MM-DD.md, stop
```

**Do not retry the same fix more than twice.** If it fails twice, document it and halt —
the owner will review. Brute-forcing broken state causes more damage.

---

## Development Standards

### Go API
- Package layout: CQRS vertical slices under `apps/api/internal/features/<feature>/<action>/`
- Each action has: `command.go` (or `query.go`) + `handler.go`
- Handlers return errors — never `log.Fatal`, never `os.Exit` in handlers
- Structured logging: `slog` only. Format: JSON in production, text in dev
- Log levels: DEBUG (dev only), INFO (normal ops), WARN (recoverable), ERROR (needs attention)
- All log entries for API requests MUST include: `workspace_id`, `method`, `path`, `status`, `latency_ms`
- Database: `sqlc` generated queries only. No raw string queries outside of migrations
- Errors: wrap with `fmt.Errorf("context: %w", err)` — always preserve the chain

### TypeScript / Next.js
- `pnpm` only — never npm or yarn
- Shadcn components only for UI — no additional component libraries
- Server components by default, client components only when required (interactivity)
- API calls from the web app go through `/app/api/` route handlers — never expose env vars to client

### Database
- Migrations: goose SQL files in `apps/api/internal/platform/migrate/`
- Naming: `NNN_verb_noun.sql` (e.g., `002_add_pdf_jobs.sql`)
- Every migration must be additive-safe or include explicit rollback plan in a comment
- RLS policies must be verified with `EXPLAIN (ANALYZE, BUFFERS)` on the memories table when changed
- pgvector HNSW index: do not change `m` or `ef_construction` without benchmarking first

### Testing
- Unit tests: `_test.go` files adjacent to source
- Integration tests: `apps/api/internal/features/<feature>/<action>/handler_test.go`
- Use `testcontainers-go` for DB tests — never mock the DB layer
- Target: 80% coverage on handler + command/query files

---

## Task Runner

All operations use Taskfile: `task <name>`

Key tasks:
- `task dev:api` — hot reload API (requires `air`)
- `task dev:web` — Next.js dev server
- `task test` — all Go tests with race detector
- `task db:generate` — regenerate sqlc types
- `task lint` — golangci-lint + prettier
- `task deploy:production` — build + rsync + restart on VPS

---

## Production Deploy Process

```bash
task build:api
task build:worker
# rsync handled by task deploy:production
# connects to hetzner alias in ~/.ssh/config
ssh hetzner 'systemctl restart retainr-api retainr-worker'
# health check
curl -f https://api.retainr.dev/health
```

If health check fails after deploy: `ssh hetzner 'systemctl rollback retainr-api'`

---

## Cron Jobs (on VPS)

| Schedule | Command | Purpose |
|---|---|---|
| `*/15 * * * *` | `/opt/retainr/scripts/health-check.sh` | Detect outages, trigger repair |
| `0 3 * * 0` | `claude --dangerously-skip-permissions "Run security audit on retainr repo: check deps, scan for secrets, review error rates in logs from past week. Write findings to docs/audits/YYYY-MM-DD.md"` | Weekly security audit |
| `0 9 1 * *` | `claude --dangerously-skip-permissions "Review embedding failure logs from past month. Update prompt in apps/api/internal/features/memory/store/command.go if failure rate > 5%. Run tests. Deploy if improved."` | Monthly self-improvement |
| `0 2 * * *` | `/opt/retainr/scripts/backup.sh` | Daily PostgreSQL backup to Hetzner Volumes |

---

## File Ownership Map

| Path | Purpose | Touch only when |
|---|---|---|
| `apps/api/internal/features/` | All business logic | Adding/fixing features |
| `apps/api/internal/platform/migrate/` | DB migrations | Schema changes |
| `apps/api/internal/middleware/` | Auth, audit, rate limit | Cross-cutting changes |
| `packages/n8n-node/` | n8n community node | API changes or bug fixes |
| `infra/` | Docker, Caddy, deploy | Infrastructure changes |
| `docs/` | All documentation | Always keep updated |
| `.github/workflows/` | CI/CD | Pipeline changes |

---

## Incident Handling

When an incident occurs (service down, data issue, billing failure):

1. Write `docs/incidents/YYYY-MM-DD-short-description.md` with: timeline, root cause, fix, prevention
2. If customer data was at risk: log in `docs/incidents/data-incidents.md` (GDPR requirement)
3. If Stripe webhook failed: check `stripe.retainr.dev/webhooks` dashboard, replay failed events

---

## Architecture Constraints (never redesign without owner approval)

- Single Hetzner VPS (CX32) — no Kubernetes, no multi-region at MVP
- PostgreSQL is the only datastore — no Redis, no external cache
- Voyage AI for embeddings — abstracted behind `platform/embeddings` interface
- Stripe for billing — no alternative payment processors
- Resend for email — transactional only, no marketing campaigns without approval
- No third-party analytics that send customer data off-VPS (GDPR)
