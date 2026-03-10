import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { format } from "date-fns"

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "retainr",
  url: "https://retainr.dev",
  description: "Persistent AI agent memory for Make.com, n8n, and Zapier workflows",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Builder", price: "29", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Pro", price: "79", priceCurrency: "EUR" },
  ],
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does retainr work with n8n?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Install the retainr community node from npm, add your API key, then use Store Memory and Search Memory nodes anywhere in your workflow. Context persists across executions automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Does retainr work with Make.com?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Install the retainr module from the Make.com app marketplace. All memory operations are available as native Make.com modules with no code required.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between session and user memory?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Session memory expires when the workflow run ends. User memory persists indefinitely across all sessions for a given user ID — ideal for CRM, support, and personalization workflows.",
      },
    },
    {
      "@type": "Question",
      name: "How is memory search different from a database lookup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "retainr uses vector embeddings and cosine similarity search. You search by meaning, not exact keywords. 'What does this customer care about?' finds 'prefers fast shipping and low prices' even with no keyword overlap.",
      },
    },
  ],
}

const PLANS = [
  { name: "Free",    price: "€0",   ops: "1,000 ops",   pdfs: "10 PDFs",        highlight: false, cta: "Start free" },
  { name: "Builder", price: "€29",  ops: "20,000 ops",  pdfs: "200 PDFs",       highlight: false, cta: "Start building" },
  { name: "Pro",     price: "€79",  ops: "100,000 ops", pdfs: "2,000 PDFs",     highlight: true,  cta: "Go pro" },
  { name: "Agency",  price: "€199", ops: "Unlimited",   pdfs: "Unlimited",      highlight: false, cta: "Get started" },
]

const FEATURES = [
  { icon: "🧠", title: "Semantic memory search", desc: "Find relevant context by meaning. Your agent asks 'what does this user prefer?' — retainr returns the most relevant memories, ranked by similarity." },
  { icon: "🔄", title: "Session & user scopes",  desc: "Session memory lives for one run. User memory persists forever. Agent memory is shared across your entire team. Pick the right scope per use case." },
  { icon: "🔗", title: "Native integrations",    desc: "One-click n8n node. Native Make.com module. Zapier action. No webhooks, no code, no custom HTTP nodes to maintain." },
  { icon: "📄", title: "PDF generation",          desc: "Generate invoices, quotes, and contracts from templates. Same API key, included in every plan. Powers automated document workflows." },
  { icon: "⏱️", title: "TTL auto-expiry",         desc: "Set memory to expire after N seconds. Session data deletes itself. GDPR-friendly by default — no manual cleanup needed." },
  { icon: "🔒", title: "Workspace isolation",     desc: "Every workspace is fully isolated at the database level. Row-level security enforced. Your customers' data never touches each other." },
]

const PLATFORMS = [
  {
    name: "n8n",
    color: "text-orange-400",
    install: "Search 'retainr' in the n8n community nodes panel",
    code: `// n8n: Store Memory node
{
  "content": "{{ $json.message }}",
  "scope": "user",
  "user_id": "{{ $json.userId }}"
}`,
  },
  {
    name: "Make.com",
    color: "text-purple-400",
    install: "Add 'retainr' from the Make.com app marketplace",
    code: `// Make.com: Search Memory module
{
  "query": "customer preferences",
  "scope": "user",
  "user_id": "{{customer.id}}",
  "limit": 5
}`,
  },
  {
    name: "Zapier",
    color: "text-yellow-400",
    install: "Coming soon — use HTTP action with your API key",
    code: `// Zapier: HTTP action
POST https://api.retainr.dev/v1/memories
Authorization: Bearer rec_live_...
{
  "content": "{{trigger.body}}",
  "scope": "user",
  "user_id": "{{user.email}}"
}`,
  },
]

export default function HomePage() {
  const latestPosts = allPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <main className="min-h-screen bg-gray-950 text-white">
        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">retainr</Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link>
              <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</Link>
              <Link href="/dashboard" className="text-sm bg-white text-gray-950 px-4 py-1.5 rounded-md font-medium hover:bg-gray-200 transition-colors">
                Get started free →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live on n8n &amp; Make.com — start free, no credit card
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Your AI agents finally<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">remember everything</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            n8n, Make.com, and Zapier run workflows in isolation — every execution starts blank.
            retainr gives your AI agents persistent memory across runs, users, and sessions.
          </p>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">
            One API call to store. One to search by meaning. Works natively in your existing workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto bg-white text-gray-950 px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start free — 1,000 ops/month
            </Link>
            <Link href="/blog/why-n8n-ai-agents-forget-everything" className="w-full sm:w-auto text-gray-400 hover:text-white px-8 py-3.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-center">
              Why agents forget →
            </Link>
          </div>

          <p className="text-xs text-gray-600 mt-4">No credit card. No setup. Free tier never expires.</p>
        </section>

        {/* ── Social proof numbers ────────────────────────────────────────── */}
        <section className="border-y border-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { n: "< 50ms", label: "median latency" },
              { n: "1536-dim", label: "vector embeddings" },
              { n: "99.9%", label: "uptime SLA" },
              { n: "GDPR", label: "compliant by default" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.n}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Platform tabs ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-4">Works in your existing stack</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Install the native node or module. No custom HTTP requests to maintain.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className={`text-2xl font-bold mb-1 ${p.color}`}>{p.name}</div>
                <p className="text-xs text-gray-500 mb-4">{p.install}</p>
                <pre className="text-xs text-gray-300 bg-gray-950 rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
                  {p.code}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section className="border-t border-gray-800 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Everything stateful AI workflows need</h2>
            <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
              Designed specifically for automation platforms. Not a developer library wrapped in a webhook.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section className="border-t border-gray-800 py-24 bg-gray-900/40">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Store memories as your workflow runs",
                  desc: "Every time your AI agent learns something — customer preference, conversation summary, task outcome — store it with one API call. Tag it, scope it to a user or session, set an expiry if needed.",
                  code: `POST /v1/memories
{
  "content": "Customer is price-sensitive, prefers email over calls",
  "scope": "user",
  "user_id": "{{ customer.id }}",
  "tags": ["preference", "contact"]
}`,
                },
                {
                  step: "02",
                  title: "Search by meaning, not keywords",
                  desc: "Before your agent responds, search for relevant context. retainr ranks memories by semantic similarity — 'what does this person care about?' surfaces the right context even if the wording differs.",
                  code: `POST /v1/memories/search
{
  "query": "how should I contact this customer?",
  "scope": "user",
  "user_id": "{{ customer.id }}",
  "limit": 5
}
→ "prefers email over calls" (score: 0.94)`,
                },
                {
                  step: "03",
                  title: "Inject context into your AI prompt",
                  desc: "Take the top results, format them as context, and prepend to your AI prompt. Your agent now responds with full history — without any external databases to manage.",
                  code: `System: You are a customer support agent.

Customer context:
- Prefers email over calls
- Price-sensitive, ask about discounts
- Previous issue: late delivery (resolved)

User: How can I get faster shipping?`,
                },
              ].map((item) => (
                <div key={item.step} className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <div className="text-5xl font-black text-gray-800 mb-3">{item.step}</div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <pre className="text-xs text-gray-300 bg-gray-950 border border-gray-800 rounded-xl p-5 font-mono leading-relaxed overflow-x-auto">
                    {item.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <section id="pricing" className="border-t border-gray-800 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
            <p className="text-gray-400 text-center mb-16">Start free. Upgrade when you hit the limit. Downgrade anytime.</p>
            <div className="grid md:grid-cols-4 gap-6">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-xl p-6 border flex flex-col ${
                    p.highlight
                      ? "border-white bg-white text-gray-950"
                      : "border-gray-700 bg-gray-900"
                  }`}
                >
                  {p.highlight && (
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Most popular</div>
                  )}
                  <div className="text-sm font-medium mb-2 opacity-60">{p.name}</div>
                  <div className="text-4xl font-bold mb-1">{p.price}</div>
                  <div className="text-sm opacity-50 mb-6">/month</div>
                  <ul className="space-y-2 text-sm mb-8 flex-1">
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {p.ops}/month</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {p.pdfs}/month</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All platforms</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Semantic search</li>
                    {p.name !== "Free" && (
                      <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Priority support</li>
                    )}
                  </ul>
                  <Link
                    href="/dashboard"
                    className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      p.highlight
                        ? "bg-gray-950 text-white hover:bg-gray-800"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="border-t border-gray-800 py-24 bg-gray-900/30">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Frequently asked questions</h2>
            <dl className="space-y-8">
              {faqJsonLd.mainEntity.map((item) => (
                <div key={item.name} className="border-b border-gray-800 pb-8">
                  <dt className="font-semibold text-white mb-3">{item.name}</dt>
                  <dd className="text-gray-400 leading-relaxed">{item.acceptedAnswer.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Latest blog posts ────────────────────────────────────────────── */}
        {latestPosts.length > 0 && (
          <section className="border-t border-gray-800 py-24">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold">From the blog</h2>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">All posts →</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <Link key={post.slug} href={post.url} className="group block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{post.description}</p>
                    <div className="text-xs text-gray-600">
                      {format(new Date(post.publishedAt), "MMM d, yyyy")} · {post.readingTime}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="border-t border-gray-800 py-24">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to give your agents memory?</h2>
            <p className="text-gray-400 mb-8">
              Start free. 1,000 memory operations per month, no credit card, no expiry.
              Upgrade when you need more.
            </p>
            <Link href="/dashboard" className="inline-block bg-white text-gray-950 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Create free account →
            </Link>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-800 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="font-bold mb-3">retainr</div>
                <p className="text-xs text-gray-500">AI agent memory for automation platforms.</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-400">Product</div>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
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
      </main>
    </>
  )
}
