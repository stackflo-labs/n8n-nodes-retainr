import { test, expect } from "@playwright/test"

// API base URL — set via env in GitHub Actions, defaults to local
const API = process.env.API_BASE_URL || "http://localhost:8080"

// When true, skip any tests that write data (used for production smoke runs)
const WEB_ONLY = process.env.SMOKE_WEB_ONLY === "true"

// Shared state across ordered tests
let apiKey = ""

// ── API: infrastructure ───────────────────────────────────────────────────────

test.describe("API health", () => {
  test("GET /health returns ok", async ({ request }) => {
    const res = await request.get(`${API}/health`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe("ok")
  })
})

// ── API: auth + memory lifecycle ──────────────────────────────────────────────

test.describe("API memory lifecycle", () => {
  test.skip(() => WEB_ONLY, "Skipped in web-only / production smoke mode")
  test("register workspace and get API key", async ({ request }) => {
    const res = await request.post(`${API}/v1/workspace/register`, {
      data: {
        email: `smoke-${Date.now()}@retainr-test.dev`,
        name: "Smoke Test Workspace",
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.api_key).toMatch(/^rec_live_/)
    apiKey = body.api_key
  })

  test("store a memory", async ({ request }) => {
    expect(apiKey).toBeTruthy()
    const res = await request.post(`${API}/v1/memories`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: {
        content: "Customer prefers dark mode and uses n8n for automation workflows",
        scope: "global",
        tags: ["smoke-test"],
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.id).toBeTruthy()
  })

  test("semantic search returns results", async ({ request }) => {
    expect(apiKey).toBeTruthy()
    // Give embeddings a moment to settle (Voyage AI async in some configs)
    await new Promise((r) => setTimeout(r, 1500))

    const res = await request.post(`${API}/v1/memories/search`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: {
        query: "user interface preferences automation",
        limit: 5,
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.results)).toBe(true)
    expect(body.results.length).toBeGreaterThan(0)
  })

  test("list memories by tag", async ({ request }) => {
    expect(apiKey).toBeTruthy()
    const res = await request.get(`${API}/v1/memories`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { tags: "smoke-test" },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.memories.length).toBeGreaterThan(0)
  })

  test("reject invalid API key with 401", async ({ request }) => {
    const res = await request.get(`${API}/v1/memories`, {
      headers: { Authorization: "Bearer rec_live_invalidkeyfortesting" },
    })
    expect(res.status()).toBe(401)
  })

  test("delete smoke-test memories (cleanup)", async ({ request }) => {
    if (!apiKey) return
    const res = await request.delete(`${API}/v1/memories`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { tags: "smoke-test" },
    })
    expect([200, 204]).toContain(res.status())
  })
})

// ── Web: page loads ───────────────────────────────────────────────────────────

test.describe("Web pages", () => {
  test("homepage loads with correct title", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/retainr/i)
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.locator("h1").first()).toBeVisible()
    // Should have at least one pricing tier button
    await expect(page.getByRole("link", { name: /get started|free|builder|pro/i }).first()).toBeVisible()
  })

  test("blog index loads with posts", async ({ page }) => {
    await page.goto("/blog")
    await expect(page.locator("h1").first()).toBeVisible()
    // At least one article link
    await expect(page.locator("article, [data-post]").first().or(page.locator("a[href^='/blog/']").first())).toBeVisible()
  })

  test("docs page loads", async ({ page }) => {
    await page.goto("/docs")
    await expect(page.locator("h1").first()).toBeVisible()
    // Should have code blocks (API reference)
    await expect(page.locator("pre, code").first()).toBeVisible()
  })

  test("dashboard / signup page loads", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("form")).toBeVisible()
    await expect(page.locator("input[type=email]")).toBeVisible()
  })

  test("templates index loads", async ({ page }) => {
    await page.goto("/templates")
    await expect(page.locator("h1").first()).toBeVisible()
  })
})
