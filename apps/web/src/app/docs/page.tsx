import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "API Documentation | retainr",
  description:
    "Complete API reference for retainr — store, search, and delete AI agent memory across Make.com, n8n, and Zapier workflows. Includes authentication, rate limits, error codes, and platform-specific quick starts.",
  alternates: { canonical: "https://retainr.dev/docs" },
  openGraph: {
    title: "retainr API Documentation",
    description:
      "Complete API reference for retainr. Store and search AI agent memory from Make.com, n8n, and Zapier — with code examples for every endpoint.",
    url: "https://retainr.dev/docs",
  },
}

const techArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "retainr API Documentation",
  description:
    "Complete API reference for retainr — persistent AI agent memory for Make.com, n8n, and Zapier automation workflows.",
  url: "https://retainr.dev/docs",
  author: { "@type": "Organization", name: "retainr", url: "https://retainr.dev" },
  publisher: { "@type": "Organization", name: "retainr", url: "https://retainr.dev" },
  inLanguage: "en",
  articleSection: "API Reference",
  keywords:
    "retainr API, AI agent memory API, n8n memory node, Make.com memory module, pgvector search, PDF generation API",
}

const TOC = [
  { id: "authentication", label: "Authentication" },
  { id: "quickstart", label: "Quick start" },
  { id: "memories-store", label: "POST /v1/memories" },
  { id: "memories-search", label: "GET /v1/memories/search" },
  { id: "memories-delete", label: "DELETE /v1/memories" },
  { id: "pdf-generate", label: "POST /v1/pdf/generate" },
  { id: "pdf-status", label: "GET /v1/pdf/jobs/:id" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "error-codes", label: "Error codes" },
  { id: "platforms", label: "Platform quick starts" },
]

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "green" | "blue" | "red" | "gray" }) {
  const colors = {
    green: "bg-green-900/60 text-green-300 border border-green-700/50",
    blue: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
    red: "bg-red-900/60 text-red-300 border border-red-700/50",
    gray: "bg-gray-800 text-gray-300 border border-gray-700",
  }
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-semibold ${colors[color]}`}>
      {children}
    </span>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-3">{title}</h2>
      {children}
    </section>
  )
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <pre className={`language-${lang} bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed`}>
      <code>{code}</code>
    </pre>
  )
}

function EndpointHeader({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST" | "DELETE"
  path: string
  desc: string
}) {
  const methodColor = {
    GET: "bg-blue-900/50 text-blue-300 border-blue-700/50",
    POST: "bg-green-900/50 text-green-300 border-green-700/50",
    DELETE: "bg-red-900/50 text-red-300 border-red-700/50",
  }
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
      <span
        className={`border rounded px-2.5 py-1 text-xs font-bold font-mono uppercase tracking-wider ${methodColor[method]}`}
      >
        {method}
      </span>
      <code className="text-sm text-white font-mono">{path}</code>
      <span className="text-sm text-gray-400 hidden sm:block">—</span>
      <span className="text-sm text-gray-400">{desc}</span>
    </div>
  )
}

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-violet-400">
              retainr
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="hover:text-white transition">
                Pricing
              </Link>
              <Link href="/blog" className="hover:text-white transition">
                Blog
              </Link>
              <Link href="/docs" className="text-white">
                Docs
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg bg-violet-600 px-4 py-1.5 text-white hover:bg-violet-500 transition"
              >
                Get started free
              </Link>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Page header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-800/50 bg-violet-900/20 px-3 py-1 text-xs text-violet-300 mb-4">
              API version v1
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">API Documentation</h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              Everything you need to add persistent AI agent memory and PDF generation to your automation
              workflows. Base URL:{" "}
              <code className="text-violet-300 bg-gray-900 px-1.5 py-0.5 rounded text-sm">
                https://api.retainr.dev
              </code>
            </p>
          </div>

          <div className="flex gap-12 items-start">
            {/* Sticky sidebar TOC */}
            <aside className="hidden lg:block w-52 shrink-0 sticky top-28 self-start">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                On this page
              </div>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-gray-400 hover:text-violet-300 py-1 border-l-2 border-transparent hover:border-violet-500 pl-3 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">

              {/* ── Authentication ─────────────────────────────────────────── */}
              <Section id="authentication" title="Authentication">
                <p className="text-gray-400 mb-4 leading-relaxed">
                  All API requests require a Bearer token in the{" "}
                  <code className="text-gray-300 bg-gray-800 px-1 rounded">Authorization</code> header.
                  Generate API keys from your{" "}
                  <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 underline">
                    dashboard
                  </Link>
                  .
                </p>
                <CodeBlock
                  lang="bash"
                  code={`Authorization: Bearer rec_live_<your_api_key>

# Example curl
curl https://api.retainr.dev/v1/memories/search \\
  -H "Authorization: Bearer rec_live_abc123..." \\
  -G --data-urlencode "query=customer preferences" \\
  --data-urlencode "user_id=usr_42"`}
                />
                <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/40 rounded-xl">
                  <p className="text-sm text-amber-300">
                    <strong>Key format:</strong> API keys start with{" "}
                    <code className="bg-amber-900/40 px-1 rounded">rec_live_</code> followed by 32 base58
                    characters. Store them in environment variables — never hardcode in workflow nodes.
                  </p>
                </div>
              </Section>

              {/* ── Quick start ────────────────────────────────────────────── */}
              <Section id="quickstart" title="Quick start — 2 API calls to memory">
                <p className="text-gray-400 mb-6 leading-relaxed">
                  The core loop is: <strong className="text-white">store</strong> what your agent learns,{" "}
                  <strong className="text-white">search</strong> for relevant context before responding.
                  Nothing else required.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-2">1. Store a memory</div>
                    <CodeBlock
                      code={`// POST https://api.retainr.dev/v1/memories
{
  "content": "Customer is price-sensitive, prefers email over phone calls",
  "user_id": "usr_42",
  "tags": ["preference", "contact-method"]
}`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-2">
                      2. Search before your next AI call
                    </div>
                    <CodeBlock
                      code={`// GET https://api.retainr.dev/v1/memories/search
//   ?query=how+should+I+contact+this+customer
//   &user_id=usr_42
//   &limit=5

// Response
{
  "memories": [
    {
      "id": "mem_8xKp2...",
      "content": "Customer is price-sensitive, prefers email over phone calls",
      "score": 0.94,
      "tags": ["preference", "contact-method"],
      "created_at": "2026-03-10T09:00:00Z"
    }
  ]
}`}
                    />
                  </div>
                </div>
              </Section>

              {/* ── POST /v1/memories ──────────────────────────────────────── */}
              <Section id="memories-store" title="Store a memory">
                <EndpointHeader
                  method="POST"
                  path="/v1/memories"
                  desc="Embed and store a memory entry for a user, session, or agent scope"
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Request body</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Field</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Type</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Required</th>
                            <th className="pb-3 text-gray-400 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {[
                            { field: "content", type: "string", req: "Yes", desc: "The text to embed and store. Max 8,000 characters." },
                            { field: "user_id", type: "string", req: "Yes*", desc: "Identifies the end user. Required unless session_id is set." },
                            { field: "session_id", type: "string", req: "No", desc: "Scopes memory to a single session. Auto-expires when TTL lapses." },
                            { field: "tags", type: "string[]", req: "No", desc: "Up to 10 tags for filtering. E.g. ['preference', 'support']." },
                            { field: "ttl_hours", type: "number", req: "No", desc: "Hours until this memory auto-deletes. Omit for permanent storage." },
                          ].map((row) => (
                            <tr key={row.field}>
                              <td className="py-3 pr-4">
                                <code className="text-violet-300 text-xs">{row.field}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <code className="text-gray-400 text-xs">{row.type}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge color={row.req === "Yes" ? "green" : "gray"}>{row.req}</Badge>
                              </td>
                              <td className="py-3 text-gray-400 text-xs leading-relaxed">{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Example request</h3>
                    <CodeBlock
                      code={`{
  "content": "Customer opened a refund ticket for order #8821. Issue: wrong size delivered.",
  "user_id": "usr_42",
  "session_id": "sess_support_abc",
  "tags": ["support", "refund", "order-issue"],
  "ttl_hours": 720
}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Response — 201 Created</h3>
                    <CodeBlock
                      code={`{
  "id": "mem_8xKp2mQ4nR...",
  "content": "Customer opened a refund ticket for order #8821. Issue: wrong size delivered.",
  "user_id": "usr_42",
  "session_id": "sess_support_abc",
  "tags": ["support", "refund", "order-issue"],
  "expires_at": "2026-04-10T09:00:00Z",
  "created_at": "2026-03-10T09:00:00Z"
}`}
                    />
                  </div>
                </div>
              </Section>

              {/* ── GET /v1/memories/search ────────────────────────────────── */}
              <Section id="memories-search" title="Search memories">
                <EndpointHeader
                  method="GET"
                  path="/v1/memories/search"
                  desc="Semantic similarity search — returns memories ranked by meaning, not keyword overlap"
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Query parameters</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Parameter</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Type</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Required</th>
                            <th className="pb-3 text-gray-400 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {[
                            { field: "query", type: "string", req: "Yes", desc: "Natural language query. E.g. 'what does this customer prefer?'" },
                            { field: "user_id", type: "string", req: "Yes*", desc: "Filter to memories for this user. Required unless session_id is set." },
                            { field: "session_id", type: "string", req: "No", desc: "Restrict search to a single session scope." },
                            { field: "tags", type: "string", req: "No", desc: "Comma-separated tag filter. Only memories with ALL tags are returned." },
                            { field: "limit", type: "number", req: "No", desc: "Max memories to return. Default: 5. Max: 20." },
                            { field: "min_score", type: "number", req: "No", desc: "Minimum cosine similarity threshold (0–1). Default: 0.7." },
                          ].map((row) => (
                            <tr key={row.field}>
                              <td className="py-3 pr-4">
                                <code className="text-violet-300 text-xs">{row.field}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <code className="text-gray-400 text-xs">{row.type}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge color={row.req === "Yes" ? "green" : "gray"}>{row.req}</Badge>
                              </td>
                              <td className="py-3 text-gray-400 text-xs leading-relaxed">{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Example request</h3>
                    <CodeBlock
                      lang="bash"
                      code={`GET /v1/memories/search?query=how+should+I+approach+this+customer&user_id=usr_42&limit=3&tags=preference`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Response — 200 OK</h3>
                    <CodeBlock
                      code={`{
  "memories": [
    {
      "id": "mem_8xKp2mQ4nR...",
      "content": "Customer is price-sensitive, prefers email over phone calls",
      "score": 0.94,
      "tags": ["preference", "contact-method"],
      "created_at": "2026-03-10T09:00:00Z"
    },
    {
      "id": "mem_3fLm9nB2kS...",
      "content": "Customer prefers concise replies — skip long explanations",
      "score": 0.87,
      "tags": ["preference"],
      "created_at": "2026-03-09T14:22:00Z"
    }
  ],
  "count": 2
}`}
                    />
                  </div>
                </div>
              </Section>

              {/* ── DELETE /v1/memories ────────────────────────────────────── */}
              <Section id="memories-delete" title="Delete memories">
                <EndpointHeader
                  method="DELETE"
                  path="/v1/memories"
                  desc="Bulk-delete memories by user, session, or tags — scoped to your workspace"
                />
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  All deletes are scoped to your workspace. You cannot delete memories belonging to another
                  workspace. Deletion is permanent and immediate — no soft deletes.
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Request body</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Field</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Type</th>
                            <th className="pb-3 text-gray-400 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {[
                            { field: "user_id", type: "string", desc: "Delete all memories for this user. At least one of user_id, session_id, or tags is required." },
                            { field: "session_id", type: "string", desc: "Delete all memories in this session." },
                            { field: "tags", type: "string[]", desc: "Delete memories matching ALL specified tags." },
                          ].map((row) => (
                            <tr key={row.field}>
                              <td className="py-3 pr-4">
                                <code className="text-violet-300 text-xs">{row.field}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <code className="text-gray-400 text-xs">{row.type}</code>
                              </td>
                              <td className="py-3 text-gray-400 text-xs leading-relaxed">{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Example — delete all memories for a user (GDPR erasure)</h3>
                    <CodeBlock
                      code={`{
  "user_id": "usr_42"
}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Response — 200 OK</h3>
                    <CodeBlock
                      code={`{
  "deleted": 14
}`}
                    />
                  </div>
                </div>
              </Section>

              {/* ── POST /v1/pdf/generate ─────────────────────────────────── */}
              <Section id="pdf-generate" title="Generate a PDF">
                <EndpointHeader
                  method="POST"
                  path="/v1/pdf/generate"
                  desc="Render HTML to PDF via headless Chromium — returns a job ID for async polling"
                />
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  PDF generation is async. Submit a job, then poll{" "}
                  <code className="text-gray-300 bg-gray-800 px-1 rounded text-xs">/v1/pdf/jobs/:id</code>{" "}
                  for the download URL. Most PDFs complete in under 2 seconds.
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Request body</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Field</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Type</th>
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Required</th>
                            <th className="pb-3 text-gray-400 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {[
                            { field: "html", type: "string", req: "Yes", desc: "Full HTML string to render. Include inline CSS — external stylesheets are not fetched." },
                            { field: "filename", type: "string", req: "No", desc: "Output filename without extension. Default: generated-<timestamp>." },
                            { field: "options.format", type: "string", req: "No", desc: "Paper size: A4 (default), Letter, A3, Legal." },
                            { field: "options.margin", type: "object", req: "No", desc: "{top, right, bottom, left} in CSS units. Default: 1cm all sides." },
                            { field: "options.landscape", type: "boolean", req: "No", desc: "Landscape orientation. Default: false." },
                          ].map((row) => (
                            <tr key={row.field}>
                              <td className="py-3 pr-4">
                                <code className="text-violet-300 text-xs">{row.field}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <code className="text-gray-400 text-xs">{row.type}</code>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge color={row.req === "Yes" ? "green" : "gray"}>{row.req}</Badge>
                              </td>
                              <td className="py-3 text-gray-400 text-xs leading-relaxed">{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Example — generate an invoice PDF</h3>
                    <CodeBlock
                      code={`{
  "html": "<!DOCTYPE html><html><body><h1>Invoice #1042</h1><p>Amount: €299</p></body></html>",
  "filename": "invoice-1042",
  "options": {
    "format": "A4",
    "margin": { "top": "2cm", "right": "1.5cm", "bottom": "2cm", "left": "1.5cm" }
  }
}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Response — 202 Accepted</h3>
                    <CodeBlock
                      code={`{
  "job_id": "pdf_7mNp3xQ...",
  "status": "pending",
  "created_at": "2026-03-10T09:00:00Z"
}`}
                    />
                  </div>
                </div>
              </Section>

              {/* ── GET /v1/pdf/jobs/:id ──────────────────────────────────── */}
              <Section id="pdf-status" title="Get PDF job status">
                <EndpointHeader
                  method="GET"
                  path="/v1/pdf/jobs/:id"
                  desc="Poll job status and retrieve the signed download URL when complete"
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Path parameters</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="pb-3 pr-4 text-gray-400 font-medium">Parameter</th>
                            <th className="pb-3 text-gray-400 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-3 pr-4">
                              <code className="text-violet-300 text-xs">id</code>
                            </td>
                            <td className="py-3 text-gray-400 text-xs">
                              The <code className="text-gray-300 bg-gray-800 px-1 rounded">job_id</code> returned
                              by POST /v1/pdf/generate
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                      Response — 200 OK (job complete)
                    </h3>
                    <CodeBlock
                      code={`{
  "job_id": "pdf_7mNp3xQ...",
  "status": "complete",
  "download_url": "https://api.retainr.dev/v1/pdf/download/pdf_7mNp3xQ...?token=...",
  "expires_at": "2026-03-11T09:00:00Z",
  "created_at": "2026-03-10T09:00:00Z",
  "completed_at": "2026-03-10T09:00:01Z"
}`}
                    />
                  </div>
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-400">
                      <strong className="text-gray-300">Status values:</strong>{" "}
                      <Badge>pending</Badge> → <Badge>processing</Badge> → <Badge color="green">complete</Badge>{" "}
                      or <Badge color="red">failed</Badge>. Download URLs expire after 24 hours. Re-fetch the job
                      to get a fresh URL.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── Rate limits ────────────────────────────────────────────── */}
              <Section id="rate-limits" title="Rate limits">
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Rate limits are enforced per API key, per minute. Memory operations count against your
                  monthly plan quota separately from per-minute limits.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        <th className="pb-3 pr-4 text-gray-400 font-medium">Plan</th>
                        <th className="pb-3 pr-4 text-gray-400 font-medium">Requests/min</th>
                        <th className="pb-3 pr-4 text-gray-400 font-medium">Memory ops/month</th>
                        <th className="pb-3 pr-4 text-gray-400 font-medium">PDF jobs/month</th>
                        <th className="pb-3 text-gray-400 font-medium">Max content size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {[
                        { plan: "Free", rpm: "30", ops: "1,000", pdfs: "10", size: "4 KB" },
                        { plan: "Builder", rpm: "120", ops: "20,000", pdfs: "200", size: "8 KB" },
                        { plan: "Pro", rpm: "300", ops: "100,000", pdfs: "2,000", size: "8 KB" },
                        { plan: "Agency", rpm: "600", ops: "Unlimited", pdfs: "Unlimited", size: "16 KB" },
                      ].map((row) => (
                        <tr key={row.plan}>
                          <td className="py-3 pr-4 font-medium text-white">{row.plan}</td>
                          <td className="py-3 pr-4 text-gray-400">{row.rpm}</td>
                          <td className="py-3 pr-4 text-gray-400">{row.ops}</td>
                          <td className="py-3 pr-4 text-gray-400">{row.pdfs}</td>
                          <td className="py-3 text-gray-400">{row.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
                  <p className="text-xs text-gray-400">
                    When rate limited, the API returns <Badge color="red">429 Too Many Requests</Badge> with a{" "}
                    <code className="text-gray-300 bg-gray-800 px-1 rounded">Retry-After</code> header indicating
                    seconds to wait. n8n and Make.com modules handle retry automatically.
                  </p>
                </div>
              </Section>

              {/* ── Error codes ────────────────────────────────────────────── */}
              <Section id="error-codes" title="Error codes">
                <p className="text-gray-400 text-sm mb-6">
                  All errors return a JSON body with <code className="text-gray-300 bg-gray-800 px-1 rounded text-xs">error</code> and{" "}
                  <code className="text-gray-300 bg-gray-800 px-1 rounded text-xs">message</code> fields.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        <th className="pb-3 pr-4 text-gray-400 font-medium">Status</th>
                        <th className="pb-3 pr-4 text-gray-400 font-medium">Error code</th>
                        <th className="pb-3 text-gray-400 font-medium">Meaning & resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {[
                        { status: "400", code: "invalid_request", desc: "Malformed JSON or missing required fields. Check the request body against the schema above." },
                        { status: "401", code: "unauthorized", desc: "Missing or invalid API key. Check your Authorization header." },
                        { status: "403", code: "forbidden", desc: "Your API key doesn't have access to this workspace." },
                        { status: "404", code: "not_found", desc: "The requested resource (memory or PDF job) does not exist." },
                        { status: "422", code: "content_too_large", desc: "Content exceeds the per-plan character limit. Summarize or chunk the content." },
                        { status: "429", code: "rate_limited", desc: "Exceeded per-minute or monthly quota. Check Retry-After header and upgrade if needed." },
                        { status: "500", code: "internal_error", desc: "Unexpected server error. We log all 500s automatically. If it persists, open a support ticket." },
                        { status: "503", code: "embedding_unavailable", desc: "Embedding provider temporarily unavailable. Retry with exponential backoff." },
                      ].map((row) => (
                        <tr key={row.code}>
                          <td className="py-3 pr-4">
                            <Badge color={row.status.startsWith("4") || row.status.startsWith("5") ? "red" : "green"}>
                              {row.status}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <code className="text-violet-300 text-xs">{row.code}</code>
                          </td>
                          <td className="py-3 text-gray-400 text-xs leading-relaxed">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* ── Platform quick starts ──────────────────────────────────── */}
              <Section id="platforms" title="Platform quick starts">
                <div className="space-y-10">

                  {/* n8n */}
                  <div>
                    <h3 className="text-xl font-bold text-orange-400 mb-2">n8n</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Install the official retainr community node. In n8n, go to{" "}
                      <strong className="text-gray-300">Settings → Community Nodes → Install</strong> and enter{" "}
                      <code className="text-gray-300 bg-gray-800 px-1 rounded text-xs">n8n-nodes-retainr</code>.
                      Available operations: Store Memory, Search Memory, Delete Memory.
                    </p>
                    <CodeBlock
                      code={`// n8n — Store Memory node (JSON body)
{
  "content": "{{ $json.message }}",
  "user_id": "{{ $json.userId }}",
  "tags": ["{{ $json.intent }}"]
}

// n8n — Search Memory node (before your AI Call node)
{
  "query": "{{ $json.userMessage }}",
  "user_id": "{{ $json.userId }}",
  "limit": 5
}
// Output: $json.memories — inject into your system prompt`}
                    />
                  </div>

                  {/* Make.com */}
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">Make.com</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Add the <strong className="text-gray-300">retainr</strong> app from the Make.com
                      marketplace. Connect it with your API key under{" "}
                      <strong className="text-gray-300">Connections</strong>. All memory operations are
                      available as native modules — no HTTP modules needed.
                    </p>
                    <CodeBlock
                      code={`// Make.com — Store Memory module
Module: retainr > Store Memory
Content: {{1.message}}
User ID: {{1.customerId}}
Tags: preference, support

// Make.com — Search Memory module (inject before OpenAI module)
Module: retainr > Search Memory
Query: {{1.userMessage}}
User ID: {{1.customerId}}
Limit: 5

// Use {{2.memories}} as context in your OpenAI prompt`}
                    />
                  </div>

                  {/* Zapier */}
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Zapier</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Until the official Zapier app launches, use a{" "}
                      <strong className="text-gray-300">Code by Zapier</strong> step or the{" "}
                      <strong className="text-gray-300">Webhooks by Zapier</strong> POST action with the
                      configuration below.
                    </p>
                    <CodeBlock
                      lang="bash"
                      code={`# Webhooks by Zapier — Store Memory
URL: https://api.retainr.dev/v1/memories
Method: POST
Headers:
  Authorization: Bearer rec_live_your_key_here
  Content-Type: application/json
Data:
  {
    "content": "{{trigger_field}}",
    "user_id": "{{contact_email}}",
    "tags": ["zapier"]
  }

# Search — use GET with query string
URL: https://api.retainr.dev/v1/memories/search?query={{user_message}}&user_id={{contact_email}}&limit=5
Method: GET
Headers: Authorization: Bearer rec_live_your_key_here`}
                    />
                  </div>

                </div>
              </Section>

              {/* CTA */}
              <div className="border border-violet-800/40 bg-violet-950/20 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Ready to add memory to your workflows?</h2>
                <p className="text-gray-400 mb-6">
                  Free plan includes 1,000 memory ops per month. No credit card required.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold hover:bg-violet-500 transition"
                >
                  Create free account →
                </Link>
              </div>

            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-10 mt-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="font-bold mb-3 text-violet-400">retainr</div>
                <p className="text-xs text-gray-500">AI agent memory for automation platforms.</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-400">Product</div>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/docs" className="hover:text-white transition-colors">API docs</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-400">Integrations</div>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link href="/blog/n8n-ai-agent-memory-tutorial" className="hover:text-white transition-colors">n8n node</Link></li>
                  <li><Link href="/blog/make-com-ai-memory-workflow" className="hover:text-white transition-colors">Make.com module</Link></li>
                  <li><Link href="/blog/zapier-ai-memory-setup" className="hover:text-white transition-colors">Zapier action</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-400">Company</div>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} retainr. All rights reserved.</p>
              <p className="text-xs text-gray-600">GDPR compliant · Data stored in EU (Hetzner, Germany)</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
