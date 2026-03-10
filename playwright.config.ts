import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for E2E smoke tests.
 * Tests run against the staging environment in CI, or localhost in dev.
 *
 * ENV vars (set in GitHub Actions for staging):
 *   BASE_URL     - web app URL  (default: http://localhost:3000)
 *   API_BASE_URL - API base URL (default: http://localhost:8080)
 */
export default defineConfig({
  testDir: "./apps/web/e2e",
  fullyParallel: false,        // run sequentially — tests share API state (api key)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
