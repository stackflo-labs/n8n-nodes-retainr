import Link from "next/link"

function CTA({ text = "Try retainr free", href = "/dashboard" }: { text?: string; href?: string }) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-violet-500/30 bg-violet-950/30 p-6 text-center">
      <p className="mb-4 text-lg font-semibold text-white">Ready to give your AI agents persistent memory?</p>
      <Link
        href={href}
        className="inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
      >
        {text} →
      </Link>
      <p className="mt-3 text-sm text-gray-400">Free plan includes 1,000 memory operations/month. No credit card required.</p>
    </div>
  )
}

function Callout({ type = "info", children }: { type?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    info:    "border-blue-500/40 bg-blue-950/30 text-blue-200",
    warning: "border-yellow-500/40 bg-yellow-950/30 text-yellow-200",
    tip:     "border-green-500/40 bg-green-950/30 text-green-200",
  }
  const icons = { info: "ℹ️", warning: "⚠️", tip: "💡" }
  return (
    <div className={`not-prose my-6 rounded-xl border px-5 py-4 ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  )
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-4 flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <div className="mt-1 text-gray-300">{children}</div>
      </div>
    </div>
  )
}

export const mdxComponents = { CTA, Callout, Step }
