import { MetadataRoute } from "next"
import { allPosts } from "contentlayer/generated"

const SITE_URL = "https://retainr.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  const templateSlugs = [
    "n8n-customer-service-ai-with-memory",
    "n8n-lead-qualification-agent-memory",
    "make-com-shopify-customer-history",
    "n8n-email-inbox-ai-with-memory",
    "make-com-invoice-generator-airtable",
    "n8n-contract-generator-form",
    "zapier-sales-crm-enrichment-ai",
    "make-com-quote-generator-ecommerce",
  ]

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/pricing`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/docs`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/templates`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/dashboard`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  const blogPages: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${SITE_URL}${post.url}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const templatePages: MetadataRoute.Sitemap = templateSlugs.map((slug) => ({
    url: `${SITE_URL}/templates/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages, ...templatePages]
}
