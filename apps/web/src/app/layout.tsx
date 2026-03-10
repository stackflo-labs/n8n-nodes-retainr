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
    "AI agent memory", "n8n memory", "Make.com AI", "Zapier AI",
    "workflow automation", "AI context persistence", "pgvector",
    "n8n AI agent", "stateful workflows", "automation API",
    "n8n community node", "Make.com app", "persistent memory",
    "AI workflow memory", "agent context", "vector memory API",
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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "retainr — AI Agent Memory for Make.com, n8n & Zapier",
    description: "Give your AI agents persistent memory across workflow runs.",
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
    // google: "your-google-verification-token",
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
