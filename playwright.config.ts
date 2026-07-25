import { defineConfig } from '@playwright/test';

/**
 * Provisional Playwright config authored by integration-tester so the
 * tests/integration specs are runnable as the API contract.
 *
 * See 01_planner.md §2 (playwright.config.ts) + §8 (scripts).
 * server-side-writer owns finalizing the `webServer.command` once the real
 * build/start scripts exist; the shape below (webServer auto-start + two
 * projects) is the agreed layout.
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // shared single Chromium (browser singleton) in the server
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: 'integration',
      testDir: './tests/integration',
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      testMatch: /.*\.spec\.ts/,
    },
  ],
  webServer: {
    // Provisional: server-side-writer confirms the exact start command (plan §8).
    command: process.env.PW_WEB_SERVER_CMD ?? 'pnpm start',
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
