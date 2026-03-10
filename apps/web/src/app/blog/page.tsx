import type { Metadata } from "next"
import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "Blog — AI Agent Memory, Automation Workflows & No-Code Tutorials",
  description:
    "Tutorials, guides, and insights on AI agent memory, Make.com, n8n, and Zapier workflow automation. Learn to build stateful AI workflows without code.",
  alternates: { canonical: "https://retainr.dev/blog" },
  openGraph: {
    title: "retainr Blog — AI Automation Tutorials",
    description: "Tutorials and guides on AI agent memory for Make.com, n8n, and Zapier.",
    url: "https://retainr.dev/blog",
  },
}

const ALL_TAGS = ["n8n", "Make.com", "Zapier", "AI agents", "tutorial", "automation"]

export default function BlogPage() {
  const posts = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const featured = posts.filter((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

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

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-violet-400">retainr</Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              <Link href="/blog" className="text-white">Blog</Link>
              <Link href="/docs" className="hover:text-white transition">Docs</Link>
              <Link href="/dashboard" className="rounded-lg bg-violet-600 px-4 py-1.5 text-white hover:bg-violet-500 transition">
                Get started free
              </Link>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-6 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              AI Automation <span className="text-violet-400">Blog</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Tutorials, guides, and deep dives on AI agent memory, Make.com, n8n, and Zapier workflows.
            </p>
          </div>

          {/* Tags */}
          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {ALL_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Featured posts */}
          {featured.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-violet-400">Featured</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {featured.map((post) => (
                  <Link key={post.slug} href={post.url} className="group">
                    <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-violet-500/50 hover:bg-white/8">
                      {post.tags?.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {post.tags.map((t) => (
                            <span key={t} className="rounded-full bg-violet-600/20 px-2.5 py-0.5 text-xs text-violet-300">{t}</span>
                          ))}
                        </div>
                      )}
                      <h2 className="mb-2 text-xl font-bold leading-snug group-hover:text-violet-300 transition">
                        {post.title}
                      </h2>
                      <p className="mb-4 text-sm text-gray-400 line-clamp-3">{post.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), "MMM d, yyyy")}</time>
                        <span>·</span>
                        <span>{post.readingTime}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All posts */}
          <section>
            {featured.length > 0 && (
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-violet-400">All posts</h2>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.slug} href={post.url} className="group">
                  <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-violet-500/50 hover:bg-white/8">
                    {post.tags?.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-violet-600/20 px-2 py-0.5 text-xs text-violet-300">{t}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="mb-2 font-bold leading-snug group-hover:text-violet-300 transition">{post.title}</h2>
                    <p className="mb-4 text-sm text-gray-400 line-clamp-2">{post.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), "MMM d, yyyy")}</time>
                      <span>·</span>
                      <span>{post.readingTime}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {posts.length === 0 && (
            <p className="text-center text-gray-500">No posts yet. Check back soon.</p>
          )}
        </div>

        {/* CTA */}
        <section className="border-t border-white/10 bg-violet-950/20 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to add memory to your workflows?</h2>
          <p className="mb-6 text-gray-400">Free plan includes 1,000 memory operations per month.</p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold hover:bg-violet-500 transition">
            Start for free →
          </Link>
        </section>
      </div>
    </>
  )
}
