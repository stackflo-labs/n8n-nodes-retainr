import { MetadataRoute } from "next"
import { allPosts } from "contentlayer/generated"

const SITE_URL = "https://retainr.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/pricing`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/docs`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/dashboard`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  const blogPages: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${SITE_URL}${post.url}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages]
}
