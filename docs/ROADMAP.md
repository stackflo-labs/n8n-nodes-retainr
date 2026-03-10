# retainr.dev — Product Roadmap

## Vision

AI agent memory persistence API for automation platform users (Make.com, n8n, Zapier).
Target: €500/month MRR within 6 months, fully autonomous operation.

---

## Milestone 0 — Foundation (Week 1-2)

**Goal:** Working monorepo, local dev environment, CI pipeline.

### Infrastructure
- [x] Monorepo structure (Go workspace + pnpm workspace)
- [ ] Taskfile replacing Makefile
- [ ] Docker Compose for local dev (postgres + pgvector)
- [ ] golangci-lint + prettier pre-commit hooks
- [ ] GitHub Actions: test + lint on PR, deploy on `main` push

### Go API skeleton
- [ ] Chi router with middleware chain (RequestID → Auth → AuditLog → RateLimit)
- [ ] slog structured logging (JSON prod, text dev)
- [ ] Config loading from env (no third-party config library)
- [ ] Health check endpoint: `GET /health`
- [ ] Graceful shutdown (SIGTERM → drain → exit)
- [ ] goose migrations embedded, run on startup

### Database
- [ ] Migration 001: workspaces, api_keys, memories (pgvector)
- [ ] sqlc config + generated types
- [ ] Row Level Security policies on memories table
- [ ] HNSW index on embedding column

### Hetzner VPS
- [ ] CX32 provisioned (Ubuntu 24.04)
- [ ] Caddy installed + HTTPS for api.retainr.dev
- [ ] PostgreSQL 16 + pgvector extension
- [ ] systemd units for api + worker
- [ ] Daily backup cron to Hetzner Volume
- [ ] Claude Code installed, cron scripts in place

---

## Milestone 1 — FlowMemory MVP (Week 3-4)

**Goal:** Working memory API, authenticated, with semantic search.

### Core API
- [ ] `POST /v1/memories` — store memory with scope (session/user/agent/global)
- [ ] `POST /v1/memories/search` — cosine similarity search via pgvector
- [ ] `GET /v1/memories` — list with filters (scope, session_id, user_id, tags)
- [ ] `DELETE /v1/memories` — clear by scope/session/user (with workspace scoping)

### Auth
- [ ] `POST /v1/workspace/register` — create workspace + first API key
- [ ] `POST /v1/workspace/apikeys` — create named API key
- [ ] `DELETE /v1/workspace/apikeys/{id}` — revoke key
- [ ] API key format: `rec_live_<base58_32bytes>`
- [ ] Argon2id hashing, constant-time compare

### Embeddings
- [ ] Voyage AI client abstracted behind `platform/embeddings` interface
- [ ] Batch embedding on store (single API call per request)
- [ ] Fallback: if Voyage AI down, store without embedding + queue for retry

### Worker
- [ ] TTL cleanup job: delete expired memories (cron every hour)
- [ ] Embedding retry queue: `SELECT FOR UPDATE SKIP LOCKED` from pending_embeddings

### Rate Limiting
- [ ] Per-workspace: sliding window counter in PostgreSQL
- [ ] Free: 100 req/min, Builder: 500 req/min, Pro: 2000 req/min

---

## Milestone 2 — Dashboard + Billing (Week 4-5)

**Goal:** Self-service signup, plan management, usage visibility.

### Next.js Dashboard
- [ ] Landing page (retainr.dev)
  - [ ] Hero: "AI agent memory for Make.com and n8n"
  - [ ] Feature comparison table (vs building it yourself)
  - [ ] Pricing section
  - [ ] Code snippet: n8n node usage
  - [ ] Social proof placeholder
- [ ] Auth: magic link email (Resend) → session cookie
- [ ] Dashboard: API key management
- [ ] Dashboard: Usage graph (ops this month vs plan limit)
- [ ] Dashboard: Billing (Stripe Customer Portal embed)

### Stripe Integration
- [ ] Products: Free, Builder (€29), Pro (€79), Agency (€199)
- [ ] Checkout: `POST /v1/billing/checkout` → Stripe Checkout Session
- [ ] Webhook: `invoice.paid` → update plan, reset monthly counter
- [ ] Webhook: `customer.subscription.deleted` → downgrade to free
- [ ] Usage metering: increment `ops_this_month` on every API call

---

## Milestone 4 — Platform Integrations (Week 6-8)

**Goal:** Native nodes on all three platforms, templates published.

### n8n Community Node (`@retainr/n8n-nodes-retainr`)
- [ ] TypeScript node package
- [ ] Operations: Store Memory, Search Memory, List Memories, Delete Memories
- [ ] Credential type: API Key
- [ ] npm publish (`pnpm publish`)
- [ ] Submit to n8n community nodes list

### Make.com Community App
- [ ] JSON app definition
- [ ] Modules: Store Memory, Search Memory, List Memories, Delete Memories
- [ ] OAuth2 replaced by API Key auth (simpler for community apps)
- [ ] Submit to Make.com app marketplace (2-3 day approval)

### Zapier (post-revenue)
- [ ] Defer until 20 paying customers (Zapier requires 50 active users)
- [ ] Use Zapier CLI when ready

### Template Library (acquisition funnel)
- [ ] Pre-built memory workflows requiring retainr API key:
  - [ ] "Customer service AI with memory" (Make.com)
  - [ ] "Lead qualification agent that remembers context" (n8n)
  - [ ] "Shopify order follow-up with customer history" (Make.com)
  - [ ] "Email inbox AI assistant with long-term memory" (n8n)
  - [ ] "Sales CRM enrichment with AI notes" (Zapier)
- [ ] Each template: dedicated SEO landing page on retainr.dev/templates/<slug>
- [ ] Each template: JSON/blueprint download gated behind email capture

---

## Milestone 5 — Growth & Hardening (Month 3+)

**Goal:** SEO traction, reduce churn, expand integrations.

### SEO
- [ ] Blog: "How to add memory to your n8n AI agent" (targets "n8n ai memory")
- [ ] Blog: "Make.com AI chatbot with context persistence"
- [ ] Blog: "n8n vs Make.com for AI agents: memory handling compared"
- [ ] Submit sitemap, verify GSC property

### Reliability
- [ ] Uptime Robot monitoring → email on downtime > 2min
- [ ] pgvector query performance dashboard (query plan logging)
- [ ] Automatic Hetzner snapshot before every deploy

### Analytics (privacy-preserving)
- [ ] Umami Analytics on landing page — self-hosted, no cookies, GDPR compliant (replaces Plausible)
      - Docker Compose service added (prod + dev), accessible at analytics.retainr.dev
      - Add `<script async src="https://analytics.retainr.dev/script.js" data-website-id="...">` to layout.tsx after setting up Umami
- [ ] Internal metrics: daily active workspaces, ops/day, conversion rate

### Monitoring
- [ ] Uptime Robot free plan — monitor https://api.retainr.dev/health every 5 min, email alert on 2 min downtime
      Sign up at uptimerobot.com after VPS is live

### Expansion
- [ ] Bubble.io plugin (visual dev community, high WTP)
- [ ] Retool plugin
- [ ] REST API documentation site (Scalar or Redoc from OpenAPI spec)

---

## Revenue Targets

| Month | MRR Target | Paying Users Needed |
|---|---|---|
| 1 | €0 — building | — |
| 2 | €0 — integrations live | — |
| 3 | €58 | 2× Builder |
| 4 | €187 | 3× Builder + 1× Pro |
| 5 | €345 | 5× Builder + 2× Pro |
| 6 | €553 | 5× Builder + 4× Pro |

**Break-even estimate:** ~3 Pro subscribers cover VPS + API costs (~€35/month infra).

---

## Pricing

| Plan | Price | Memory Ops | Rate Limit |
|---|---|---|---|
| Free | €0 | 1,000/month | 100 req/min |
| Builder | €29/month | 20,000/month | 500 req/min |
| Pro | €79/month | 100,000/month | 2,000 req/min |
| Agency | €199/month | Unlimited | 5,000 req/min |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| n8n ships native memory node | Medium | High | Make.com + Zapier coverage, template lock-in |
| Voyage AI pricing/outage | Low | Medium | Abstracted interface, swap to OpenAI in one file |
| pgvector scaling cliff (1M+ vectors) | Low (Year 1) | Medium | Partition by workspace_id |
| Make.com policy change | Low | Medium | API is standalone, Make.com is one channel |
| Single VPS failure | Medium | High | Daily snapshots, Caddy auto-restart, Claude Code repair |
| GDPR complaint | Low | High | Privacy policy, DPA, erasure endpoint live at launch |
| Stripe Czech entity issues | Low | High | Verify before launch, Wise Business fallback |
