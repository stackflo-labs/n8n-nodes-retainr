"use client"

import { useState, useMemo, useEffect, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { track } from "@/lib/umami"

export interface PostSummary {
  slug: string
  url: string
  title: string
  description: string
  publishedAt: string
  readingTime: string
  tags: string[]
  featured: boolean
  platform: string
}

interface Props {
  posts: PostSummary[]
  allTags: string[]
}

// Tags that map to a platform get a distinctive colour; everything else is grey.
const PLATFORM_TAG_STYLES: Record<string, string> = {
  "n8n":      "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100",
  "Make.com": "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
  "Zapier":   "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
}

function tagStyle(tag: string, active: boolean) {
  const platform = PLATFORM_TAG_STYLES[tag]
  if (active) return "bg-gray-900 text-white border-gray-900"
  if (platform) return platform + " border"
  return "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-gray-900 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export function BlogList({ posts, allTags }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") ?? "")

  // Sync state → URL (shareable links)
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (activeTag) params.set("tag", activeTag)
    const qs = params.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }, [query, activeTag, pathname, router])

  // Debounce Umami search tracking
  useEffect(() => {
    if (!query.trim()) return
    const t = setTimeout(() => track("blog_search", { query: query.trim() }), 800)
    return () => clearTimeout(t)
  }, [query])

  const isFiltering = query.trim() !== "" || activeTag !== ""

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return posts.filter((p) => {
      const matchTag = !activeTag || p.tags.includes(activeTag)
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      return matchTag && matchQuery
    })
  }, [posts, query, activeTag])

  const featured = isFiltering ? [] : filtered.filter((p) => p.featured)
  const rest = isFiltering ? filtered : filtered.filter((p) => !p.featured)

  function toggleTag(tag: string) {
    const next = activeTag === tag ? "" : tag
    setActiveTag(next)
    if (next) track("blog_tag_filter", { tag: next })
  }

  function clearFilters() {
    setQuery("")
    setActiveTag("")
  }

  return (
    <div>
      {/* Search + tag filters */}
      <div className="mb-10 space-y-4">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${tagStyle(tag, activeTag === tag)}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter summary + clear */}
      {isFiltering && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length === 0
              ? "No articles match"
              : `${filtered.length} article${filtered.length === 1 ? "" : "s"} found`}
            {activeTag && <> tagged <span className="font-semibold text-gray-800">{activeTag}</span></>}
            {query.trim() && <> matching <span className="font-semibold text-gray-800">"{query.trim()}"</span></>}
          </p>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-gray-400 underline underline-offset-2 hover:text-gray-700 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Featured (only when not filtering) */}
      {featured.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">Featured</h2>
          <div className="space-y-10">
            {featured.map((post) => (
              <article key={post.slug} className="group border-b border-gray-100 pb-10 last:border-0">
                {post.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleTag(t)}
                        className="text-xs font-medium text-orange-600 hover:underline"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                <Link href={post.url}>
                  <h2 className="mb-2 text-2xl font-bold leading-snug tracking-tight group-hover:text-orange-600 transition-colors">
                    {highlight(post.title, query)}
                  </h2>
                </Link>
                <p className="mb-4 text-gray-500 leading-relaxed">
                  {highlight(post.description, query)}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <time dateTime={post.publishedAt}>
                    {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                  <span>·</span>
                  <Link href={post.url} className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* All / filtered posts */}
      {rest.length > 0 && (
        <section>
          {!isFiltering && (
            <h2 className="mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">All articles</h2>
          )}
          <div className="space-y-8">
            {rest.map((post) => (
              <article key={post.slug} className="group border-b border-gray-100 pb-8 last:border-0">
                {post.tags.length > 0 && (
                  <div className="mb-1 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleTag(t)}
                        className="text-xs font-medium text-orange-600 hover:underline"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                <Link href={post.url}>
                  <h3 className="mb-1.5 text-lg font-bold leading-snug group-hover:text-orange-600 transition-colors">
                    {highlight(post.title, query)}
                  </h3>
                </Link>
                <p className="mb-3 text-sm text-gray-500 line-clamp-2">
                  {highlight(post.description, query)}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <time dateTime={post.publishedAt}>
                    {format(new Date(post.publishedAt), "MMM d, yyyy")}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="mb-2 text-gray-500">No articles match your search.</p>
          <button onClick={clearFilters} className="text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-orange-600 transition">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
