"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { track } from "@/lib/umami"
import { PLATFORM_LABELS, type Platform } from "@/lib/templates-data"

interface PlatformVariants {
  n8n?: string
  make?: string
  zapier?: string
}

interface Props {
  currentPlatform: Platform | "general"
  variants: PlatformVariants
}

const PLATFORM_ORDER: Platform[] = ["n8n", "make", "zapier"]

export function PlatformSwitcher({ currentPlatform, variants }: Props) {
  const pathname = usePathname()

  // Build the full set: current platform + any variants that have a slug
  const available: { platform: Platform; slug: string | null }[] = PLATFORM_ORDER.map((p) => ({
    platform: p,
    slug: p === currentPlatform ? pathname.replace(/^\/blog\//, "") : (variants[p] ?? null),
  }))

  // If there are no cross-platform links at all, don't render
  const hasCrossLinks = available.some((a) => a.platform !== currentPlatform && a.slug)
  if (!hasCrossLinks && currentPlatform === "general") return null

  return (
    <div className="mb-8 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1.5">
      <span className="shrink-0 pl-2 text-xs font-medium text-gray-400">Platform:</span>
      <div className="flex flex-1 gap-1">
        {available.map(({ platform, slug }) => {
          const isActive = platform === currentPlatform
          const label = PLATFORM_LABELS[platform]

          if (!slug) {
            return (
              <span
                key={platform}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-300 cursor-not-allowed"
                title="Guide coming soon"
              >
                {label}
              </span>
            )
          }

          if (isActive) {
            return (
              <span
                key={platform}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm border border-gray-200"
              >
                {label}
              </span>
            )
          }

          return (
            <Link
              key={platform}
              href={`/blog/${slug}`}
              onClick={() =>
                track("platform_switch", {
                  from: currentPlatform,
                  to: platform,
                  post: slug,
                })
              }
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-white hover:text-gray-900 hover:shadow-sm"
            >
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
