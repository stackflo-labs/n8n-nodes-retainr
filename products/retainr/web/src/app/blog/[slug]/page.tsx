import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { format } from "date-fns"
import { MDXContent } from "@/components/mdx-content"
import { Nav } from "@/components/nav"
import { PlatformSwitcher } from "@/components/platform-switcher"
import { TemplateBlock } from "@/components/template-block"

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

  // Typed access to optional new fields (added in contentlayer.config.ts).
  // Cast needed until contentlayer regenerates types with `contentlayer build`.
  type PostMeta = { platform?: string; platformVariants?: Record<string, string>; templateSlug?: string }
  const meta = post as typeof post & PostMeta
  const platform = meta.platform ?? "general"
  const platformVariants = meta.platformVariants ?? {}
  const templateSlug = meta.templateSlug

  return (
    <>
      <BlogPostJsonLd post={post} url={url} />

      <div className="min-h-screen bg-white text-gray-900">
        <Nav />

        <div className="mx-auto max-w-3xl px-6 py-16">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400" aria-label="breadcrumb">
            <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-500">{post.title}</span>
          </nav>

          {/* Platform switcher — only shown when the post targets a specific platform */}
          {platform !== "general" && (
            <PlatformSwitcher
              currentPlatform={platform as "n8n" | "make" | "zapier"}
              variants={platformVariants}
            />
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {post.tags.map((t) => (
                <span key={t} className="text-xs font-medium text-orange-600">{t}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-6 text-3xl font-black leading-snug tracking-tight md:text-4xl">{post.title}</h1>

          {/* Meta */}
          <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-8 text-sm text-gray-400">
            <span>By <span className="text-gray-700">{post.author}</span></span>
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
          <article className="prose prose-gray max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:text-gray-900 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200">
            <MDXContent raw={post.body.raw} />
          </article>

          {/* Template block — shown when post has a linked template */}
          {templateSlug && (
            <TemplateBlock templateSlug={templateSlug} postSlug={slug} />
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
            <h2 className="mb-3 text-xl font-bold">Give your AI agents a real memory</h2>
            <p className="mb-6 text-gray-500">
              Store, search, and recall context across Make.com, n8n, and Zapier runs. Start free - no credit card required.
            </p>
            <Link
              href={`/dashboard?utm_source=retainr_blog&utm_medium=post_cta&utm_campaign=${slug}`}
              className="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition hover:bg-gray-700"
            >
              Try retainr free
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">Related articles</h2>
              <div className="space-y-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={r.url}
                    className="group flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="shrink-0 text-xs text-gray-400 pt-1 w-24">
                      {format(new Date(r.publishedAt), "MMM d, yyyy")}
                    </div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-10 mt-8">
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
