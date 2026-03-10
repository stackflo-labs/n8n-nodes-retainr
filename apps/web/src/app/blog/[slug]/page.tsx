import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { format } from "date-fns"
import { MDXContent } from "@/components/mdx-content"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)
  if (!post) return {}

  const url = `https://retainr.dev${post.url}`
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630 }]
        : [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

function BlogPostJsonLd({ post, url }: { post: (typeof allPosts)[number]; url: string }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "retainr",
      url: "https://retainr.dev",
      logo: { "@type": "ImageObject", url: "https://retainr.dev/og.png" },
    },
    image: post.image ?? "https://retainr.dev/og.png",
    keywords: post.tags?.join(", "),
    timeRequired: post.readingTime,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
    />
  )
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  const related = allPosts
    .filter((p) => p.slug !== slug && p.tags?.some((t) => post.tags?.includes(t)))
    .slice(0, 3)

  const url = `https://retainr.dev${post.url}`
  return (
    <>
      <BlogPostJsonLd post={post} url={url} />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-violet-400">retainr</Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              <Link href="/blog" className="hover:text-white transition">Blog</Link>
              <Link href="/docs" className="hover:text-white transition">Docs</Link>
              <Link href="/dashboard" className="rounded-lg bg-violet-600 px-4 py-1.5 text-white hover:bg-violet-500 transition">
                Get started free
              </Link>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-3xl px-6 py-16">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-500" aria-label="breadcrumb">
            <Link href="/blog" className="hover:text-gray-300 transition">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{post.title}</span>
          </nav>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-violet-600/20 px-3 py-1 text-xs text-violet-300">{t}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-6 text-3xl font-bold leading-snug tracking-tight md:text-4xl">{post.title}</h1>

          {/* Meta */}
          <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-white/10 pb-8 text-sm text-gray-500">
            <span>By <span className="text-gray-300">{post.author}</span></span>
            <span>·</span>
            <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), "MMMM d, yyyy")}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
            {post.updatedAt && (
              <>
                <span>·</span>
                <span>Updated {format(new Date(post.updatedAt), "MMM d, yyyy")}</span>
              </>
            )}
          </div>

          {/* MDX content */}
          <article className="prose prose-invert prose-violet max-w-none prose-headings:scroll-mt-24 prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline prose-code:bg-white/10 prose-code:rounded prose-code:px-1 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-white/10">
            <MDXContent raw={post.body.raw} />
          </article>

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-violet-500/30 bg-violet-950/30 p-8 text-center">
            <h2 className="mb-3 text-xl font-bold">Give your AI agents a real memory</h2>
            <p className="mb-6 text-gray-400">
              Store, search, and recall context across Make.com, n8n, and Zapier runs. Start free — no credit card required.
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold hover:bg-violet-500 transition"
            >
              Try retainr free →
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-lg font-semibold">Related articles</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={r.url} className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-violet-500/40">
                    <p className="text-xs text-gray-500 mb-1">{format(new Date(r.publishedAt), "MMM d, yyyy")}</p>
                    <p className="text-sm font-medium group-hover:text-violet-300 transition line-clamp-3">{r.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
