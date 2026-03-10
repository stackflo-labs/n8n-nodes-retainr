import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "retainr — AI Agent Memory for Make.com, n8n & Zapier"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#030712",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(139,92,246,0.2)",
            border: "1px solid rgba(139,92,246,0.4)",
            borderRadius: "100px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#a78bfa", fontSize: 18, fontWeight: 600 }}>
            AI Agent Memory API
          </span>
        </div>

        {/* Logo / Brand */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: "24px" }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: "#a78bfa", letterSpacing: "-2px" }}>
            retainr
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "#e5e7eb",
            fontWeight: 500,
            lineHeight: 1.3,
            maxWidth: 800,
            marginBottom: "48px",
          }}
        >
          Persistent memory for AI agents in Make.com, n8n, and Zapier
        </div>

        {/* Platform pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Make.com", "n8n", "Zapier"].map((p) => (
            <div
              key={p}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "10px 24px",
                color: "#9ca3af",
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            color: "rgba(107,114,128,0.8)",
            fontSize: 20,
          }}
        >
          retainr.dev
        </div>
      </div>
    ),
    { ...size }
  )
}
