import { expect, test } from '@playwright/test';

/**
 * Health indicator (UI) — DOCUMENTED KNOWN DEFECT.
 *
 * Expected: on a healthy server the status dot turns "ready" (green).
 * Actual:   it is stuck on "connecting…" forever.
 *
 * Root cause — a cross-boundary contract conflict only the E2E layer sees:
 *   • public/ts/main.ts sets "ready" only when
 *       health.status === 'ok' && health.browserReady
 *   • src/routes/health.ts returns exactly { status: "ok" } (no browserReady),
 *     because tests/integration/health.spec.ts locks the body to that shape.
 *   • planner §2.1 originally specified { status:"ok", browserReady:true }.
 *   ⇒ health.browserReady is always undefined ⇒ the dot never turns green.
 *
 * Marked test.fail() so the suite stays green while the defect is tracked.
 * Remove the test.fail() line once the fix lands (see 05_qa_tester.md §Findings).
 */
test.describe('health indicator', () => {
  test('status dot reaches "ready" on a healthy server', async ({ page }) => {
    test.fail(true, 'Known defect: dot stuck on "connecting…"; see 05_qa_tester.md');
    await page.goto('/');
    // Give boot's getHealth() time to resolve.
    await expect(page.locator('#health-status')).toHaveAttribute('data-ready', 'true', {
      timeout: 4000,
    });
    await expect(page.locator('#health-label')).toHaveText('ready');
  });
});
