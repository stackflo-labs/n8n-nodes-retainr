import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { Nav } from "@/components/nav"
import { BlogList, type PostSummary } from "@/components/blog-list"

export const metadata: Metadata = {
  title: "Blog - AI Agent Memory, Automation Workflows & No-Code Tutorials",
  description:
    "Tutorials, guides, and insights on AI agent memory, Make.com, n8n, and Zapier workflow automation. Learn to build stateful AI workflows without code.",
  alternates: { canonical: "https://retainr.dev/blog" },
  openGraph: {
    title: "retainr Blog - AI Automation Tutorials",
    description: "Tutorials and guides on AI agent memory for Make.com, n8n, and Zapier.",
    url: "https://retainr.dev/blog",
  },
}

export default function BlogPage() {
  const posts: PostSummary[] = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map((p) => ({
      slug: p.slug,
      url: p.url,
      title: p.title,
      description: p.description,
      publishedAt: p.publishedAt,
      readingTime: p.readingTime,
      tags: p.tags ?? [],
      featured: p.featured ?? false,
      platform: (p as unknown as { platform?: string }).platform ?? "general",
    }))

  // All unique tags sorted: platform tags first, then alpha
  const platformOrder = ["n8n", "Make.com", "Zapier"]
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort((a, b) => {
    const ai = platformOrder.indexOf(a)
    const bi = platformOrder.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "retainr Blog",
            url: "https://retainr.dev/blog",
            description: "Tutorials and guides on AI agent memory for automation workflows.",
            publisher: { "@type": "Organization", name: "retainr", url: "https://retainr.dev" },
          }).replace(/</g, "\\u003c"),
        }}
      />

      <div className="min-h-screen bg-white text-gray-900">
        <Nav />

        <div className="mx-auto max-w-3xl px-6 py-16">
          {/* Header */}
          <div className="mb-12 border-b border-gray-100 pb-10">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-orange-600">
              The retainr blog
            </p>
            <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
              Automation that remembers.
            </h1>
            <p className="text-lg text-gray-500">
              Practical guides for Make.com, n8n, and Zapier builders who want their AI to stop forgetting everything between runs.
            </p>
          </div>

          {/* Search + tag filter + posts list */}
          <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
            <BlogList posts={posts} allTags={allTags} />
          </Suspense>
        </div>

        {/* CTA */}
        <section className="border-t border-gray-100 bg-gray-50 py-16 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">Ready to add memory to your workflows?</h2>
          <p className="mb-6 text-gray-500">Free plan includes 1,000 memory operations per month.</p>
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition hover:bg-gray-700"
          >
            Start for free
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm font-bold text-gray-900">retainr</p>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
                <Link href="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              </div>
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} retainr</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
