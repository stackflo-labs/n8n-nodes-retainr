"use client"

import { useState } from "react"
import Link from "next/link"
import { track } from "@/lib/umami"
import { TEMPLATES, PLATFORM_COLORS } from "@/lib/templates-data"

interface Props {
  templateSlug: string
  postSlug: string
}

export function TemplateBlock({ templateSlug, postSlug }: Props) {
  const template = TEMPLATES[templateSlug]
  if (!template) return null

  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const color = PLATFORM_COLORS[template.platform]

  const lines = template.workflow.split("\n")
  const preview = lines.slice(0, 18).join("\n") + (lines.length > 18 ? "\n  // …" : "")
  const displayCode = expanded ? template.workflow : preview

  async function handleCopy() {
    await navigator.clipboard.writeText(template.workflow)
    setCopied(true)
    track("template_copy", { template: templateSlug, platform: template.platform, post: postSlug })
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const ext = template.platform === "n8n" ? "json" : "json"
    const filename = `${templateSlug}.${ext}`
    const blob = new Blob([template.workflow], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    track("template_download", { template: templateSlug, platform: template.platform, post: postSlug })
  }

  const utmDashboard = `/dashboard?utm_source=retainr_blog&utm_medium=template_block&utm_campaign=${postSlug}`

  return (
    <div className="not-prose mt-16 rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
              >
                {template.platformLabel}
              </span>
              <span className="text-xs text-gray-400">{template.category}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">{template.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{template.description}</p>
          </div>
          <span className="shrink-0 text-xs text-gray-400 mt-1">{template.ops}</span>
        </div>
      </div>

      {/* Code block */}
      <div className="relative bg-gray-950">
        <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-gray-200">
          <code>{displayCode}</code>
        </pre>

        {/* Expand/collapse overlay */}
        {!expanded && lines.length > 18 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center bg-gradient-to-t from-gray-950 to-transparent pt-10 pb-4">
            <button
              onClick={() => setExpanded(true)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Show full workflow ↓
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-gray-800 px-5 py-3">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Download .json
            </button>
            {expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
              >
                Collapse ↑
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {template.platformLabel} workflow · {(template.workflow.length / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>

      {/* CTA footer */}
      <div className="flex flex-col items-center gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Free API key required</span> — 1,000 memory ops/month, no credit card.
        </p>
        <Link
          href={utmDashboard}
          onClick={() =>
            track("template_cta_click", { template: templateSlug, platform: template.platform, post: postSlug })
          }
          className="shrink-0 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          Get free API key →
        </Link>
      </div>
    </div>
  )
}
