import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 422 })
  }

  const { email, name, platform, utm_source, utm_medium, utm_campaign } = body as Record<string, string>

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 422 })
  }

  // Derive name from email if not supplied
  const workspaceName = name?.trim() || email.split("@")[0]

  const upstream = await fetch(`${API_URL}/v1/workspace/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: workspaceName,
      email,
      platform: platform ?? "",
      utm_source: utm_source ?? "",
      utm_medium: utm_medium ?? "",
      utm_campaign: utm_campaign ?? "",
    }),
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
