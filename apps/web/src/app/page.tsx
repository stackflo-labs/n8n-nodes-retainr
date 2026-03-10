import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">retainr</span>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-sm bg-white text-gray-950 px-4 py-1.5 rounded-md font-medium hover:bg-gray-200 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Native Make.com module and n8n node available
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          AI agent memory<br />
          <span className="text-gray-400">for your automations</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Persistent memory for Make.com, n8n, and Zapier workflows.
          Your AI agents finally remember users, sessions, and context — without writing a single line of code.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard" className="bg-white text-gray-950 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start for free
          </Link>
          <Link href="/docs" className="text-gray-400 hover:text-white px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
            View docs
          </Link>
        </div>
      </section>

      {/* Code example */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-500">POST /v1/memories/search</span>
          </div>
          <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
{`curl https://api.retainr.dev/v1/memories/search \\
  -H "Authorization: Bearer rec_live_..." \\
  -d '{
    "query": "what does this user prefer?",
    "scope": "user",
    "user_id": "user_123",
    "limit": 5
  }'

// Response
{
  "results": [
    {
      "content": "User prefers formal tone, asks about pricing first",
      "score": 0.94,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Everything your AI agent needs to remember</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Session memory", desc: "Keep context within a single workflow run. Agents remember what happened earlier in the same execution." },
              { title: "User memory", desc: "Persist preferences, history, and context across sessions. Users don't have to repeat themselves." },
              { title: "Semantic search", desc: "Find relevant memories by meaning, not keywords. Powered by vector embeddings for accurate recall." },
              { title: "Native integrations", desc: "One-click install on Make.com, n8n, and Zapier. No code, no webhooks, just connect and go." },
              { title: "PDF generation", desc: "Generate invoices, quotes, and contracts from templates. Included in every plan." },
              { title: "Auto-expiry (TTL)", desc: "Set memory lifetimes. Session data expires automatically. GDPR-friendly by design." }
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-gray-400 text-center mb-16">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Free", price: "€0", ops: "1,000 ops", pdfs: "10 PDFs", cta: "Get started", highlight: false },
              { name: "Builder", price: "€29", ops: "20,000 ops", pdfs: "200 PDFs", cta: "Start building", highlight: false },
              { name: "Pro", price: "€79", ops: "100,000 ops", pdfs: "2,000 PDFs", cta: "Go pro", highlight: true },
              { name: "Agency", price: "€199", ops: "Unlimited", pdfs: "Unlimited", cta: "Contact us", highlight: false }
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-6 border ${p.highlight ? "border-white bg-white text-gray-950" : "border-gray-700 bg-gray-900"}`}>
                <div className="text-sm font-medium mb-2 opacity-60">{p.name}</div>
                <div className="text-3xl font-bold mb-1">{p.price}</div>
                <div className="text-sm opacity-60 mb-6">/month</div>
                <ul className="space-y-2 text-sm mb-8">
                  <li>{p.ops}/month</li>
                  <li>{p.pdfs}/month</li>
                  <li>All integrations</li>
                </ul>
                <Link href="/dashboard" className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${p.highlight ? "bg-gray-950 text-white hover:bg-gray-800" : "bg-gray-800 text-white hover:bg-gray-700"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <span>retainr.dev</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms</Link>
            <Link href="/docs" className="hover:text-gray-300">API Docs</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
