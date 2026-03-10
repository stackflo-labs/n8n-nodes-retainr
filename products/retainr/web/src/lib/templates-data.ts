export type Platform = "n8n" | "make" | "zapier"

export interface TemplateData {
  slug: string
  platform: Platform
  platformLabel: string
  platformColor: string
  category: string
  title: string
  description: string
  ops: string
  workflow: string // JSON string of importable workflow
}

// ── Workflow JSON ──────────────────────────────────────────────────────────────
// Realistic n8n / Make.com workflow JSON, ready to import.
// Replace YOUR_API_KEY with a real retainr API key from retainr.dev/dashboard

const N8N_CUSTOMER_SERVICE = JSON.stringify({
  name: "Customer Service AI with Persistent Memory — retainr",
  nodes: [
    {
      id: "webhook",
      name: "Customer Message",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: { httpMethod: "POST", path: "customer-support", responseMode: "lastNode" },
    },
    {
      id: "search-memory",
      name: "Search Customer History",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [460, 300],
      parameters: {
        method: "POST",
        url: "https://api.retainr.dev/v1/memories/search",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"query": "{{ $json.body.message }}", "scope": "user", "user_id": "{{ $json.body.customerId }}", "limit": 5}',
      },
    },
    {
      id: "ai-agent",
      name: "AI Support Agent",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [680, 300],
      parameters: {
        method: "POST",
        url: "https://api.openai.com/v1/chat/completions",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_OPENAI_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"model":"gpt-4o-mini","messages":[{"role":"system","content":"You are a helpful customer support agent.\\n\\nCUSTOMER HISTORY:\\n{{ $json.memories.map(m => m.content).join(\'\\n\') || \'No previous history.\' }}\\n\\nBe concise, reference history when relevant."},{"role":"user","content":"{{ $(\'Customer Message\').item.json.body.message }}"}]}',
      },
    },
    {
      id: "store-memory",
      name: "Store Interaction",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [900, 300],
      parameters: {
        method: "POST",
        url: "https://api.retainr.dev/v1/memories",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"content":"Customer: {{ $(\'Customer Message\').item.json.body.message }}\\nAgent: {{ $json.choices[0].message.content }}","scope":"user","user_id":"{{ $(\'Customer Message\').item.json.body.customerId }}","tags":["support","conversation"]}',
      },
    },
    {
      id: "respond",
      name: "Send Response",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [1120, 300],
      parameters: {
        respondWith: "json",
        responseBody:
          '={"reply": "{{ $(\'AI Support Agent\').item.json.choices[0].message.content }}"}',
      },
    },
  ],
  connections: {
    "Customer Message": { main: [[{ node: "Search Customer History", type: "main", index: 0 }]] },
    "Search Customer History": { main: [[{ node: "AI Support Agent", type: "main", index: 0 }]] },
    "AI Support Agent": { main: [[{ node: "Store Interaction", type: "main", index: 0 }]] },
    "Store Interaction": { main: [[{ node: "Send Response", type: "main", index: 0 }]] },
  },
  settings: { executionOrder: "v1" },
}, null, 2)

const N8N_LEAD_QUALIFICATION = JSON.stringify({
  name: "Lead Qualification Agent with Memory — retainr",
  nodes: [
    {
      id: "webhook",
      name: "New Lead Touchpoint",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: { httpMethod: "POST", path: "lead-qualify", responseMode: "lastNode" },
    },
    {
      id: "search-memory",
      name: "Retrieve Lead Profile",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [460, 300],
      parameters: {
        method: "POST",
        url: "https://api.retainr.dev/v1/memories/search",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"query": "{{ $json.body.message }}", "scope": "user", "user_id": "{{ $json.body.leadEmail }}", "limit": 10}',
      },
    },
    {
      id: "ai-qualify",
      name: "AI Lead Qualifier",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [680, 300],
      parameters: {
        method: "POST",
        url: "https://api.openai.com/v1/chat/completions",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_OPENAI_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"model":"gpt-4o-mini","messages":[{"role":"system","content":"You qualify leads. Score 1-10 based on all history.\\n\\nLEAD HISTORY:\\n{{ $json.memories.map(m => m.content).join(\'\\n\') || \'First touchpoint.\' }}\\n\\nReturn JSON: {score, reasoning, nextAction, icp_fit: true|false}"},{"role":"user","content":"New touchpoint: {{ $(\'New Lead Touchpoint\').item.json.body.message }}"}],"response_format":{"type":"json_object"}}',
      },
    },
    {
      id: "store-memory",
      name: "Update Lead Profile",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [900, 300],
      parameters: {
        method: "POST",
        url: "https://api.retainr.dev/v1/memories",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"content":"Touchpoint: {{ $(\'New Lead Touchpoint\').item.json.body.message }}\\nQualification: {{ $json.choices[0].message.content }}","scope":"user","user_id":"{{ $(\'New Lead Touchpoint\').item.json.body.leadEmail }}","tags":["lead","qualification"]}',
      },
    },
    {
      id: "respond",
      name: "Return Score",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [1120, 300],
      parameters: {
        respondWith: "json",
        responseBody:
          '={{ $("AI Lead Qualifier").item.json.choices[0].message.content }}',
      },
    },
  ],
  connections: {
    "New Lead Touchpoint": { main: [[{ node: "Retrieve Lead Profile", type: "main", index: 0 }]] },
    "Retrieve Lead Profile": { main: [[{ node: "AI Lead Qualifier", type: "main", index: 0 }]] },
    "AI Lead Qualifier": { main: [[{ node: "Update Lead Profile", type: "main", index: 0 }]] },
    "Update Lead Profile": { main: [[{ node: "Return Score", type: "main", index: 0 }]] },
  },
  settings: { executionOrder: "v1" },
}, null, 2)

const N8N_EMAIL_INBOX = JSON.stringify({
  name: "Email Inbox AI Assistant with Long-Term Memory — retainr",
  nodes: [
    {
      id: "gmail-trigger",
      name: "New Email",
      type: "n8n-nodes-base.gmailTrigger",
      typeVersion: 1,
      position: [240, 300],
      parameters: { pollTimes: { item: [{ mode: "everyMinute" }] } },
    },
    {
      id: "search-memory",
      name: "Retrieve Sender History",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [460, 300],
      parameters: {
        method: "POST",
        url: "https://api.retainr.dev/v1/memories/search",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"query": "{{ $json.subject }} {{ $json.snippet }}", "scope": "user", "user_id": "{{ $json.from.value[0].address }}", "limit": 5}',
      },
    },
    {
      id: "ai-draft",
      name: "Draft Reply",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [680, 300],
      parameters: {
        method: "POST",
        url: "https://api.openai.com/v1/chat/completions",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_OPENAI_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"model":"gpt-4o-mini","messages":[{"role":"system","content":"Draft a professional email reply. Match the sender\'s tone.\\n\\nPAST CONTEXT WITH THIS SENDER:\\n{{ $json.memories.map(m => m.content).join(\'\\n\') || \'No prior history.\' }}"},{"role":"user","content":"Email from {{ $(\'New Email\').item.json.from.value[0].address }}:\\nSubject: {{ $(\'New Email\').item.json.subject }}\\n\\n{{ $(\'New Email\').item.json.text }}"}]}',
      },
    },
    {
      id: "store-memory",
      name: "Save Thread Summary",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [900, 300],
      parameters: {
        method: "POST",
        url: "https://api.retainr.dev/v1/memories",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={"content":"Subject: {{ $(\'New Email\').item.json.subject }}\\nFrom: {{ $(\'New Email\').item.json.from.value[0].address }}\\nDraft reply: {{ $json.choices[0].message.content }}","scope":"user","user_id":"{{ $(\'New Email\').item.json.from.value[0].address }}","tags":["email","thread"]}',
      },
    },
  ],
  connections: {
    "New Email": { main: [[{ node: "Retrieve Sender History", type: "main", index: 0 }]] },
    "Retrieve Sender History": { main: [[{ node: "Draft Reply", type: "main", index: 0 }]] },
    "Draft Reply": { main: [[{ node: "Save Thread Summary", type: "main", index: 0 }]] },
  },
  settings: { executionOrder: "v1" },
}, null, 2)

const MAKE_SHOPIFY_CUSTOMER = JSON.stringify({
  name: "Shopify Order Follow-Up with Customer History — retainr",
  flow: [
    {
      id: 1,
      module: "shopify:WatchOrders",
      version: 1,
      parameters: { store: "YOUR_SHOPIFY_STORE" },
      mapper: {},
      metadata: { designer: { x: 0, y: 0 } },
    },
    {
      id: 2,
      module: "http:ActionSendData",
      version: 3,
      parameters: {
        url: "https://api.retainr.dev/v1/memories/search",
        method: "POST",
        headers: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }],
        body: {
          type: "json",
          content: '{"query":"purchase history preferences","scope":"user","user_id":"{{1.customer.email}}","limit":5}',
        },
      },
      metadata: { designer: { x: 300, y: 0 } },
    },
    {
      id: 3,
      module: "openai:CreateCompletion",
      version: 1,
      parameters: {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Write a personalised post-purchase follow-up email. Keep it under 100 words.\n\nCUSTOMER HISTORY:\n{{map(2.data.memories; \"content\") | join(\"\\n\") || \"First purchase.\"}}",
          },
          {
            role: "user",
            content:
              "Customer {{1.customer.first_name}} just ordered {{1.line_items[].name | join(\", \")}} — total {{1.total_price}} {{1.currency}}.",
          },
        ],
      },
      metadata: { designer: { x: 600, y: 0 } },
    },
    {
      id: 4,
      module: "mailgun:SendEmail",
      version: 1,
      parameters: {
        to: "{{1.customer.email}}",
        subject: "Thanks for your order, {{1.customer.first_name}}!",
        html: "{{3.choices[].message.content | first}}",
      },
      metadata: { designer: { x: 900, y: 0 } },
    },
    {
      id: 5,
      module: "http:ActionSendData",
      version: 3,
      parameters: {
        url: "https://api.retainr.dev/v1/memories",
        method: "POST",
        headers: [{ name: "Authorization", value: "Bearer YOUR_API_KEY" }],
        body: {
          type: "json",
          content:
            '{"content":"Purchased: {{1.line_items[].name | join(\", \")}} — {{1.total_price}} {{1.currency}}","scope":"user","user_id":"{{1.customer.email}}","tags":["purchase","shopify"]}',
        },
      },
      metadata: { designer: { x: 1200, y: 0 } },
    },
  ],
  metadata: { version: 1, scenario: "Shopify Customer History Follow-Up" },
}, null, 2)

const ZAPIER_CRM_ENRICHMENT = JSON.stringify({
  description: "Zapier does not use importable JSON — set this up manually using the steps below.",
  zap_name: "Sales CRM Enrichment with AI Notes — retainr",
  trigger: {
    app: "HubSpot",
    event: "Deal Stage Changed",
    setup: "Connect your HubSpot account and select the pipeline to monitor.",
  },
  steps: [
    {
      order: 1,
      app: "Webhooks by Zapier",
      action: "POST",
      label: "Retrieve AI notes for this deal",
      config: {
        url: "https://api.retainr.dev/v1/memories/search",
        headers: { Authorization: "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
        data: '{"query":"deal progress next steps","scope":"user","user_id":"{{deal_id}}","limit":5}',
      },
    },
    {
      order: 2,
      app: "ChatGPT",
      action: "Send Message",
      label: "Generate next-step recommendation",
      config: {
        model: "gpt-4o-mini",
        user_message:
          "Deal: {{deal_name}} moved to stage: {{deal_stage}}.\n\nPast AI notes:\n{{step_1_memories}}\n\nGive a concise next action in 1-2 sentences.",
      },
    },
    {
      order: 3,
      app: "HubSpot",
      action: "Create Note",
      label: "Write recommendation to deal",
      config: { deal_id: "{{deal_id}}", note_body: "AI recommendation: {{step_2_response}}" },
    },
    {
      order: 4,
      app: "Webhooks by Zapier",
      action: "POST",
      label: "Store AI note in retainr memory",
      config: {
        url: "https://api.retainr.dev/v1/memories",
        headers: { Authorization: "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
        data: '{"content":"Stage: {{deal_stage}}. Recommendation: {{step_2_response}}","scope":"user","user_id":"{{deal_id}}","tags":["crm","deal"]}',
      },
    },
  ],
}, null, 2)

// ── Template registry ──────────────────────────────────────────────────────────

export const TEMPLATES: Record<string, TemplateData> = {
  "n8n-customer-service-ai-with-memory": {
    slug: "n8n-customer-service-ai-with-memory",
    platform: "n8n",
    platformLabel: "n8n",
    platformColor: "#EA4B71",
    category: "Customer Service",
    title: "Customer Service AI with Persistent Memory",
    description:
      "n8n workflow: webhook → retainr semantic search → OpenAI → retainr store. Your support AI recalls every past interaction automatically.",
    ops: "~50 memory ops/conversation",
    workflow: N8N_CUSTOMER_SERVICE,
  },
  "n8n-lead-qualification-agent-memory": {
    slug: "n8n-lead-qualification-agent-memory",
    platform: "n8n",
    platformLabel: "n8n",
    platformColor: "#EA4B71",
    category: "Sales",
    title: "Lead Qualification Agent with Memory",
    description:
      "n8n workflow: builds a persistent lead profile across touchpoints. AI scores and updates qualification on every interaction.",
    ops: "~30 memory ops/lead",
    workflow: N8N_LEAD_QUALIFICATION,
  },
  "n8n-email-inbox-ai-with-memory": {
    slug: "n8n-email-inbox-ai-with-memory",
    platform: "n8n",
    platformLabel: "n8n",
    platformColor: "#EA4B71",
    category: "Productivity",
    title: "Email Inbox AI with Long-Term Memory",
    description:
      "n8n Gmail trigger → retainr search → OpenAI draft → retainr store. Your email AI knows every sender's history.",
    ops: "~20 memory ops/day",
    workflow: N8N_EMAIL_INBOX,
  },
  "make-com-shopify-customer-history": {
    slug: "make-com-shopify-customer-history",
    platform: "make",
    platformLabel: "Make.com",
    platformColor: "#6D00CC",
    category: "E-commerce",
    title: "Shopify Order Follow-Up with Customer History",
    description:
      "Make.com scenario: Shopify trigger → retainr search → OpenAI personalised email → Mailgun send → retainr store.",
    ops: "~10 memory ops/order",
    workflow: MAKE_SHOPIFY_CUSTOMER,
  },
  "zapier-sales-crm-enrichment-ai": {
    slug: "zapier-sales-crm-enrichment-ai",
    platform: "zapier",
    platformLabel: "Zapier",
    platformColor: "#FF4A00",
    category: "Sales",
    title: "Sales CRM Enrichment with AI Notes",
    description:
      "Zapier Zap: HubSpot stage change → retainr memory search → ChatGPT recommendation → HubSpot note → retainr store.",
    ops: "~15 memory ops/deal",
    workflow: ZAPIER_CRM_ENRICHMENT,
  },
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  n8n: "n8n",
  make: "Make.com",
  zapier: "Zapier",
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  n8n: "#EA4B71",
  make: "#6D00CC",
  zapier: "#FF4A00",
}
