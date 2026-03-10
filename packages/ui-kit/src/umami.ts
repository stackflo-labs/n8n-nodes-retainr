// Umami custom event tracking helper.
// window.umami is injected by the Umami script (analytics.retainr.dev/script.js).
// Safe to call even when Umami is not loaded (e.g. dev without NEXT_PUBLIC_UMAMI_WEBSITE_ID).

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, props?: Record<string, string | number | boolean>) => void
    }
  }
}

export function track(eventName: string, props?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined") {
    window.umami?.track(eventName, props)
  }
}
