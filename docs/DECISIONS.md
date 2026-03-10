# Architecture Decision Log

Append-only. Never edit past decisions — add new entries to supersede them.

---

## 2026-03-10 — No Redis

**Decision:** Eliminate Redis entirely. Use PostgreSQL for all state.

**Rationale:**
- Job queue: `SELECT FOR UPDATE SKIP LOCKED` is sufficient at < 10k jobs/day
- Rate limiting: sliding window counter in `workspaces` table, fine at MVP scale
- Pub/sub: `pg_notify` for job completion events
- This removes an entire infrastructure dependency and attack surface

**Revisit when:** sustained > 50k req/day or job queue backlog > 1000 items at peak

---

## 2026-03-10 — slog for structured logging

**Decision:** Use Go stdlib `log/slog` (introduced in Go 1.21).

**Rationale:**
- Zero external dependencies
- Structured JSON output in production, human-readable text in dev
- Integrates natively with context propagation
- Sufficient performance for our scale

**Rejected:** zerolog (faster but external dep), zap (complex setup, external dep)

---

## 2026-03-10 — CQRS vertical slices

**Decision:** Organise business logic by feature+action, not by layer.

**Rationale:**
- Avoids "service hell" where a single UserService has 40 methods
- Each slice is independently readable and testable
- Consistent with how Claude Code can autonomously navigate and repair code
- No cross-feature dependencies enforced by package structure

---

## 2026-03-10 — goose migrations embedded in binary

**Decision:** Embed SQL migrations in the Go binary using `embed.FS`, run on startup.

**Rationale:**
- Eliminates "migration not run" class of production bugs
- Deploy is atomic: new binary = new schema
- goose is idempotent (tracks applied migrations in `goose_db_version` table)

**Risk:** long migrations block startup. Mitigation: keep migrations additive and fast.
For data migrations that take > 1s, run as a separate offline task.

---

## 2026-03-10 — Voyage AI for embeddings

**Decision:** Use Voyage AI (`voyage-3-lite` model) for text embeddings.

**Rationale:**
- Recommended by Anthropic for RAG use cases
- $0.02/1M tokens — cheapest quality option
- 1536 dimensions matches our pgvector index
- Abstracted behind `Embedder` interface — can swap in 1 file

**Fallback:** OpenAI `text-embedding-3-small` if Voyage AI is unavailable

---

## 2026-03-10 — Taskfile replaces Makefile

**Decision:** Use Taskfile (Go-based, `task` CLI) instead of GNU Make.

**Rationale:**
- Native on Windows (user is on Windows 11)
- Better dependency specification between tasks
- No shell portability issues
- `task --list` self-documents available commands

---

## 2026-03-10 — Single Hetzner VPS (CX32)

**Decision:** Deploy everything on one Hetzner CX32 (4 vCPU, 8GB, ~€10/month).

**Rationale:**
- €0 → €500 MRR does not require distributed systems
- Simpler Claude Code self-healing (one host, clear log location)
- Hetzner SLA: 99.9% uptime
- Upgrade path: CX52 (8 vCPU, 16GB, ~€17/month) before any refactoring

**Rejected:** Fly.io (harder to SSH + Claude Code), Railway (more expensive at scale),
Kubernetes (massive over-engineering for MVP)
