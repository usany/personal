import { expect, test } from '@playwright/test';

/**
 * Error handling — the UI surfaces failures in #error-banner (planner §5.2-4)
 * and never renders a preview for a failed capture.
 */
test.describe('error handling', () => {
  test('client-side: invalid URL keeps Capture disabled and shows the hint', async ({ page }) => {
    await page.goto('/');
    await page.fill('#url-input', 'http://'); // no host → fails the client URL guard
    // The real-time guard prevents an impossible request from ever being sent.
    await expect(page.locator('#capture-btn')).toBeDisabled();
    await expect(page.locator('#error-banner')).toBeHidden();
  });

  test('server-side: unreachable host renders NAVIGATION_FAILED in the banner', async ({ page }) => {
    await page.goto('/');
    // A syntactically valid https URL that will never resolve → passes the
    // client guard, fails at the server (422 NAVIGATION_FAILED).
    await page.fill('#url-input', 'https://this-domain-does-not-exist-zzz.invalid');
    await expect(page.locator('#capture-btn')).toBeEnabled();

    const responsePromise = page.waitForResponse((r) => r.url().includes('/api/screenshot'));
    await page.click('#capture-btn');
    const response = await responsePromise;
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.code).toBe('NAVIGATION_FAILED');

    // Banner is visible and carries the stable code; no preview appears.
    await expect(page.locator('#error-banner')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('NAVIGATION_FAILED');
    await expect(page.locator('#preview-img')).toBeHidden();
    // Loading state was cleared even on failure.
    await expect(page.locator('#capture-btn')).toHaveAttribute('data-loading', 'false');
  });
});
