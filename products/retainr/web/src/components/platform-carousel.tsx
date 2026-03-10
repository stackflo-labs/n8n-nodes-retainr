"use client"

// TODO: Replace CSS mockups with real platform screenshots or embeds once available:
//
// n8n     → No public iframe embed. Enterprise "n8n Embed" product requires contacting n8n.
//           Alternative: take a real screenshot of the retainr community node in the n8n canvas
//           and serve it as a static image from /public/screenshots/n8n-workflow.png
//
// Make.com → No embed or iframe option. Public template links are not embeddable.
//           Alternative: screenshot of the retainr module in a Make scenario canvas.
//
// Zapier   → Has a partner embed API (api.zapier.com/v1/embed/...) but requires domain
//           whitelisting via the Zapier Partner Program. Apply at zapier.com/developer-platform.
//           Once approved, replace ZapierMockup with:
//           <iframe src="https://api.zapier.com/v1/embed/retainr/search-memory/..." />

import { useState } from "react"
import Link from "next/link"

// ── n8n canvas mockup ───────────────────────────────────────────────────────

function N8nMockup() {
  return (
    <div className="relative overflow-hidden rounded-xl" style={{ background: "#1a1b26", minHeight: 300 }}>
      {/* dot grid */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }} />

      {/* top bar */}
      <div className="relative flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="font-mono text-[11px] text-gray-500">AI Customer Support — n8n workflow</span>
        <span className="rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-gray-500">Execute workflow</span>
      </div>

      {/* canvas */}
      <div className="relative overflow-x-auto px-6 py-10">
        <svg width="760" height="160" viewBox="0 0 760 160" fill="none" className="overflow-visible">
          {/* connection lines */}
          {[
            [148, 80, 188, 80],
            [316, 80, 356, 80],
            [484, 80, 524, 80],
            [652, 80, 692, 80],
          ].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <path d={`M${x1} ${y1} C${x1 + 20} ${y1} ${x2 - 20} ${y2} ${x2} ${y2}`} stroke="#374151" strokeWidth="1.5" />
              <polygon points={`${x2},${y2} ${x2 - 6},${y2 - 4} ${x2 - 6},${y2 + 4}`} fill="#374151" />
            </g>
          ))}

          {/* nodes */}
          {[
            { x: 0,   label: "Webhook",        sub: "On message received", color: "#374151", accent: "#6B7280",  dot: "#10B981" },
            { x: 168, label: "retainr",        sub: "Search Memory",       color: "#1c1420", accent: "#EA580C",  dot: "#EA580C", highlight: true },
            { x: 336, label: "OpenAI",         sub: "Chat completion",      color: "#0d1f17", accent: "#10a37f",  dot: "#10a37f" },
            { x: 504, label: "retainr",        sub: "Store Memory",        color: "#1c1420", accent: "#EA580C",  dot: "#EA580C", highlight: true },
            { x: 672, label: "Respond",        sub: "Send reply",          color: "#374151", accent: "#6B7280",  dot: "#10B981" },
          ].map((node) => (
            <g key={node.x}>
              <rect x={node.x} y={46} width={148} height={68} rx={8}
                fill={node.color} stroke={node.highlight ? "#EA580C" : "#374151"} strokeWidth={node.highlight ? 1.5 : 1} />
              {/* accent bar */}
              <rect x={node.x} y={46} width={4} height={68} rx={2} fill={node.accent} />
              {/* status dot */}
              <circle cx={node.x + 134} cy={56} r={4} fill={node.dot} />
              {/* label */}
              <text x={node.x + 18} y={79} fontFamily="system-ui" fontSize={13} fontWeight={600}
                fill={node.highlight ? "#FB923C" : "#E5E7EB"}>{node.label}</text>
              <text x={node.x + 18} y={97} fontFamily="system-ui" fontSize={10}
                fill={node.highlight ? "#9A3412" : "#6B7280"}>{node.sub}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* bottom execution log */}
      <div className="relative border-t border-white/5 bg-black/20 px-5 py-3 font-mono text-[10px]">
        <div className="flex items-center gap-6 text-gray-500">
          <span><span className="text-green-400">✓</span> Webhook · 8ms</span>
          <span><span className="text-green-400">✓</span> <span className="text-orange-400">retainr Search</span> · 41ms · 2 memories</span>
          <span><span className="text-green-400">✓</span> OpenAI · 812ms</span>
          <span><span className="text-green-400">✓</span> <span className="text-orange-400">retainr Store</span> · 19ms</span>
          <span><span className="text-green-400">✓</span> Respond · 34ms</span>
        </div>
      </div>
    </div>
  )
}

// ── Make.com scenario mockup ────────────────────────────────────────────────

const MAKE_MODULES = [
  { name: "Webhooks",  action: "Custom webhook",       bg: "#6D00CC", letter: "W" },
  { name: "retainr",  action: "Search Memory",         bg: "#EA580C", letter: "R", highlight: true },
  { name: "OpenAI",   action: "Create a completion",   bg: "#10a37f", letter: "O" },
  { name: "retainr",  action: "Store Memory",          bg: "#EA580C", letter: "R", highlight: true },
  { name: "Gmail",    action: "Send an email",         bg: "#EA4335", letter: "G" },
]

function MakeMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
        <span className="font-mono text-[11px] text-gray-500">AI Lead Follow-up — Make.com scenario</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-[11px] font-semibold text-green-600">Scheduling: On</span>
        </div>
      </div>

      {/* canvas */}
      <div className="overflow-x-auto px-8 py-10">
        <div className="flex items-start gap-0">
          {MAKE_MODULES.map((mod, i) => (
            <div key={i} className="flex shrink-0 items-center">
              {/* module */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-md"
                  style={{ backgroundColor: mod.bg, boxShadow: mod.highlight ? `0 0 0 3px ${mod.bg}40` : undefined }}
                >
                  {mod.letter}
                  {mod.highlight && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-bold shadow" style={{ color: mod.bg }}>R</span>
                  )}
                </div>
                <span className="w-[72px] text-center text-[10px] font-semibold leading-tight text-gray-700">{mod.name}</span>
                <span className="w-[72px] text-center text-[9px] leading-tight text-gray-400">{mod.action}</span>
              </div>
              {/* connector */}
              {i < MAKE_MODULES.length - 1 && (
                <div className="mx-1 mb-8 flex shrink-0 items-center gap-0">
                  <div className="h-px w-5 bg-gray-300" />
                  <svg width="7" height="10" viewBox="0 0 7 10">
                    <path d="M0 0l7 5-7 5V0z" fill="#D1D5DB" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* last run */}
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-mono text-gray-400">Last run: just now · 3 operations · 0 errors</span>
          <span className="font-mono text-gray-400">retainr: 2 memories recalled · 1 stored</span>
        </div>
      </div>
    </div>
  )
}

// ── Zapier Zap mockup ───────────────────────────────────────────────────────

const ZAPIER_STEPS = [
  { n: 1, app: "Webhooks by Zapier", action: "Catch Hook",             bg: "#FF4A00", trigger: true },
  { n: 2, app: "retainr",            action: "Search Memory",           bg: "#EA580C", retainr: true },
  { n: 3, app: "OpenAI",             action: "Send Prompt",             bg: "#10a37f" },
  { n: 4, app: "retainr",            action: "Store Memory",            bg: "#EA580C", retainr: true },
  { n: 5, app: "Gmail",              action: "Send Email",              bg: "#EA4335" },
]

function ZapierMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <span className="font-mono text-[11px] text-gray-500">AI Email Responder — Zapier Zap</span>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">Zap is On</span>
      </div>

      <div className="flex min-h-[240px]">
        {/* left: step list */}
        <div className="w-64 shrink-0 border-r border-gray-100 py-4">
          {ZAPIER_STEPS.map((step, i) => (
            <div key={i} className="flex gap-0">
              {/* connector column */}
              <div className="flex w-10 flex-col items-center">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: step.bg }}
                >
                  {step.n}
                </div>
                {i < ZAPIER_STEPS.length - 1 && <div className="my-0.5 h-6 w-px bg-gray-200" />}
              </div>
              {/* step content */}
              <div className="flex-1 pb-4 pr-3">
                <p className="text-[11px] font-semibold text-gray-800">{step.app}</p>
                <p className="text-[10px] text-gray-400">
                  {step.trigger ? "Trigger: " : "Action: "}{step.action}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* right: step detail panel */}
        <div className="flex-1 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#EA580C" }}>R</div>
            <div>
              <p className="text-xs font-bold text-gray-900">retainr — Search Memory</p>
              <p className="text-[10px] text-gray-400">Step 2 · Action</p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 font-mono text-[10px]">
            <div className="flex justify-between text-gray-500">
              <span>query</span><span className="text-gray-700">{"{{1.body.message}}"}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>user_id</span><span className="text-gray-700">{"{{1.body.email}}"}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>limit</span><span className="text-gray-700">5</span>
            </div>
            <div className="border-t border-gray-200 pt-2 text-green-600">Test result: 2 memories found · 41ms</div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-2.5">
        <span className="font-mono text-[10px] text-gray-400">Last triggered: just now · All steps passed</span>
      </div>
    </div>
  )
}

// ── Direct API mockup ───────────────────────────────────────────────────────

function ApiMockup() {
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: "#0d1117" }}>
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="font-mono text-[11px] text-gray-500">retainr REST API · any platform</span>
        <span className="rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-gray-500">bash</span>
      </div>

      <div className="space-y-0 p-5 font-mono text-[12px] leading-relaxed">
        {/* store */}
        <p className="text-gray-500"># 1. Store a memory after each conversation</p>
        <p>
          <span className="text-blue-400">curl</span>
          <span className="text-gray-300"> -X POST https://api.retainr.dev/v1/memories \</span>
        </p>
        <p className="text-gray-300">&nbsp; -H <span className="text-green-400">"Authorization: Bearer rec_live_..."</span> \</p>
        <p className="text-gray-300">&nbsp; -d <span className="text-yellow-300">{`'{"content":"Prefers email, on Pro plan","user_id":"sarah@acme.com"}'`}</span></p>
        <p className="mt-1 text-gray-500"># → 201 Created · <span className="text-green-400">{"{ id: \"mem_8xKp2...\" }"}</span></p>

        <div className="my-4 border-t border-white/5" />

        {/* search */}
        <p className="text-gray-500"># 2. Recall context before the next AI call</p>
        <p>
          <span className="text-blue-400">curl</span>
          <span className="text-gray-300"> "https://api.retainr.dev/v1/memories/search</span>
        </p>
        <p className="text-gray-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;?query=how+to+approach+this+customer</p>
        <p className="text-gray-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&user_id=sarah@acme.com" \</p>
        <p className="text-gray-300">&nbsp; -H <span className="text-green-400">"Authorization: Bearer rec_live_..."</span></p>
        <p className="mt-1 text-gray-500"># → 200 OK ·{" "}
          <span className="text-emerald-400">2 memories · score 0.97, 0.84 · 41ms</span>
        </p>
      </div>
    </div>
  )
}

// ── Main carousel ───────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "n8n",
    name: "n8n",
    sub: "Community node",
    docsHref: "/docs#n8n",
    templateHref: "https://n8n.io/workflows/",
    description: "Install the retainr community node from Settings - Community Nodes. Drag the Search Memory step before your AI node and Store Memory after.",
  },
  {
    id: "make",
    name: "Make.com",
    sub: "Module",
    docsHref: "/docs#makecom",
    templateHref: "https://www.make.com/en/templates",
    description: "Add the retainr app from the Make.com marketplace. Use Search Memory before your OpenAI module and Store Memory at the end of the scenario.",
  },
  {
    id: "zapier",
    name: "Zapier",
    sub: "via REST API",
    docsHref: "/docs#zapier",
    templateHref: "https://zapier.com/apps",
    description: "Use Webhooks by Zapier to call retainr's REST API. Two steps: Search Memory before your AI prompt, Store Memory after the response.",
  },
  {
    id: "api",
    name: "Direct API",
    sub: "Any platform",
    docsHref: "/docs",
    templateHref: "/docs",
    description: "Two HTTP calls — POST to store a memory, GET to search. Works with any platform, language, or framework that can make HTTP requests.",
  },
] as const

type PlatformId = typeof PLATFORMS[number]["id"]

// These are passed in from server component so logos render properly
interface Props {
  n8nIcon: React.ReactNode
  makeIcon: React.ReactNode
  zapierIcon: React.ReactNode
}

export function PlatformCarousel({ n8nIcon, makeIcon, zapierIcon }: Props) {
  const [active, setActive] = useState<PlatformId>("n8n")

  const icons: Record<PlatformId, React.ReactNode> = {
    n8n: n8nIcon,
    make: makeIcon,
    zapier: zapierIcon,
    api: (
      <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-800 font-mono text-[9px] font-bold text-white">
        API
      </span>
    ),
  }

  const platform = PLATFORMS.find((p) => p.id === active)!

  return (
    <div>
      {/* platform tab buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              active === p.id
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            <span className={active === p.id ? "opacity-100" : "opacity-70"}>{icons[p.id]}</span>
            <span>{p.name}</span>
            <span className={`text-xs font-normal ${active === p.id ? "text-gray-400" : "text-gray-400"}`}>
              {p.sub}
            </span>
          </button>
        ))}
      </div>

      {/* mockup */}
      <div className="min-h-[280px]">
        {active === "n8n"    && <N8nMockup />}
        {active === "make"   && <MakeMockup />}
        {active === "zapier" && <ZapierMockup />}
        {active === "api"    && <ApiMockup />}
      </div>

      {/* description + CTA */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-lg text-sm text-gray-500">{platform.description}</p>
        <div className="flex shrink-0 gap-2">
          <Link
            href={platform.docsHref}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
          >
            Setup guide
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Get API key
          </Link>
        </div>
      </div>
    </div>
  )
}
