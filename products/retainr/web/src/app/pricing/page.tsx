import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "Pricing - retainr AI Agent Memory API",
  description:
    "Start free with 1,000 memory ops/month. Upgrade to Builder (€29), Pro (€79), or Agency (€199) as your automation workflows scale. No credit card required to start.",
  alternates: { canonical: "https://retainr.dev/pricing" },
  openGraph: {
    title: "retainr Pricing - AI Agent Memory for Make.com, n8n & Zapier",
    description:
      "Start free with 1,000 memory ops/month. Paid plans from €29/month. Cancel anytime.",
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
      description: "1,000 memory ops/month, 1 workspace",
    },
    {
      "@type": "Offer",
      name: "Builder",
      price: "29",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "20,000 memory ops/month, 3 workspaces, email support",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "79",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "100,000 memory ops/month, 10 workspaces, priority support",
    },
    {
      "@type": "Offer",
      name: "Agency",
      price: "199",
      priceCurrency: "EUR",
      priceValidUntil: "2027-01-01",
      availability: "https://schema.org/InStock",
      url: "https://retainr.dev/dashboard",
      description: "Unlimited memory ops, unlimited workspaces, 99.9% SLA, dedicated support",
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
        text: "No. The free plan is permanent. You get 1,000 memory operations every month, forever - no credit card required. Limits reset on your billing anniversary.",
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
        text: "Yes. Cancel anytime from the dashboard - no contracts, no cancellation fees. You keep access until the end of the billing period.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if I exceed my monthly limit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "API calls return 429 Too Many Requests once you hit the monthly cap. Your existing memories are untouched - upgrade to resume operations immediately. We send an email warning at 80% usage.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an annual discount?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Annual billing saves you 2 months - equivalent to 17% off. Builder is €290/year (€24.17/month), Pro is €790/year (€65.83/month), Agency is €1,990/year (€165.83/month).",
      },
    },
    {
      "@type": "Question",
      name: "Does retainr work on all automation platforms?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every plan includes access to the n8n community node, Make.com module, and HTTP API for Zapier. Platform access is not gated by plan - only usage volume differs.",
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
      "1 workspace",
      "n8n node + Make.com module",
      "Semantic search (cosine similarity)",
      "TTL auto-expiry",
      "Community support",
    ],
    missing: ["Email support", "Custom TTL beyond 30 days", "SLA guarantee", "Dedicated support"],
    cta: "Start free - no credit card",
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
  { label: "Workspaces", values: ["1", "3", "10", "Unlimited"] },
  { label: "n8n community node", values: ["yes", "yes", "yes", "yes"] },
  { label: "Make.com module", values: ["yes", "yes", "yes", "yes"] },
  { label: "Semantic memory search", values: ["yes", "yes", "yes", "yes"] },
  { label: "TTL auto-expiry", values: ["30 days max", "90 days max", "Custom", "Custom"] },
  { label: "Support", values: ["Community", "Email 48h", "Email 12h", "Dedicated Slack"] },
  { label: "99.9% uptime SLA", values: ["-", "-", "-", "yes"] },
  { label: "Invoice billing", values: ["-", "-", "-", "yes"] },
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

      <div className="min-h-screen bg-white text-gray-900">
        <Nav />

        <div className="mx-auto max-w-6xl px-6 py-16">
          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black tracking-tight mb-4 md:text-5xl">
              Simple, usage-based pricing
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Start free. Upgrade when you hit the limit. Every plan includes n8n, Make.com, and the full
              API - pricing only differs by usage volume.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1 text-sm">
              <span className="rounded-lg bg-white border border-gray-200 px-4 py-1.5 text-gray-900 font-semibold shadow-sm">Monthly</span>
              <Link
                href="/dashboard?billing=annual"
                className="px-4 py-1.5 text-gray-500 hover:text-gray-900 transition"
              >
                Annual
                <span className="ml-2 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs text-green-700">
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
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.monthlyPrice}</span>
                    {plan.monthlyPrice !== "€0" && (
                      <span className={`text-sm ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>/month</span>
                    )}
                  </div>
                  {plan.monthlyPrice !== "€0" && (
                    <div className={`text-xs mt-0.5 ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>
                      or {plan.annualMonthly}/mo billed annually ({plan.annualPrice}/yr)
                    </div>
                  )}
                  <p className={`text-sm mt-3 leading-relaxed ${plan.highlight ? "text-gray-300" : "text-gray-500"}`}>{plan.desc}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? "text-orange-400" : "text-green-600"}`}>✓</span>
                      <span className={plan.highlight ? "text-gray-200" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? "text-gray-700" : "text-gray-300"}`}>-</span>
                      <span className={plan.highlight ? "text-gray-600" : "text-gray-300"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-700"
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
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-4 px-6 text-left text-gray-500 font-medium w-1/3">Feature</th>
                    {PLANS.map((p) => (
                      <th
                        key={p.name}
                        className={`py-4 px-4 text-center font-semibold ${
                          p.highlight ? "text-orange-600" : "text-gray-900"
                        }`}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-6 text-gray-500">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3 px-4 text-center ${
                            v === "yes" ? "text-green-600" : v === "-" ? "text-gray-300" : "text-gray-700"
                          } ${PLANS[i]?.highlight ? "bg-orange-50/50" : ""}`}
                        >
                          {v === "yes" ? "✓" : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Price row */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-4 px-6 text-gray-900">Monthly price</td>
                    {PLANS.map((p) => (
                      <td
                        key={p.name}
                        className={`py-4 px-4 text-center ${p.highlight ? "text-orange-600" : "text-gray-900"}`}
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
            <dl className="max-w-3xl mx-auto space-y-0 divide-y divide-gray-100">
              {faqPricingJsonLd.mainEntity.map((item) => (
                <div key={item.name} className="py-8">
                  <dt className="font-semibold text-gray-900 mb-3">{item.name}</dt>
                  <dd className="text-gray-500 leading-relaxed text-sm">{item.acceptedAnswer.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Enterprise */}
          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center mb-12">
            <h2 className="text-xl font-bold mb-3">Need higher volume or a custom contract?</h2>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
              If you need more than Agency limits, custom data residency, or a procurement-friendly contract,
              reach out. We support enterprise invoicing and EU data processing agreements.
            </p>
            <a
              href="mailto:hello@retainr.dev"
              className="inline-block rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:border-gray-400 transition"
            >
              Contact us
            </a>
          </section>
        </div>

        {/* CTA banner */}
        <section className="border-t border-gray-100 bg-gray-900 py-16 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Start for free. Scale when you need to.</h2>
          <p className="mb-6 text-gray-400">
            1,000 memory operations per month. No credit card. No time limit.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-white px-10 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            Create free account
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="font-bold mb-3 text-gray-900">retainr</div>
                <p className="text-xs text-gray-400">AI agent memory for automation platforms.</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-500">Product</div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                  <li><Link href="/docs" className="hover:text-gray-900 transition-colors">API docs</Link></li>
                  <li><Link href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-500">Integrations</div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/blog/n8n-ai-agent-memory-tutorial" className="hover:text-gray-900 transition-colors">n8n node</Link></li>
                  <li><Link href="/blog/make-com-openai-memory-tutorial" className="hover:text-gray-900 transition-colors">Make.com module</Link></li>
                  <li><Link href="/blog/zapier-ai-workflows-persistent-context" className="hover:text-gray-900 transition-colors">Zapier action</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3 text-gray-500">Company</div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
                  <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} retainr. All rights reserved.</p>
              <p className="text-xs text-gray-400">GDPR compliant · Data stored in EU (Hetzner, Germany)</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
