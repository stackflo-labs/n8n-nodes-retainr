# @stackflo-labs/n8n-nodes-retainr

[n8n](https://n8n.io/) community node for [retainr.dev](https://retainr.dev) — the AI agent memory persistence API.

Give your n8n AI agents **long-term memory** that persists across workflow runs. Store facts, preferences, and context, then retrieve them with semantic search — so your agents remember what matters.

## Features

| Operation | Description |
|-----------|-------------|
| **Store** | Save a memory with scope, tags, metadata, TTL, and deduplication |
| **Search** | Semantic similarity search across stored memories |
| **Get Context** | Retrieve pre-formatted memory context ready for LLM system prompts |
| **List** | Browse memories with filters (scope, user, session, tags) |
| **Delete** | Remove memories by filter criteria |
| **Get Workspace Info** | View plan usage, API keys, and workspace details |

## Installation

### n8n Cloud & Desktop

1. Go to **Settings > Community Nodes**
2. Search for `@stackflo-labs/n8n-nodes-retainr`
3. Click **Install**

### Self-hosted n8n

```bash
cd ~/.n8n
npm install @stackflo-labs/n8n-nodes-retainr
```

Then restart n8n.

## Setup

1. Sign up at [retainr.dev](https://retainr.dev) and get your API key
2. In n8n, go to **Credentials > New > Retainr API**
3. Paste your API key (`rec_live_...`)
4. The default Base URL (`https://api.retainr.dev`) works out of the box

## Usage Examples

### Store a memory after a conversation

1. Add the **Retainr** node after your AI Agent
2. Set **Resource** to `Memory`, **Operation** to `Store`
3. Map the conversation summary to the **Content** field
4. Set **Scope** to `User` and provide the **User ID**

### Inject memory context into an LLM prompt

1. Add a **Retainr** node before your AI Agent
2. Set **Operation** to `Get Context`
3. Use the incoming message as the **Query**
4. Pass the `context` output into your LLM's system prompt

### Deduplicate similar memories

Use the **Dedup Threshold** field (e.g., `0.95`) when storing. If a sufficiently similar memory already exists, it will be updated instead of duplicated.

## Memory Scopes

| Scope | Use case |
|-------|----------|
| `session` | Single workflow run — requires `session_id` |
| `user` | Persists across runs for one user — requires `user_id` |
| `agent` | Shared across users for one agent — requires `agent_id` |
| `global` | Shared across the entire workspace |

## AI Agent Tool

This node has `usableAsTool` enabled — you can use it directly as a tool inside n8n's **AI Agent** node, letting the agent decide when to store or recall memories autonomously.

## Demo Video

A recorded demo covering all n8n Creator Portal requirements is at:

```
products/retainr/web/public/demo/n8n-demo.mp4
```

Full disk path (Windows): `D:\dev\datadir\stackflo\products\retainr\web\public\demo\n8n-demo.mp4`

**To re-record** (e.g. after a node update):

```bash
# 1. Start n8n with the node pre-installed
cd packages/n8n-node
docker compose -f e2e/docker-compose.yml up --build -d

# 2. Record — no API keys needed, the script handles everything
cd ../../products/retainr/web
N8N_BASE_URL=http://127.0.0.1:5678 \
node scripts/record-n8n-demo.mjs
# → public/demo/n8n-demo-raw.webm

# 3. Post-process to MP4
bash ../../packages/n8n-node/demo/post-process.sh public/demo/n8n-demo-raw.webm
# → public/demo/n8n-demo.mp4

# 4. Tear down
cd ../../packages/n8n-node
docker compose -f e2e/docker-compose.yml down
```

See `demo/README.md` for full details.

## API Documentation

Full API reference: [retainr.dev/docs/api](https://retainr.dev/docs/api)

## License

[MIT](LICENSE)
