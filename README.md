# @stackflo-labs/n8n-nodes-retainr

[n8n](https://n8n.io/) community node for [retainr.dev](https://retainr.dev) — the AI agent memory persistence API.

Give your n8n AI agents **long-term memory** that persists across workflow runs. Store facts, preferences, and context, then retrieve them with semantic search — so your agents remember what matters.

## Features

| Operation | Description |
|-----------|-------------|
| **Store** | Save a memory with namespace, tags, metadata, TTL, and deduplication |
| **Search** | Semantic similarity search across stored memories |
| **Get Context** | Retrieve pre-formatted memory context ready for LLM system prompts |
| **List** | Browse memories with filters (namespace, tags) |
| **Delete** | Remove memories by namespace |
| **Get Workspace Info** | View plan usage, API keys, and workspace details |

## Installation

### n8n Cloud & Desktop

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter the exact package name: `@stackflo-labs/n8n-nodes-retainr`
4. Click **Install** and restart if prompted

### Self-hosted n8n (UI)

1. Go to **Settings > Community Nodes > Install**
2. Enter `@stackflo-labs/n8n-nodes-retainr`
3. Click **Install**

Requires `N8N_COMMUNITY_PACKAGES_ENABLED=true` in your environment (set by default in Docker).

### Self-hosted n8n (manual / Docker volume)

```bash
# If you mount a custom node directory or manage packages directly:
cd /home/node/.n8n
npm install @stackflo-labs/n8n-nodes-retainr
```

Then restart n8n.

## Setup

1. Sign up at [retainr.dev](https://retainr.dev) and get your API key
2. In n8n, go to **Credentials > New > Retainr API**
3. Paste your API key (`rec_live_...`) — each key is scoped to one workspace
4. The default Base URL (`https://api.retainr.dev`) works out of the box

## How it works

**Workspace → Namespace** hierarchy:

- **Workspace**: Your organization, determined by the API key
- **Namespace**: Groups memories by customer, tenant, or any identifier (e.g., `customer:alice`, `project:onboarding`)

Every memory operation accepts a **Namespace** field. Use it to keep each customer's memories separate within your workspace.

## Usage Examples

### Store a memory after a conversation

1. Add the **Retainr** node after your AI Agent
2. Set **Resource** to `Memory`, **Operation** to `Store`
3. Map the conversation summary to the **Content** field
4. Set **Namespace** to the customer identifier (e.g., `customer:alice`)

### Inject memory context into an LLM prompt

1. Add a **Retainr** node before your AI Agent
2. Set **Operation** to `Get Context`
3. Use the incoming message as the **Query**
4. Set the same **Namespace** to retrieve that customer's memories
5. Pass the `context` output into your LLM's system prompt

### Deduplicate similar memories

Use the **Dedup Threshold** field (e.g., `0.95`) when storing. If a sufficiently similar memory already exists, it will be updated instead of duplicated.

## AI Agent Tool

This node has `usableAsTool` enabled — you can use it directly as a tool inside n8n's **AI Agent** node, letting the agent decide when to store or recall memories autonomously.

## API Documentation

Full API reference: [retainr.dev/docs](https://retainr.dev/docs)

## License

[MIT](LICENSE)
