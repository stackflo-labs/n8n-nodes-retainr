import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "retainr — AI agent memory for Make.com, n8n, and Zapier",
  description: "Persistent memory API for AI agents in Make.com, n8n, and Zapier workflows. Semantic search, session/user/agent scopes, PDF generation.",
  metadataBase: new URL("https://retainr.dev"),
  openGraph: {
    title: "retainr — AI agent memory for automation platforms",
    description: "Give your Make.com and n8n AI agents persistent memory. No code required.",
    url: "https://retainr.dev",
    siteName: "retainr",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
