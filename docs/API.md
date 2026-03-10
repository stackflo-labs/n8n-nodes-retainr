# API Reference — retainr.dev

Base URL: `https://api.retainr.dev`

All requests require: `Authorization: Bearer rec_live_<key>`

All responses: `Content-Type: application/json`

---

## Authentication

### Register Workspace
`POST /v1/workspace/register`

Creates a new workspace and returns the first API key.
**The raw key is only shown once — store it immediately.**

**Request:**
```json
{
  "name": "My Automation Studio",
  "email": "user@example.com"
}
```

**Response `201`:**
```json
{
  "workspace_id": "018e1234-...",
  "api_key": "rec_live_4xKj9mN2pQrS...",
  "key_id": "018e5678-...",
  "plan": "free"
}
```

---

### Create API Key
`POST /v1/workspace/apikeys`

**Request:**
```json
{
  "name": "Production n8n"
}
```

**Response `201`:**
```json
{
  "key_id": "018e...",
  "name": "Production n8n",
  "api_key": "rec_live_...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Revoke API Key
`DELETE /v1/workspace/apikeys/{key_id}`

**Response `204`** (no body)

---

## FlowMemory — Memory API

### Store Memory
`POST /v1/memories`

Stores a memory entry. The content is automatically embedded for semantic search.

**Request:**
```json
{
  "content": "User prefers formal tone and always asks about pricing first",
  "scope": "user",
  "user_id": "user_123",
  "session_id": "session_abc",
  "agent_id": "sales_agent",
  "metadata": {
    "source": "conversation",
    "confidence": 0.95
  },
  "tags": ["preference", "communication-style"],
  "ttl_seconds": 2592000
}
```

**Scope values:**
- `session` — scoped to a single workflow run (use `session_id`)
- `user` — persists across sessions for a user (use `user_id`)
- `agent` — shared across all users for an agent (use `agent_id`)
- `global` — shared across the entire workspace

**Response `201`:**
```json
{
  "id": "018e9abc-...",
  "workspace_id": "018e1234-...",
  "scope": "user",
  "user_id": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "ttl_at": "2024-02-01T00:00:00Z"
}
```

---

### Search Memories (Semantic)
`POST /v1/memories/search`

Returns memories ranked by semantic similarity to the query.

**Request:**
```json
{
  "query": "what does this user prefer?",
  "scope": "user",
  "user_id": "user_123",
  "limit": 5,
  "threshold": 0.7
}
```

**Response `200`:**
```json
{
  "results": [
    {
      "id": "018e9abc-...",
      "content": "User prefers formal tone...",
      "score": 0.94,
      "scope": "user",
      "user_id": "user_123",
      "metadata": {"source": "conversation"},
      "tags": ["preference"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### List Memories
`GET /v1/memories`

Exact-match filtering (not semantic). For browsing and management.

**Query parameters:**
- `scope` — filter by scope
- `user_id` — filter by user
- `session_id` — filter by session
- `agent_id` — filter by agent
- `tags` — comma-separated tag filter
- `limit` — default 20, max 100
- `offset` — pagination offset

**Response `200`:**
```json
{
  "memories": [...],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### Delete Memories
`DELETE /v1/memories`

Deletes all memories matching the filter. Requires at least one filter.

**Request:**
```json
{
  "scope": "session",
  "session_id": "session_abc"
}
```

**Response `200`:**
```json
{
  "deleted": 7
}
```

---

## FlowPDF — PDF Generation API

### Generate PDF
`POST /v1/pdf/generate`

Submits an async PDF generation job.

**Request:**
```json
{
  "template": "invoice",
  "data": {
    "invoice_number": "INV-001",
    "client_name": "Acme Corp",
    "items": [
      {"description": "Consulting", "quantity": 10, "unit_price": 150}
    ],
    "currency": "EUR"
  },
  "webhook_url": "https://yourserver.com/webhook/pdf-done"
}
```

**Built-in templates:** `invoice`, `purchase_order`, `quote`

**Custom templates:** pass `template_html` (Handlebars string) instead of `template`.

**Response `202`:**
```json
{
  "job_id": "018edef0-...",
  "status": "pending",
  "estimated_seconds": 5
}
```

---

### Get PDF Job Status
`GET /v1/pdf/jobs/{job_id}`

**Response `200`:**
```json
{
  "job_id": "018edef0-...",
  "status": "complete",
  "result_url": "https://storage.retainr.dev/pdfs/018edef0-....pdf?expires=...",
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:00:05Z"
}
```

Status values: `pending`, `processing`, `complete`, `failed`

Result URL expires after 24 hours. Re-poll to get a fresh URL.

---

## Errors

All errors follow this envelope:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded 100 requests per minute. Upgrade to Builder for 500 req/min.",
    "request_id": "01HX...",
    "retry_after": 23
  }
}
```

**Error codes:**

| Code | HTTP | Description |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid API key |
| `forbidden` | 403 | Key exists but workspace is suspended |
| `not_found` | 404 | Resource not found |
| `validation_error` | 422 | Request body failed validation |
| `rate_limit_exceeded` | 429 | Per-minute limit hit |
| `plan_limit_exceeded` | 429 | Monthly op limit hit |
| `embedding_unavailable` | 503 | Voyage AI temporarily unavailable |
| `internal_error` | 500 | Unexpected server error |

---

## Rate Limits

| Plan | Requests/min | Monthly Ops |
|---|---|---|
| Free | 100 | 1,000 |
| Builder | 500 | 20,000 |
| Pro | 2,000 | 100,000 |
| Agency | 5,000 | Unlimited |

Rate limit headers on every response:
- `X-RateLimit-Limit`: requests allowed per minute
- `X-RateLimit-Remaining`: requests remaining this minute
- `X-RateLimit-Reset`: Unix timestamp when window resets
- `X-Plan-Ops-Used`: ops used this month
- `X-Plan-Ops-Limit`: monthly op limit (0 = unlimited)

---

## Webhooks

PDF completion webhooks POST to your `webhook_url`:

```json
{
  "event": "pdf.complete",
  "job_id": "018edef0-...",
  "result_url": "https://storage.retainr.dev/...",
  "workspace_id": "018e1234-..."
}
```

Verify authenticity: check `X-Retainr-Signature` header (HMAC-SHA256 of body using your API key).
