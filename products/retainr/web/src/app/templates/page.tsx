import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "Free AI Workflow Templates — retainr",
  description: "Download free n8n, Make.com, and Zapier workflow templates with persistent AI memory. Ready-to-import blueprints for customer service, sales, and automation.",
  alternates: { canonical: "https://retainr.dev/templates" },
  openGraph: {
    title: "Free AI Workflow Templates — retainr",
    description: "Download free n8n, Make.com, and Zapier workflow templates with persistent AI memory.",
    url: "https://retainr.dev/templates",
    type: "website",
  },
}

const templates = [
  {
    slug: "n8n-customer-service-ai-with-memory",
    platform: "n8n",
    platformColor: "#EA4B71",
    category: "Customer Service",
    title: "Customer Service AI with Persistent Memory",
    description: "An n8n AI agent that remembers every past interaction with a customer. No more repeating context — the agent recalls order history, preferences, and prior complaints automatically.",
    tags: ["n8n", "AI Agent", "Memory", "Customer Service"],
    ops: "~50 memory ops/conversation",
  },
  {
    slug: "n8n-lead-qualification-agent-memory",
    platform: "n8n",
    platformColor: "#EA4B71",
    category: "Sales",
    title: "Lead Qualification Agent that Remembers Context",
    description: "Qualify inbound leads with an AI agent that builds a persistent profile across multiple touchpoints. Each interaction enriches the lead record — no CRM field mapping required.",
    tags: ["n8n", "AI Agent", "Sales", "CRM"],
    ops: "~30 memory ops/lead",
  },
  {
    slug: "make-com-shopify-customer-history",
    platform: "Make.com",
    platformColor: "#6D00CC",
    category: "E-commerce",
    title: "Shopify Order Follow-Up with Customer History",
    description: "Make.com scenario that sends personalised post-purchase follow-ups by retrieving the full purchase and support history for each Shopify customer via retainr.",
    tags: ["Make.com", "Shopify", "E-commerce", "Memory"],
    ops: "~10 memory ops/order",
  },
  {
    slug: "n8n-email-inbox-ai-with-memory",
    platform: "n8n",
    platformColor: "#EA4B71",
    category: "Productivity",
    title: "Email Inbox AI Assistant with Long-Term Memory",
    description: "Triage and draft email replies with an AI that knows your communication style, active projects, and ongoing threads — persisted across every session.",
    tags: ["n8n", "Email", "AI Assistant", "Memory"],
    ops: "~20 memory ops/day",
  },
  {
    slug: "zapier-sales-crm-enrichment-ai",
    platform: "Zapier",
    platformColor: "#FF4A00",
    category: "Sales",
    title: "Sales CRM Enrichment with AI Notes",
    description: "Every time a deal stage changes in HubSpot, a Zapier Zap asks an AI for next-step recommendations — informed by all prior AI notes stored in retainr memory.",
    tags: ["Zapier", "HubSpot", "AI", "CRM"],
    ops: "~15 memory ops/deal",
  },
]

const platformBadgeStyle = (color: string) => ({
  backgroundColor: `${color}18`,
  color,
  border: `1px solid ${color}30`,
})

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-14 text-center">
        <div className="mb-4 inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm text-orange-700">
          Free to download — API key required
        </div>
        <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
          Workflow templates with<br />
          <span className="text-orange-600">persistent AI memory</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500">
          Ready-to-import blueprints for n8n, Make.com, and Zapier. Each template is pre-wired to the retainr API — your AI agents remember context across every run.
        </p>
      </section>

      {/* Template grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {templates.map((t) => (
            <Link
              key={t.slug}
              href={`/templates/${t.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-400 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={platformBadgeStyle(t.platformColor)}
                >
                  {t.platform}
                </span>
                <span className="text-xs text-gray-400">{t.category}</span>
              </div>

              <h2 className="mb-2 text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">
                {t.title}
              </h2>

              <p className="mb-4 flex-1 text-sm text-gray-500 leading-relaxed">
                {t.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.slice(1).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-xs text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="ml-3 shrink-0 text-xs text-gray-400">{t.ops}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gray-950 px-8 py-10 text-center text-white">
          <h2 className="mb-2 text-2xl font-black">Get your free API key</h2>
          <p className="mb-6 text-gray-400">
            All templates require a retainr API key. Free plan includes 1,000 memory ops per month — no credit card needed.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-orange-600 px-8 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            Create free account
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Free AI Workflow Templates — retainr",
            description: "Free n8n, Make.com, and Zapier workflow templates with persistent AI memory.",
            url: "https://retainr.dev/templates",
            hasPart: templates.map((t) => ({
              "@type": "SoftwareApplication",
              name: t.title,
              url: `https://retainr.dev/templates/${t.slug}`,
              applicationCategory: "AutomationApplication",
              operatingSystem: t.platform,
            })),
          }),
        }}
      />
    </div>
  )
}
