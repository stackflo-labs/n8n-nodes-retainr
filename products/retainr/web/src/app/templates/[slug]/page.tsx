import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Nav } from "@/components/nav"

// ── Template data ─────────────────────────────────────────────────────────────

const templates = [
  {
    slug: "n8n-customer-service-ai-with-memory",
    platform: "n8n",
    platformColor: "#EA4B71",
    category: "Customer Service",
    title: "Customer Service AI with Persistent Memory",
    description: "An n8n AI agent that remembers every past interaction with a customer. No more repeating context — the agent recalls order history, preferences, and prior complaints automatically.",
    longDescription: `Most customer service bots forget everything the moment a session ends. Your customers repeat themselves every time they return — and your agents start from scratch.

This template wires an n8n AI Agent node to retainr so that every conversation is stored as a searchable memory. When a customer returns, the agent retrieves their full history in milliseconds and responds with context — creating the experience of a support rep who actually remembers them.

**What's included:**
- Trigger: incoming message (webhook, email, or Telegram — swap as needed)
- Memory retrieval: semantic search over the customer's past interactions
- AI Agent node using the retrieved context as system prompt enrichment
- Memory storage: the current conversation is saved back to retainr after each reply
- Optional: tag memories by sentiment for escalation routing`,
    steps: [
      "Import the workflow blueprint into n8n",
      "Add your retainr API key as an n8n credential",
      "Configure your trigger (webhook, email, or chat platform)",
      "Connect your LLM credential (OpenAI, Anthropic, or Ollama)",
      "Test with a sample customer message",
    ],
    tags: ["n8n", "AI Agent", "Memory", "Customer Service"],
    ops: "~50 memory ops/conversation",
    useCase: "Every time a customer sends a message, the agent runs a semantic search over their history before generating a reply. The conversation is then stored as a new memory. Typical usage: 50 ops per 10-message conversation.",
  },
  {
    slug: "n8n-lead-qualification-agent-memory",
    platform: "n8n",
    platformColor: "#EA4B71",
    category: "Sales",
    title: "Lead Qualification Agent that Remembers Context",
    description: "Qualify inbound leads with an AI agent that builds a persistent profile across multiple touchpoints. Each interaction enriches the lead record — no CRM field mapping required.",
    longDescription: `Lead qualification usually requires multiple back-and-forth touchpoints before you have enough signal to route or prioritise. Most automation platforms forget what was said in step 1 by the time step 5 runs.

This n8n workflow uses retainr to persist a growing qualification profile for each lead. Every interaction — form fill, email reply, call summary — is stored. When the lead touches the workflow again, the agent retrieves the full profile and continues where it left off.

**What's included:**
- Multi-source trigger: web form + email reply handler
- Semantic memory retrieval by lead email / CRM ID
- AI qualification node that scores and updates the lead profile
- Automatic HubSpot/Airtable update via built-in n8n nodes
- Memory write-back: new interaction stored for next touchpoint`,
    steps: [
      "Import the blueprint into n8n",
      "Set retainr API key credential",
      "Connect your CRM (HubSpot or Airtable node — pre-configured)",
      "Configure qualification scoring prompt in the AI node",
      "Set your lead routing logic in the Switch node",
    ],
    tags: ["n8n", "AI Agent", "Sales", "CRM"],
    ops: "~30 memory ops/lead",
    useCase: "On each lead touchpoint the workflow reads prior context (~5 memories), runs the AI qualifier, then writes 1 new memory with the updated score. 30 ops covers a 5-touchpoint qualification cycle.",
  },
  {
    slug: "make-com-shopify-customer-history",
    platform: "Make.com",
    platformColor: "#6D00CC",
    category: "E-commerce",
    title: "Shopify Order Follow-Up with Customer History",
    description: "Make.com scenario that sends personalised post-purchase follow-ups by retrieving the full purchase and support history for each Shopify customer via retainr.",
    longDescription: `Generic post-purchase emails get ignored. Personalised ones — referencing the customer's specific order, past purchases, and any support history — drive repeat revenue.

This Make.com scenario triggers on every new Shopify order, retrieves the customer's history from retainr, generates a tailored follow-up email via OpenAI, and sends it via your email provider of choice (Mailgun, SendGrid, or Resend).

**What's included:**
- Trigger: Shopify "New Order" webhook
- retainr HTTP module: retrieve customer memory by email
- OpenAI module: generate personalised email using history
- Email send (Mailgun / Resend — swap the module to match your provider)
- retainr HTTP module: store the new order as a memory for future personalisation`,
    steps: [
      "Import the scenario blueprint into Make.com",
      "Add retainr API key to the HTTP module headers",
      "Connect your Shopify store",
      "Add your OpenAI API key",
      "Connect your email provider module",
    ],
    tags: ["Make.com", "Shopify", "E-commerce", "Memory"],
    ops: "~10 memory ops/order",
    useCase: "Per order: 1 memory search (retrieve customer history) + 1 memory write (store new order). 10 ops includes future read-backs for repeat customers.",
  },
  {
    slug: "n8n-email-inbox-ai-with-memory",
    platform: "n8n",
    platformColor: "#EA4B71",
    category: "Productivity",
    title: "Email Inbox AI Assistant with Long-Term Memory",
    description: "Triage and draft email replies with an AI that knows your communication style, active projects, and ongoing threads — persisted across every session.",
    longDescription: `AI email drafters forget your context the moment you close the tab. This workflow gives your inbox assistant a persistent memory — your writing style, active projects, key contacts, and thread summaries — stored in retainr and retrieved automatically on each new email.

The assistant triages incoming email by priority, retrieves relevant thread history, drafts a reply in your voice, and optionally sends it (with your approval via a webhook confirmation step).

**What's included:**
- Gmail / IMAP trigger (configurable)
- Sender profile memory retrieval from retainr
- Thread summarisation stored as memory after each reply
- AI drafting node with style guide injection
- Optional human-in-the-loop approval step before send`,
    steps: [
      "Import the blueprint into n8n",
      "Authenticate your Gmail or IMAP account",
      "Add retainr API key credential",
      "Add your LLM credential",
      "Run the setup workflow to seed your style guide memory",
    ],
    tags: ["n8n", "Email", "AI Assistant", "Memory"],
    ops: "~20 memory ops/day",
    useCase: "Each email processed: 2 memory reads (sender history + active project context) + 1 memory write (thread summary). 20 ops covers ~7 emails/day.",
  },
  {
    slug: "zapier-sales-crm-enrichment-ai",
    platform: "Zapier",
    platformColor: "#FF4A00",
    category: "Sales",
    title: "Sales CRM Enrichment with AI Notes",
    description: "Every time a deal stage changes in HubSpot, a Zapier Zap asks an AI for next-step recommendations — informed by all prior AI notes stored in retainr memory.",
    longDescription: `CRM AI tools are expensive and locked to enterprise plans. This Zapier Zap uses retainr to give your HubSpot deal workflow a persistent AI memory — without upgrading your CRM.

On every deal stage change, the Zap retrieves all prior AI notes for that deal from retainr, asks an LLM for the most relevant next action, and writes the recommendation back to HubSpot as a note — plus stores it in retainr for future context.

**What's included:**
- Trigger: HubSpot Deal Stage Changed
- retainr HTTP step: search memories by deal ID
- ChatGPT / Claude step: generate next-step recommendation
- HubSpot step: create note on the deal
- retainr HTTP step: store new AI note as memory`,
    steps: [
      "Import the Zap template",
      "Connect your HubSpot account",
      "Add retainr API key to the Webhooks by Zapier step headers",
      "Add your OpenAI or Anthropic API key to the AI step",
      "Turn on the Zap",
    ],
    tags: ["Zapier", "HubSpot", "AI", "CRM"],
    ops: "~15 memory ops/deal",
    useCase: "Each stage change: 1 memory search + 1 memory write. A typical deal with 7 stage transitions uses ~15 ops.",
  },
]

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const t = templates.find((t) => t.slug === slug)
  if (!t) return {}
  return {
    title: `${t.title} — retainr Templates`,
    description: t.description,
    alternates: { canonical: `https://retainr.dev/templates/${t.slug}` },
    openGraph: {
      title: `${t.title} — retainr Templates`,
      description: t.description,
      url: `https://retainr.dev/templates/${t.slug}`,
      type: "website",
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const t = templates.find((t) => t.slug === slug)
  if (!t) notFound()

  const platformBadgeStyle = {
    backgroundColor: `${t.platformColor}18`,
    color: t.platformColor,
    border: `1px solid ${t.platformColor}30`,
  }

  // Parse longDescription: **bold** and newlines
  const renderDesc = (text: string) =>
    text.split("\n\n").map((para, i) => {
      if (para.startsWith("**What") || para.startsWith("**")) {
        const parts = para.split(/\*\*(.+?)\*\*/g)
        return (
          <p key={i} className="text-gray-700 leading-relaxed">
            {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
          </p>
        )
      }
      if (para.startsWith("-")) {
        const items = para.split("\n").filter(Boolean)
        return (
          <ul key={i} className="list-disc list-inside space-y-1 text-gray-600 text-sm">
            {items.map((item, j) => (
              <li key={j}>{item.replace(/^- /, "")}</li>
            ))}
          </ul>
        )
      }
      return (
        <p key={i} className="text-gray-700 leading-relaxed">
          {para}
        </p>
      )
    })

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />

      <article className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/templates" className="hover:text-gray-600 transition-colors">
            Templates
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{t.category}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={platformBadgeStyle}
            >
              {t.platform}
            </span>
            <span className="text-sm text-gray-400">{t.category}</span>
          </div>
          <h1 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl leading-tight">
            {t.title}
          </h1>
          <p className="text-lg text-gray-500">{t.description}</p>
        </header>

        {/* Usage note */}
        <div className="mb-8 rounded-xl border border-orange-100 bg-orange-50 px-5 py-4">
          <p className="text-sm font-semibold text-orange-800 mb-1">Usage estimate</p>
          <p className="text-sm text-orange-700">{t.useCase}</p>
        </div>

        {/* Long description */}
        <div className="mb-10 space-y-4 text-base">
          {renderDesc(t.longDescription)}
        </div>

        {/* Setup steps */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold">Setup steps</h2>
          <ol className="space-y-3">
            {t.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Tags */}
        <div className="mb-10 flex flex-wrap gap-2">
          {t.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Download CTA */}
        <div className="rounded-2xl bg-gray-950 px-8 py-10 text-center text-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Free download
          </p>
          <h2 className="mb-2 text-2xl font-black">{t.title}</h2>
          <p className="mb-6 text-gray-400 text-sm">
            Get a free API key first — 1,000 memory ops/month included. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-block rounded-xl bg-orange-600 px-8 py-3 font-semibold text-white transition hover:bg-orange-500"
            >
              Get free API key
            </Link>
            <Link
              href="/templates"
              className="inline-block rounded-xl border border-gray-700 px-8 py-3 text-sm font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Browse all templates
            </Link>
          </div>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: t.title,
            description: t.description,
            url: `https://retainr.dev/templates/${t.slug}`,
            applicationCategory: "AutomationApplication",
            operatingSystem: t.platform,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
          }),
        }}
      />
    </div>
  )
}
