import type { Metadata } from "next"
import { Suspense } from "react"
import { Nav } from "@/components/nav"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = {
  title: "Get your API key - retainr",
  description: "Create your free retainr account and get an API key in seconds. 1,000 memory operations per month free. No credit card required.",
  alternates: { canonical: "https://retainr.dev/dashboard" },
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />

      <div className="mx-auto max-w-lg px-6 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm text-orange-700">
            Free plan - no credit card required
          </div>
          <h1 className="mb-3 text-3xl font-black tracking-tight">Get your API key</h1>
          <p className="text-gray-500">
            Start adding persistent memory to your Make.com, n8n, or Zapier workflows in under 5 minutes.
          </p>
        </div>

        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
