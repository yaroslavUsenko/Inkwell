// @ts-check
const { defineConfig, devices } = require('@playwright/test')
const path = require('path')

/** @see https://playwright.dev/docs/test-configuration */
module.exports = defineConfig({
  testDir: './rnp',

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Single worker on CI to avoid resource contention */
  workers: process.env.CI ? 1 : undefined,
  /* List reporter in terminal + HTML artifact; just HTML locally */
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['html']],

  use: {
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying a failed test */
    trace: 'on-first-retry',
  },

  projects: [
    // Runs once before all spec files: registers the shared test user in the DB.
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // All spec files run after setup (test user is guaranteed to exist).
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  /* Playwright starts both servers automatically and waits until their URLs
   * respond before running any test.
   *
   * reuseExistingServer: !process.env.CI
   *   — in CI (CI=true)  → always starts a fresh isolated server
   *   — locally           → reuses a running server, or starts one if absent
   *
   * GET /api/posts is a public endpoint (returns 200) — used as a readiness
   * check for the backend.                                                   */
  webServer: [
    {
      command: 'npm run dev --prefix frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'node server.js',
      cwd: path.join(__dirname, 'backend'),
      url: 'http://localhost:5000/api/posts',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 15_000,
    },
  ],
})
