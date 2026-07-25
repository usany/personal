import { expect, test } from '@playwright/test';

/**
 * Smoke — the app boots, serves the UI, and its API is live.
 * Fast checks that gate everything else; no external network needed.
 */
test.describe('smoke', () => {
  test('page loads with the core UI visible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/URL Screenshot/i);

    // Planner §5.2-1: the essential controls are present and visible.
    await expect(page.locator('#url-input')).toBeVisible();
    await expect(page.locator('#capture-btn')).toBeVisible();
    await expect(page.locator('#preset-select')).toBeVisible();
    await expect(page.locator('#width-input')).toBeVisible();
    await expect(page.locator('#height-input')).toBeVisible();
    await expect(page.locator('#format-select')).toBeVisible();

    // Capture is disabled until a valid URL is entered (empty on load).
    await expect(page.locator('#capture-btn')).toBeDisabled();
    // Download is disabled before the first capture.
    await expect(page.locator('#download-btn')).toBeDisabled();
    // Empty preview state is shown.
    await expect(page.locator('#preview-empty')).toBeVisible();
    await expect(page.locator('#preview-img')).toBeHidden();
  });

  test('GET /api/health returns 200 { status: "ok" }', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  test('GET /api/presets returns the device preset list', async ({ request }) => {
    const res = await request.get('/api/presets');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.presets)).toBe(true);
    expect(body.presets.length).toBeGreaterThan(1);
    for (const p of body.presets) {
      expect(p).toMatchObject({
        id: expect.any(String),
        label: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
      });
    }
    // default must reference a real preset id.
    expect(body.presets.map((p: { id: string }) => p.id)).toContain(body.default);
  });

  test('capture button enables only after a valid http(s) URL is entered', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#capture-btn')).toBeDisabled();

    // Non-http(s) → still disabled, hint shown.
    await page.fill('#url-input', 'not-a-url');
    await expect(page.locator('#capture-btn')).toBeDisabled();
    await expect(page.locator('#url-hint')).toBeVisible();

    // Valid https URL → enabled, hint hidden.
    await page.fill('#url-input', 'https://example.com');
    await expect(page.locator('#capture-btn')).toBeEnabled();
    await expect(page.locator('#url-hint')).toBeHidden();
  });
});
