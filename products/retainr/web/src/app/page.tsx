import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { format } from "date-fns"
import { Nav } from "@/components/nav"
import { PlatformCarousel } from "@/components/platform-carousel"

// ── Platform logos (Simple Icons paths) ────────────────────────────────────

function N8nLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="n8n" fill="#EA4B71">
      <path d="M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632" />
    </svg>
  )
}

function MakeLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Make.com" fill="#6D00CC">
      <path d="M13.38 3.498c-.27 0-.511.19-.566.465L9.85 18.986a.578.578 0 0 0 .453.678l4.095.826a.58.58 0 0 0 .682-.455l2.963-15.021a.578.578 0 0 0-.453-.678l-4.096-.826a.589.589 0 0 0-.113-.012zm-5.876.098a.576.576 0 0 0-.516.318L.062 17.697a.575.575 0 0 0 .256.774l3.733 1.877a.578.578 0 0 0 .775-.258l6.926-13.781a.577.577 0 0 0-.256-.776L7.762 3.658a.571.571 0 0 0-.258-.062zm11.74.115a.576.576 0 0 0-.576.576v15.426c0 .318.258.578.576.578h4.178a.58.58 0 0 0 .578-.578V4.287a.578.578 0 0 0-.578-.576Z" />
    </svg>
  )
}

function ZapierLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Zapier" fill="#FF4A00">
      <path d="M4.157 0A4.151 4.151 0 0 0 0 4.161v15.678A4.151 4.151 0 0 0 4.157 24h15.682A4.152 4.152 0 0 0 24 19.839V4.161A4.152 4.152 0 0 0 19.839 0H4.157Zm10.61 8.761h.03a.577.577 0 0 1 .23.038.585.585 0 0 1 .201.124.63.63 0 0 1 .162.431.612.612 0 0 1-.162.435.58.58 0 0 1-.201.128.58.58 0 0 1-.23.042.529.529 0 0 1-.235-.042.585.585 0 0 1-.332-.328.559.559 0 0 1-.038-.235.613.613 0 0 1 .17-.431.59.59 0 0 1 .405-.162Zm2.853 1.572c.03.004.061.004.095.004.325-.011.646.064.937.219.238.144.431.355.552.609.128.279.189.582.185.888v.193a2 2 0 0 1 0 .219h-2.498c.003.227.075.45.204.642a.78.78 0 0 0 .646.265.714.714 0 0 0 .484-.136.642.642 0 0 0 .23-.318l.915.257a1.398 1.398 0 0 1-.28.537c-.14.159-.321.284-.521.355a2.234 2.234 0 0 1-.836.136 1.923 1.923 0 0 1-1.001-.245 1.618 1.618 0 0 1-.665-.703 2.221 2.221 0 0 1-.227-1.036 1.95 1.95 0 0 1 .48-1.398 1.9 1.9 0 0 1 1.3-.488Zm-9.607.023c.162.004.325.026.48.079.207.065.4.174.563.314.26.302.393.692.366 1.088v2.276H8.53l-.109-.711h-.065c-.064.163-.155.31-.272.439a1.122 1.122 0 0 1-.374.264 1.023 1.023 0 0 1-.453.083 1.334 1.334 0 0 1-.866-.264.965.965 0 0 1-.329-.801.993.993 0 0 1 .076-.431 1.02 1.02 0 0 1 .242-.363 1.478 1.478 0 0 1 1.043-.303h.952v-.181a.696.696 0 0 0-.136-.454.553.553 0 0 0-.438-.154.695.695 0 0 0-.378.086.48.48 0 0 0-.193.254l-.99-.144a1.26 1.26 0 0 1 .257-.563c.14-.174.321-.302.533-.378.261-.091.54-.136.82-.129.053-.003.106-.007.163-.007Zm4.384.007c.174 0 .347.038.506.114.182.083.34.211.458.374.257.423.377.911.351 1.406a2.53 2.53 0 0 1-.355 1.448 1.148 1.148 0 0 1-1.009.517c-.204 0-.401-.045-.582-.136a1.052 1.052 0 0 1-.48-.457 1.298 1.298 0 0 1-.114-.234h-.045l.004 1.784h-1.059v-4.713h.904l.117.805h.057c.068-.208.177-.401.328-.56a1.129 1.129 0 0 1 .843-.344h.076v-.004Zm7.559.084h.903l.113.805h.053a1.37 1.37 0 0 1 .235-.484.813.813 0 0 1 .313-.242.82.82 0 0 1 .39-.076h.234v1.051h-.401a.662.662 0 0 0-.313.008.623.623 0 0 0-.272.155.663.663 0 0 0-.174.26.683.683 0 0 0-.027.314v1.875h-1.054v-3.666Zm-17.515.003h3.262v.896L3.73 13.104l.034.113h1.973l.042.9H2.4v-.9l1.931-1.754-.045-.117H2.441v-.896Zm11.815 0h1.055v3.659h-1.055V10.45Zm3.443.684.019.016a.69.69 0 0 0-.351.045.756.756 0 0 0-.287.204c-.11.155-.174.336-.189.522h1.545c-.034-.526-.257-.787-.74-.787h.003Zm-5.718.163c-.026 0-.057 0-.083.004a.78.78 0 0 0-.31.053.746.746 0 0 0-.257.189 1.016 1.016 0 0 0-.204.695v.064c-.015.257.057.507.204.711a.634.634 0 0 0 .253.196.638.638 0 0 0 .314.061.644.644 0 0 0 .578-.265c.14-.223.204-.48.189-.74a1.216 1.216 0 0 0-.181-.711.677.677 0 0 0-.503-.257Zm-4.509 1.266a.464.464 0 0 0-.268.102.373.373 0 0 0-.114.276c0 .053.008.106.027.155a.375.375 0 0 0 .087.132.576.576 0 0 0 .397.11v.004a.863.863 0 0 0 .563-.182.573.573 0 0 0 .211-.457v-.14h-.903Z" />
    </svg>
  )
}

// ── Animated hero visual ───────────────────────────────────────────────────

function HMsg({
  from, text, delay, highlight,
}: {
  from: "user" | "ai"; text: string; delay: string; highlight?: boolean
}) {
  const isUser = from === "user"
  return (
    <div
      className={`anim-fade-up flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animationDelay: delay }}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
          isUser
            ? "bg-gray-900 text-white"
            : highlight
            ? "border border-emerald-100 bg-emerald-50 text-emerald-800"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {text}
      </div>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs font-semibold text-gray-600">Customer Support Bot</span>
        </div>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-600">
          retainr active
        </span>
      </div>

      {/* Chat messages */}
      <div className="min-h-[220px] space-y-2.5 bg-white p-4">
        <HMsg from="user" text="Hi — what's the status of my refund?" delay="0.3s" />
        <HMsg from="ai"   text="Hi Sarah! Your refund for order #8821 was submitted on March 5. Looks good so far." delay="1.2s" />
        <div
          className="anim-fade-up py-1.5 text-center text-[10px] text-gray-400"
          style={{ animationDelay: "2.2s" }}
        >
          — 3 days later —
        </div>
        <HMsg from="user" text="Any news on that refund?" delay="2.8s" />
        <HMsg
          from="ai"
          text="Order #8821 was refunded €49.99 on March 8 — should hit your account today."
          delay="3.8s"
          highlight
        />
      </div>

      {/* API strip — shows what retainr did under the hood */}
      <div
        className="anim-fade-up border-t border-gray-200 bg-gray-950 px-4 py-3.5"
        style={{ animationDelay: "4.8s" }}
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          retainr — called automatically before reply
        </p>
        <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
          <p>
            <span className="text-blue-400">GET</span>{" "}
            <span className="text-gray-400">/v1/memories/search</span>
          </p>
          <p className="text-gray-600">&nbsp;&nbsp;?query=refund+status&amp;user_id=sarah@acme.com&amp;limit=5</p>
          <div className="my-2 border-t border-gray-800" />
          <p className="text-emerald-400">
            › &quot;Refund requested for order #8821 on March 5&quot;
            <span className="ml-2 text-gray-600">0.97</span>
          </p>
          <p className="text-emerald-400">
            › &quot;Customer is on Pro plan, high priority&quot;
            <span className="ml-2 text-gray-600">0.84</span>
          </p>
          <p className="mt-1.5 text-gray-600">2 memories retrieved · 41ms</p>
        </div>
      </div>
    </div>
  )
}

// ── JSON-LD ────────────────────────────────────────────────────────────────

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

const faqData = [
  {
    q: "Why does my AI automation forget everything between runs?",
    a: "Make.com, n8n, and Zapier run each scenario or workflow as an isolated execution. When it finishes, all context is gone. The next run starts completely fresh - which means your AI has no memory of previous conversations.",
  },
  {
    q: "Do I need to write code to use retainr?",
    a: "No. Install the retainr node from the n8n community library or the retainr module from the Make.com app marketplace. Add your API key and you are done. No code, no databases, no configuration.",
  },
  {
    q: "How does retainr find the right memories?",
    a: "retainr uses semantic search - it finds memories that are relevant in meaning, not just keyword matches. So if a customer mentioned a billing issue three weeks ago in different words, retainr still surfaces that context.",
  },
  {
    q: "Is my customers data safe?",
    a: "Yes. Each contact's memory is isolated and scoped to their unique ID. You can delete a contact's entire memory with one API call - permanently. We do not use your data to train models.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const latestPosts = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="min-h-screen bg-white text-gray-900">
        <Nav />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700">
                Works with Make.com, n8n, and Zapier
              </div>
              <h1 className="mb-6 text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
                Your AI forgot
                <br />
                your customer.
                <br />
                <span className="text-orange-600">Retain</span> everything.
              </h1>
              <p className="mb-8 max-w-lg text-xl leading-relaxed text-gray-500">
                Every workflow run starts fresh. No memory of past conversations, no context from previous interactions, no way to improve over time. retainr fixes that - one extra step in your existing workflow.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-700"
                >
                  Start for free
                </Link>
                <Link
                  href="/docs"
                  className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                >
                  See how it works
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Free plan includes 1,000 memory operations per month. No credit card required.
              </p>
            </div>
            <div>
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* ── Platform carousel ─────────────────────────────────────────── */}
        <section className="border-y border-gray-100 bg-gray-50 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Plugs into the tools you already use
            </p>
            <PlatformCarousel
              n8nIcon={<N8nLogo size={18} />}
              makeIcon={<MakeLogo size={18} />}
              zapierIcon={<ZapierLogo size={18} />}
            />
          </div>
        </section>

        {/* ── Problem ───────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="mb-6 text-4xl font-black tracking-tight">
                The problem with AI automations today
              </h2>
              <div className="space-y-5 text-gray-500">
                <p className="text-lg leading-relaxed">
                  You built an AI automation. A customer service bot, a lead follow-up sequence, a content assistant. It worked great in testing.
                </p>
                <p className="text-lg leading-relaxed">
                  Then a real customer came back three days later and your AI treated them like a complete stranger. Asked the same questions. Gave the same generic response. Wasted their time.
                </p>
                <p className="text-lg leading-relaxed font-medium text-gray-700">
                  This is not a bug. It is how Make.com, n8n, and Zapier work by design. Every run is isolated. Your AI gets no history, no context, no previous conversations - unless you build the memory layer yourself.
                </p>
                <p className="text-lg leading-relaxed">
                  Most people do not. That is why most AI automations feel cheap and forgettable.
                </p>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-8">
              <h3 className="font-semibold text-gray-900">Sound familiar?</h3>
              {[
                "My AI chatbot keeps asking customers for their email even though they gave it last week.",
                "Every time the workflow runs, the AI has no idea what happened in previous conversations.",
                "I want my AI to get smarter over time, not start from zero every single run.",
                "Clients are noticing. The bot feels dumb.",
              ].map((quote, i) => (
                <blockquote key={i} className="border-l-2 border-orange-300 pl-4 text-sm italic text-gray-500">
                  &ldquo;{quote}&rdquo;
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── Solution ──────────────────────────────────────────────────── */}
        <section className="border-y border-gray-100 bg-gray-50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">The fix</p>
              <h2 className="mb-4 text-4xl font-black tracking-tight">
                One extra step. Permanent memory.
              </h2>
              <p className="text-xl text-gray-500">
                Add the retainr step to your existing workflow. From that point on, your AI recalls every relevant past interaction before responding - and saves the new one automatically.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Your workflow today
                </p>
                <FlowNode label="Trigger" sub="Customer sends a message" connector />
                <FlowNode label="AI step" sub="Generate a response" connector />
                <FlowNode label="Send reply" sub="Response delivered" />
                <p className="mt-6 text-sm text-red-400">No memory. Starts fresh every time.</p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-white p-8">
                <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-orange-600">
                  Your workflow with retainr
                </p>
                <FlowNode label="Trigger" sub="Customer sends a message" connector />
                <FlowNode label="retainr - Recall" sub="Fetch relevant past context" highlight connector />
                <FlowNode label="AI step" sub="Respond with full context" connector />
                <FlowNode label="retainr - Store" sub="Save this interaction" highlight connector />
                <FlowNode label="Send reply" sub="Response delivered" />
                <p className="mt-6 text-sm text-emerald-600">Your AI remembers. Every time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Setup steps ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">
                Setup in minutes
              </p>
              <h2 className="mb-8 text-4xl font-black tracking-tight">
                No databases. No code. No configuration.
              </h2>
              <div className="space-y-7">
                {[
                  {
                    n: 1,
                    title: "Install retainr in your platform",
                    body: "Search for retainr in the n8n community nodes or the Make.com app marketplace. One click to install.",
                  },
                  {
                    n: 2,
                    title: "Add your API key",
                    body: "Create a free account and paste your API key into the retainr credential. Takes 30 seconds.",
                  },
                  {
                    n: 3,
                    title: "Add two steps to your workflow",
                    body: "Recall step before your AI node. Store step after. That is the entire setup.",
                  },
                  {
                    n: 4,
                    title: "Your AI now has permanent memory",
                    body: "Every interaction is saved. Every future run recalls the relevant history automatically.",
                  },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      {n}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-300" />
                  <span className="h-3 w-3 rounded-full bg-yellow-300" />
                  <span className="h-3 w-3 rounded-full bg-green-300" />
                </div>
                <span className="font-mono text-xs text-gray-400">retainr - what your AI sees</span>
              </div>
              <div className="space-y-1 font-mono text-xs leading-relaxed">
                <p><span className="text-blue-600">GET</span> <span className="text-gray-700">/v1/memories/search</span></p>
                <p className="text-gray-400">  ?query=billing+issue</p>
                <p className="text-gray-400">  &user_id=customer@example.com</p>
                <div className="my-3 border-t border-gray-200" />
                <p className="text-gray-400">Memories found:</p>
                <div className="space-y-1.5 pl-2">
                  <p className="rounded bg-white px-2 py-1 text-gray-700 border border-gray-100">"Requested refund for order #8821 on March 3."</p>
                  <p className="rounded bg-white px-2 py-1 text-gray-700 border border-gray-100">"Confirmed on Pro plan since January."</p>
                  <p className="rounded bg-white px-2 py-1 text-gray-700 border border-gray-100">"Prefers email contact only."</p>
                </div>
                <p className="pt-2 text-emerald-600">Retrieved in 38ms. Stored automatically from past runs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section className="border-y border-gray-100 bg-gray-50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 max-w-xl">
              <h2 className="mb-4 text-4xl font-black tracking-tight">
                Built for automation builders
              </h2>
              <p className="text-xl text-gray-500">
                Not for developers writing code from scratch. For people using Make.com, n8n, and Zapier to build real AI-powered workflows.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Finds what matters, not just keywords",
                  body: "Semantic search finds relevant memories even when the wording is different. Ask about a billing issue and it surfaces the context from three weeks ago automatically.",
                },
                {
                  title: "Separate memory per contact",
                  body: "Each customer or user gets their own isolated memory. Your AI knows exactly who it is talking to and what matters to them.",
                },
                {
                  title: "Works across all your workflows",
                  body: "One API key connects all your workflows. A customer who contacts via email and chat gets the same continuity - retainr connects the dots.",
                },
                {
                  title: "Memory that expires when you want",
                  body: "Set session memory that clears after a task, or permanent memory that persists forever. You control what is remembered and for how long.",
                },
                {
                  title: "GDPR compliant by design",
                  body: "Delete a contact's entire memory with one call - permanently. No manual database cleanup required. Audit-ready from day one.",
                },
                {
                  title: "Scales with your business",
                  body: "The free plan covers small projects. Paid plans handle hundreds of thousands of operations per month. No infrastructure to manage.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h3 className="mb-3 font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 max-w-xl">
            <h2 className="mb-4 text-4xl font-black tracking-tight">Simple pricing</h2>
            <p className="text-xl text-gray-500">Start free. Upgrade when you need more volume.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "0",
                period: "forever",
                features: ["1,000 memory ops / month", "1 workspace", "Community support"],
                cta: "Start for free",
                href: "/dashboard",
                highlight: false,
              },
              {
                name: "Builder",
                price: "29",
                period: "per month",
                features: ["20,000 memory ops / month", "3 workspaces", "Email support"],
                cta: "Start for free",
                href: "/dashboard",
                highlight: false,
              },
              {
                name: "Pro",
                price: "79",
                period: "per month",
                features: ["100,000 memory ops / month", "10 workspaces", "Priority support"],
                cta: "Start for free",
                href: "/dashboard",
                highlight: true,
              },
            ].map(({ name, price, period, features, cta, href, highlight }) => (
              <div key={name} className={`rounded-2xl border p-6 ${highlight ? "border-gray-900 shadow-md" : "border-gray-200"}`}>
                {highlight && (
                  <div className="mb-4 inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}
                <p className="text-sm font-medium text-gray-500">{name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">€{price}</span>
                  <span className="text-sm text-gray-400">{period}</span>
                </div>
                <ul className="my-6 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-300">-</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition ${
                    highlight
                      ? "bg-gray-900 text-white hover:bg-gray-700"
                      : "border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            Need more?{" "}
            <Link href="/pricing" className="underline underline-offset-2 hover:text-gray-600">
              See Agency plan and full comparison
            </Link>
          </p>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="border-y border-gray-100 bg-gray-50 py-24">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-12 text-4xl font-black tracking-tight">Common questions</h2>
            <div className="divide-y divide-gray-200">
              {faqData.map(({ q, a }) => (
                <div key={q} className="py-7">
                  <h3 className="mb-3 font-semibold text-gray-900">{q}</h3>
                  <p className="leading-relaxed text-gray-500">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog preview ──────────────────────────────────────────────── */}
        {latestPosts.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-4xl font-black tracking-tight">From the blog</h2>
              <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                All articles
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {latestPosts.map((post) => (
                <Link key={post.slug} href={post.url} className="group flex items-start justify-between gap-8 py-5 transition-opacity hover:opacity-60">
                  <div className="min-w-0">
                    {post.tags?.[0] && (
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-orange-600">
                        {post.tags[0]}
                      </span>
                    )}
                    <h3 className="truncate text-base font-semibold text-gray-900">{post.title}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <time className="font-mono text-xs text-gray-400" dateTime={post.publishedAt}>
                      {format(new Date(post.publishedAt), "MMM d")}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="bg-gray-900 py-24 text-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="mb-4 text-4xl font-black tracking-tight">
              Your AI should remember your customers.
            </h2>
            <p className="mb-8 text-xl text-gray-400">
              Stop making people repeat themselves. Add retainr to your workflow in minutes.
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-xl bg-white px-8 py-4 font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Start for free
            </Link>
            <p className="mt-4 text-sm text-gray-500">No credit card required. Free plan available.</p>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-100 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-2 text-lg font-bold">retainr</p>
                <p className="max-w-xs text-sm text-gray-400">
                  Persistent memory for AI automations on Make.com, n8n, and Zapier.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-12 text-sm">
                <div>
                  <p className="mb-3 font-semibold">Product</p>
                  <div className="space-y-2 text-gray-500">
                    <Link href="/pricing" className="block hover:text-gray-900">Pricing</Link>
                    <Link href="/docs" className="block hover:text-gray-900">Documentation</Link>
                    <Link href="/dashboard" className="block hover:text-gray-900">Get API key</Link>
                  </div>
                </div>
                <div>
                  <p className="mb-3 font-semibold">Integrations</p>
                  <div className="space-y-2 text-gray-500">
                    <Link href="/docs#n8n" className="block hover:text-gray-900">n8n</Link>
                    <Link href="/docs#makecom" className="block hover:text-gray-900">Make.com</Link>
                    <Link href="/docs#zapier" className="block hover:text-gray-900">Zapier</Link>
                  </div>
                </div>
                <div>
                  <p className="mb-3 font-semibold">Resources</p>
                  <div className="space-y-2 text-gray-500">
                    <Link href="/blog" className="block hover:text-gray-900">Blog</Link>
                    <Link href="/docs" className="block hover:text-gray-900">API reference</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-100 pt-6 text-sm text-gray-400">
              retainr.dev - Persistent memory for AI automation workflows.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// ── Utility components ────────────────────────────────────────────────────


function FlowNode({ label, sub, connector, highlight }: {
  label: string; sub: string; connector?: boolean; highlight?: boolean
}) {
  return (
    <div>
      <div className={`rounded-lg border px-4 py-3 ${highlight ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
        <p className={`text-sm font-semibold ${highlight ? "text-orange-700" : "text-gray-900"}`}>{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
      </div>
      {connector && <div className="mx-auto my-1 h-4 w-px bg-gray-200" />}
    </div>
  )
}
