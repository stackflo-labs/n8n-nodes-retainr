import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pricing — retainr AI Agent Memory API",
  description:
    "Start free with 1,000 memory ops/month. Upgrade to Builder (€29), Pro (€79), or Agency (€199) as your automation workflows scale. No credit card required to start.",
  alternates: { canonical: "https://retainr.dev/pricing" },
  openGraph: {
    title: "retainr Pricing — AI Agent Memory for Make.com, n8n & Zapier",
    description:
      "Free plan includes 1,000 memory ops and 10 PDF generations per month. Paid plans from €29/month. Cancel anytime.",
    url: "https://retainr.dev/pricing",
  },
}

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "retainr",
  description:
    "Persistent AI agent memory API for Make.com, n8n, and Zapier automation workflows. Store and search context with pgvector semantic similarity.",
  url: "https://retainr.dev",
  brand: { "@type": "Brand", name: "retainr" },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "1,000 memory ops, 10 PDFs/month, 1 workspace",
    },
    {
      "@type": "Offer",
      name: "Builder",
      price: "29",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "20,000 memory ops, 200 PDFs/month, 3 workspaces, email support",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "79",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "100,000 memory ops, 2,000 PDFs/month, 10 workspaces, priority support",
    },
    {
      "@type": "Offer",
      name: "Agency",
      price: "199",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "Unlimited memory ops and PDFs, unlimited workspaces, 99.9% SLA, dedicated support",
    },
  ],
}

const faqPricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does the free plan expire?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The free plan is permanent. You get 1,000 memory operations and 10 PDFs every month, forever — no credit card required. Limits reset on your billing anniversary.",
      },
    },
    {
      "@type": "Question",
      name: "What counts as a memory operation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each store or search API call counts as one memory operation. Delete calls are free and do not count. Searching for 5 memories in a single call is still 1 operation.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cancel anytime from the dashboard — no contracts, no cancellation fees. You keep access until the end of the billing period.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if I exceed my monthly limit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "API calls return 429 Too Many Requests once you hit the monthly cap. Your existing memories are untouched — upgrade to resume operations immediately. We send an email warning at 80% usage.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an annual discount?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Annual billing saves you 2 months — equivalent to 17% off. Builder is €290/year (€24.17/month), Pro is €790/year (€65.83/month), Agency is €1,990/year (€165.83/month).",
      },
    },
    {
      "@type": "Question",
      name: "Does retainr work on all automation platforms?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every plan includes access to the n8n community node, Make.com module, and HTTP API for Zapier. Platform access is not gated by plan — only usage volume differs.",
      },
    },
  ],
}

const PLANS = [
  {
    name: "Free",
    monthlyPrice: "€0",
    annualPrice: "€0",
    annualMonthly: "€0",
    desc: "For trying retainr and personal automation projects.",
    highlight: false,
    badge: null,
    features: [
      "1,000 memory ops / month",
      "10 PDF generations / month",
      "1 workspace",
      "n8n node + Make.com module",
      "Semantic search (cosine similarity)",
      "TTL auto-expiry",
      "Community support",
    ],
    missing: ["Email support", "Custom TTL beyond 30 days", "SLA guarantee", "Dedicated support"],
    cta: "Start free — no credit card",
    ctaHref: "/dashboard",
  },
  {
    name: "Builder",
    monthlyPrice: "€29",
    annualPrice: "€290",
    annualMonthly: "€24",
    desc: "For solo builders running production automation workflows.",
    highlight: false,
    badge: null,
    features: [
      "20,000 memory ops / month",
      "200 PDF generations / month",
      "3 workspaces",
      "n8n node + Make.com module",
      "Semantic search",
      "TTL auto-expiry (up to 90 days)",
      "Email support (48h response)",
      "API access (all endpoints)",
    ],
    missing: ["Priority support", "Custom TTL beyond 90 days", "SLA guarantee"],
    cta: "Start building",
    ctaHref: "/dashboard",
  },
  {
    name: "Pro",
    monthlyPrice: "€79",
    annualPrice: "€790",
    annualMonthly: "€66",
    desc: "For teams running multiple client workflows on a single account.",
    highlight: true,
    badge: "Most popular",
    features: [
      "100,000 memory ops / month",
      "2,000 PDF generations / month",
      "10 workspaces",
      "n8n node + Make.com module",
      "Semantic search",
      "Custom TTL (any duration)",
      "Priority email support (12h response)",
      "API access (all endpoints)",
      "Usage dashboard + alerts",
    ],
    missing: ["SLA guarantee", "Dedicated support channel"],
    cta: "Go pro",
    ctaHref: "/dashboard",
  },
  {
    name: "Agency",
    monthlyPrice: "€199",
    annualPrice: "€1,990",
    annualMonthly: "€166",
    desc: "For agencies and platforms building memory into client products.",
    highlight: false,
    badge: null,
    features: [
      "Unlimited memory ops",
      "Unlimited PDF generations",
      "Unlimited workspaces",
      "n8n node + Make.com module",
      "Semantic search",
      "Custom TTL (any duration)",
      "99.9% uptime SLA",
      "Dedicated support (Slack channel)",
      "Usage dashboard + alerts",
      "Invoice billing available",
    ],
    missing: [],
    cta: "Get started",
    ctaHref: "/dashboard",
  },
]

const COMPARISON_ROWS: { label: string; values: string[] }[] = [
  { label: "Memory ops / month", values: ["1,000", "20,000", "100,000", "Unlimited"] },
  { label: "PDF generations / month", values: ["10", "200", "2,000", "Unlimited"] },
  { label: "Workspaces", values: ["1", "3", "10", "Unlimited"] },
  { label: "n8n community node", values: ["✓", "✓", "✓", "✓"] },
  { label: "Make.com module", values: ["✓", "✓", "✓", "✓"] },
  { label: "Semantic memory search", values: ["✓", "✓", "✓", "✓"] },
  { label: "TTL auto-expiry", values: ["30 days max", "90 days max", "Custom", "Custom"] },
  { label: "Support", values: ["Community", "Email 48h", "Email 12h", "Dedicated Slack"] },
  { label: "99.9% uptime SLA", values: ["—", "—", "—", "✓"] },
  { label: "Invoice billing", values: ["—", "—", "—", "✓"] },
]

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPricingJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-violet-400">
              retainr
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="text-white">
                Pricing
              </Link>
              <Link href="/blog" className="hover:text-white transition">
                Blog
              </Link>
              <Link href="/docs" className="hover:text-white transition">
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

        <div className="mx-auto max-w-6xl px-6 py-16">
          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 md:text-5xl">
              Simple, usage-based pricing
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Start free. Upgrade when you hit the limit. Every plan includes n8n, Make.com, and the full
              API — pricing only differs by usage volume.
            </p>

            {/* Billing toggle (visual only — links to annual Stripe checkout) */}
            <div className="inline-flex items-center rounded-xl border border-gray-800 bg-gray-900 p-1 text-sm">
              <span className="rounded-lg bg-white px-4 py-1.5 text-gray-950 font-semibold">Monthly</span>
              <Link
                href="/dashboard?billing=annual"
                className="px-4 py-1.5 text-gray-400 hover:text-white transition"
              >
                Annual
                <span className="ml-2 rounded-full bg-green-900/60 px-2 py-0.5 text-xs text-green-300 border border-green-700/40">
                  Save 17%
                </span>
              </Link>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-violet-500 bg-violet-950/30"
                    : "border-gray-800 bg-gray-900/60"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.monthlyPrice}</span>
                    {plan.monthlyPrice !== "€0" && (
                      <span className="text-gray-500 text-sm">/month</span>
                    )}
                  </div>
                  {plan.monthlyPrice !== "€0" && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      or {plan.annualMonthly}/mo billed annually ({plan.annualPrice}/yr)
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-700 mt-0.5 shrink-0">—</span>
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Feature comparison table */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-center mb-8">Full comparison</h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/80">
                    <th className="py-4 px-6 text-left text-gray-400 font-medium w-1/3">Feature</th>
                    {PLANS.map((p) => (
                      <th
                        key={p.name}
                        className={`py-4 px-4 text-center font-semibold ${
                          p.highlight ? "text-violet-300" : "text-white"
                        }`}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="hover:bg-gray-900/40 transition">
                      <td className="py-3 px-6 text-gray-400">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3 px-4 text-center ${
                            v === "✓" ? "text-green-400" : v === "—" ? "text-gray-700" : "text-gray-300"
                          } ${PLANS[i]?.highlight ? "bg-violet-950/10" : ""}`}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Price row */}
                  <tr className="bg-gray-900/60 font-semibold">
                    <td className="py-4 px-6 text-white">Monthly price</td>
                    {PLANS.map((p) => (
                      <td
                        key={p.name}
                        className={`py-4 px-4 text-center ${p.highlight ? "text-violet-300" : "text-white"}`}
                      >
                        {p.monthlyPrice}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-10">Pricing FAQ</h2>
            <dl className="max-w-3xl mx-auto space-y-8">
              {faqPricingJsonLd.mainEntity.map((item) => (
                <div key={item.name} className="border-b border-gray-800 pb-8">
                  <dt className="font-semibold text-white mb-3">{item.name}</dt>
                  <dd className="text-gray-400 leading-relaxed text-sm">{item.acceptedAnswer.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Enterprise / custom */}
          <section className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 text-center mb-12">
            <h2 className="text-xl font-bold mb-3">Need higher volume or a custom contract?</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
              If you need more than Agency limits, custom data residency, or a procurement-friendly contract,
              reach out. We support enterprise invoicing and EU data processing agreements.
            </p>
            <a
              href="mailto:hello@retainr.dev"
              className="inline-block rounded-xl border border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-500 transition"
            >
              Contact us →
            </a>
          </section>
        </div>

        {/* CTA banner */}
        <section className="border-t border-white/10 bg-violet-950/20 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Start for free. Scale when you need to.</h2>
          <p className="mb-6 text-gray-400">
            1,000 memory operations per month. No credit card. No time limit.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-violet-600 px-10 py-3.5 font-semibold text-white hover:bg-violet-500 transition"
          >
            Create free account →
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-10">
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
