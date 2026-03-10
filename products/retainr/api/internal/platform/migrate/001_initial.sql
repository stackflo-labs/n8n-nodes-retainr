-- +goose Up
-- +goose StatementBegin

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Workspaces: one per customer account
CREATE TABLE workspaces (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT        NOT NULL,
    email            TEXT        NOT NULL UNIQUE,
    plan             TEXT        NOT NULL DEFAULT 'free'
                                 CHECK (plan IN ('free', 'builder', 'pro', 'agency')),
    ops_this_month   INTEGER     NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    stripe_sub_id    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON workspaces (email);
CREATE INDEX ON workspaces (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- API keys: Stripe-style format rec_live_<base58>
CREATE TABLE api_keys (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         TEXT        NOT NULL,
    key_hash     TEXT        NOT NULL UNIQUE,  -- argon2id hash of full key
    key_prefix   TEXT        NOT NULL,          -- first 12 chars, indexed for lookup
    last_used_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON api_keys (key_prefix);
CREATE INDEX ON api_keys (workspace_id);

-- Memories: the core product
CREATE TABLE memories (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scope        TEXT        NOT NULL CHECK (scope IN ('session', 'user', 'agent', 'global')),
    session_id   TEXT,
    user_id      TEXT,
    agent_id     TEXT,
    content      TEXT        NOT NULL,
    embedding    VECTOR(1536),
    metadata     JSONB       NOT NULL DEFAULT '{}',
    tags         TEXT[]      NOT NULL DEFAULT '{}',
    ttl_at       TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exact-match filtering (fast lookup by workspace + scope + identifiers)
CREATE INDEX ON memories (workspace_id, scope);
CREATE INDEX ON memories (workspace_id, scope, user_id) WHERE user_id IS NOT NULL;
CREATE INDEX ON memories (workspace_id, scope, session_id) WHERE session_id IS NOT NULL;
CREATE INDEX ON memories (workspace_id, scope, agent_id) WHERE agent_id IS NOT NULL;

-- Vector similarity search (HNSW for fast approximate nearest-neighbour)
CREATE INDEX ON memories USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- TTL cleanup (worker polls this)
CREATE INDEX ON memories (ttl_at) WHERE ttl_at IS NOT NULL;

-- Tags search
CREATE INDEX ON memories USING gin (tags);

-- Audit log (written by middleware, used for debugging + GDPR compliance)
CREATE TABLE audit_ops (
    id           BIGSERIAL   PRIMARY KEY,
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    method       TEXT        NOT NULL,
    path         TEXT        NOT NULL,
    status_code  INTEGER     NOT NULL,
    latency_ms   INTEGER     NOT NULL,
    request_id   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON audit_ops (workspace_id, created_at DESC);

-- Row Level Security: safety net — application always filters by workspace_id first
ALTER TABLE memories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys  ENABLE ROW LEVEL SECURITY;

-- RLS policies use a session variable set by the application on each connection
-- Usage: SET LOCAL app.workspace_id = '<uuid>';
CREATE POLICY memories_workspace_isolation ON memories
    USING (workspace_id = current_setting('app.workspace_id', true)::uuid);

CREATE POLICY api_keys_workspace_isolation ON api_keys
    USING (workspace_id = current_setting('app.workspace_id', true)::uuid);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS audit_ops;
DROP TABLE IF EXISTS memories;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS workspaces;
DROP FUNCTION IF EXISTS update_updated_at;
-- +goose StatementEnd
