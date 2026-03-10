import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const SITE_URL = "https://retainr.dev"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "retainr - AI Agent Memory for Make.com, n8n and Zapier",
    template: "%s | retainr",
  },
  description:
    "Your AI automation forgets everything between runs. retainr gives it persistent memory - no code required. Works with Make.com, n8n, and Zapier.",
  keywords: [
    "AI agent memory",
    "persistent memory for AI agents",
    "AI context persistence",
    "stateful AI workflows",
    "n8n AI memory node",
    "n8n persistent memory",
    "n8n community node",
    "Make.com AI memory module",
    "Make.com persistent context",
    "Zapier AI memory action",
    "automation workflow memory",
    "AI chatbot memory across sessions",
    "customer context for AI workflows",
    "vector memory API",
    "n8n alternative to Mem0",
    "workflow memory without code",
  ],
  authors: [{ name: "retainr", url: SITE_URL }],
  creator: "retainr",
  publisher: "retainr",
  category: "technology",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "retainr",
    title: "retainr - AI Agent Memory for Make.com, n8n and Zapier",
    description:
      "Your AI automation forgets everything between runs. retainr gives it persistent memory - no code required.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "retainr - AI agent memory for Make.com, n8n and Zapier" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "retainr - AI Agent Memory for Make.com, n8n and Zapier",
    description:
      "Your AI automation forgets everything between runs. retainr gives it persistent memory - no code required.",
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  return (
    <html lang="en">
      <head>
        {umamiId && (
          <script
            defer
            src="https://analytics.retainr.dev/script.js"
            data-website-id={umamiId}
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
