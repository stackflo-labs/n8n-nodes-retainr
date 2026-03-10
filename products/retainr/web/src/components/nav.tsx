import Link from "next/link"

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          retainr
        </Link>
        <div className="flex items-center gap-8 text-sm text-gray-500">
          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
          <Link href="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}
