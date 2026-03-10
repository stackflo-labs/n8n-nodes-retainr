import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const SITE_URL = "https://retainr.dev"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "retainr — AI Agent Memory for Make.com, n8n & Zapier",
    template: "%s | retainr",
  },
  description:
    "Persistent AI agent memory for automation workflows. Store, search, and recall context across Make.com, n8n, and Zapier runs. pgvector-powered. No code required.",
  keywords: [
    // Core product terms
    "AI agent memory",
    "persistent memory for AI agents",
    "AI context persistence",
    "stateful AI workflows",
    // Platform-specific long-tails
    "n8n AI memory node",
    "n8n persistent memory",
    "n8n stateful agent",
    "n8n community node",
    "Make.com AI memory module",
    "Make.com persistent context",
    "Make.com app",
    "Zapier AI memory action",
    // Use-case long-tails
    "automation workflow memory",
    "AI chatbot memory across sessions",
    "customer context for AI workflows",
    "pgvector semantic search API",
    "vector memory API",
    // Competitor displacement
    "n8n alternative to Mem0",
    "workflow memory without Redis",
    "PDF generation API automation",
  ],
  authors: [{ name: "retainr", url: SITE_URL }],
  creator: "retainr",
  publisher: "retainr",
  category: "technology",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "retainr",
    title: "retainr — AI Agent Memory for Make.com, n8n & Zapier",
    description:
      "Persistent AI agent memory for automation workflows. Store, search, and recall context across Make.com, n8n, and Zapier runs. No code required.",
    // /og.png resolves to https://retainr.dev/og.png via metadataBase above
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "retainr — AI agent memory for Make.com, n8n & Zapier" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "retainr — AI Agent Memory for Make.com, n8n & Zapier",
    description:
      "Give your AI agents persistent memory across workflow runs. Native n8n node and Make.com module. Free tier available.",
    images: ["/og.png"],
    creator: "@retainr_dev",
    site: "@retainr_dev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL },
  verification: {
    // Add tokens once verified in their respective consoles:
    // google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN",
    // Bing Webmaster: add via other: { "msvalidate.01": ["REPLACE_ME"] }
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  )
}
