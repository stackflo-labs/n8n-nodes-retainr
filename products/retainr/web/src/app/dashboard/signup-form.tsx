"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface RegisterResponse {
  workspace_id: string
  api_key: string
  key_id: string
  plan: string
  error?: string
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [platform, setPlatform] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<RegisterResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const p = searchParams.get("platform")
    if (p) setPlatform(p)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          platform,
          utm_source: searchParams.get("utm_source") ?? "",
          utm_medium: searchParams.get("utm_medium") ?? "",
          utm_campaign: searchParams.get("utm_campaign") ?? "",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setError("An account with this email already exists.")
        } else {
          setError(data.error ?? data.message ?? "Something went wrong. Please try again.")
        }
        return
      }

      setResult(data as RegisterResponse)
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  async function copyKey() {
    if (!result) return
    await navigator.clipboard.writeText(result.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result) {
    return (
      <div className="space-y-6">
        {/* Success */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="mb-1 text-sm font-semibold text-green-800">Account created</p>
          <p className="text-sm text-green-700">Your free plan is active — 1,000 memory ops per month.</p>
        </div>

        {/* API key */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-2 text-sm font-semibold text-gray-700">Your API key</p>
          <p className="mb-3 text-xs text-orange-700 font-medium">
            Save this now — it will not be shown again.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 overflow-x-auto rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-800">
              {result.api_key}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">Workspace ID: {result.workspace_id}</p>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">Next steps</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            {[
              "Install the retainr node in n8n or the module in Make.com",
              "Add your API key to the credential/connection",
              "Start storing and searching memories in your workflows",
              "Hit limits? Upgrade anytime from the pricing page",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Platform quick links */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "n8n", sub: "Community node", href: "/docs#n8n" },
            { name: "Make.com", sub: "Module", href: "/docs#makecom" },
            { name: "Zapier", sub: "REST API", href: "/docs#zapier" },
          ].map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center transition hover:border-gray-400 hover:bg-white"
            >
              <p className="text-sm font-semibold text-gray-900">{p.name}</p>
              <p className="mt-0.5 text-xs text-gray-400">{p.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div id="signup" className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label htmlFor="platform" className="mb-1.5 block text-sm font-medium text-gray-700">
              Primary platform
            </label>
            <select
              id="platform"
              name="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="">Select one...</option>
              <option value="n8n">n8n</option>
              <option value="make">Make.com</option>
              <option value="zapier">Zapier</option>
              <option value="api">Direct API</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-700 active:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create free account"}
          </button>

          <p className="text-center text-xs text-gray-400">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>

      {/* What happens next */}
      <div className="rounded-2xl border border-gray-200 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
          What happens next
        </h2>
        <ol className="space-y-3 text-sm text-gray-600">
          {[
            "Your API key is generated instantly — no email required",
            "Install the retainr node in n8n or the module in Make.com",
            "Add your API key to the credential/connection",
            "Start storing and searching memories in your workflows",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Platform quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: "n8n", sub: "Community node", href: "/docs#n8n" },
          { name: "Make.com", sub: "Module", href: "/docs#makecom" },
          { name: "Zapier", sub: "REST API", href: "/docs#zapier" },
        ].map((p) => (
          <Link
            key={p.name}
            href={p.href}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center transition hover:border-gray-400 hover:bg-white"
          >
            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
            <p className="mt-0.5 text-xs text-gray-400">{p.sub}</p>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        All accounts start on the free plan (1,000 ops/month).{" "}
        <Link href="/pricing" className="text-gray-600 hover:text-gray-900 underline underline-offset-2">
          See all plans
        </Link>
      </p>
    </div>
  )
}
