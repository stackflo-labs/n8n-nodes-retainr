import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Get your API key — retainr",
  description: "Create your free retainr account and get an API key in seconds. 1,000 memory operations per month free. No credit card required.",
  alternates: { canonical: "https://retainr.dev/dashboard" },
  robots: { index: false, follow: false },
}

const PLANS = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    ops: "1,000 memory ops",
    pdfs: "10 PDFs",
    highlight: false,
    cta: "Start free",
    href: "#signup",
  },
  {
    name: "Builder",
    price: "€29",
    period: "/ month",
    ops: "20,000 memory ops",
    pdfs: "200 PDFs",
    highlight: false,
    cta: "Start free, upgrade later",
    href: "#signup",
  },
  {
    name: "Pro",
    price: "€79",
    period: "/ month",
    ops: "100,000 memory ops",
    pdfs: "2,000 PDFs",
    highlight: true,
    cta: "Start free, upgrade later",
    href: "#signup",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-violet-400">retainr</Link>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/docs" className="hover:text-white transition">Docs</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-lg px-6 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            Free plan • No credit card required
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight">Get your API key</h1>
          <p className="text-gray-400">
            Start adding persistent memory to your Make.com, n8n, or Zapier workflows in under 5 minutes.
          </p>
        </div>

        {/* Sign-up form */}
        <div id="signup" className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <form
            action="https://formspree.io/f/placeholder"
            method="POST"
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="platform" className="mb-1.5 block text-sm font-medium text-gray-300">
                Primary platform
              </label>
              <select
                id="platform"
                name="platform"
                className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Select one...</option>
                <option value="n8n">n8n</option>
                <option value="make">Make.com</option>
                <option value="zapier">Zapier</option>
                <option value="api">Direct API</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 active:bg-violet-700"
            >
              Create free account →
            </button>

            <p className="text-center text-xs text-gray-500">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-gray-400 hover:text-white underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gray-400 hover:text-white underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        {/* What you get next */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            What happens next
          </h2>
          <ol className="space-y-3 text-sm text-gray-300">
            {[
              "You receive an API key instantly by email",
              "Install the retainr node in n8n or the module in Make.com",
              "Add your API key to the credential/connection",
              "Start storing and searching memories in your workflows",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Platform quick links */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { name: "n8n", sub: "Community node", href: "/docs#n8n" },
            { name: "Make.com", sub: "Module", href: "/docs#makecom" },
            { name: "Zapier", sub: "REST API", href: "/docs#zapier" },
          ].map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-center transition hover:border-violet-500/40"
            >
              <p className="text-sm font-semibold text-white">{p.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">{p.sub}</p>
            </Link>
          ))}
        </div>

        {/* Plan reminder */}
        <p className="mt-6 text-center text-xs text-gray-500">
          All accounts start on the free plan (1,000 ops/month).{" "}
          <Link href="/pricing" className="text-gray-400 hover:text-white underline underline-offset-2">
            See all plans →
          </Link>
        </p>
      </div>
    </div>
  )
}
