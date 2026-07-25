import { expect, test } from '@playwright/test';

/**
 * Presets — selecting a device preset fills width/height (planner §5.2-2, §3.1).
 * Values come from GET /api/presets (server config.ts is source of truth).
 */
test.describe('device presets', () => {
  test('preset select is populated from the API (>1 option)', async ({ page }) => {
    await page.goto('/');
    // Wait for boot to replace the "Loading presets…" placeholder.
    await expect
      .poll(async () => page.locator('#preset-select option').count())
      .toBeGreaterThan(1);

    const values = await page.locator('#preset-select option').evaluateAll((opts) =>
      opts.map((o) => (o as HTMLOptionElement).value),
    );
    expect(values).toEqual(expect.arrayContaining(['desktop', 'laptop', 'tablet', 'mobile']));
  });

  // Contract values from src/config.ts PRESETS (planner §2.2).
  const cases = [
    { id: 'desktop', width: '1920', height: '1080' },
    { id: 'laptop', width: '1366', height: '768' },
    { id: 'tablet', width: '768', height: '1024' },
    { id: 'mobile', width: '390', height: '844' },
  ];

  for (const c of cases) {
    test(`selecting "${c.id}" sets width=${c.width} height=${c.height}`, async ({ page }) => {
      await page.goto('/');
      await expect
        .poll(async () => page.locator('#preset-select option').count())
        .toBeGreaterThan(1);

      await page.selectOption('#preset-select', c.id);
      await expect(page.locator('#width-input')).toHaveValue(c.width);
      await expect(page.locator('#height-input')).toHaveValue(c.height);
    });
  }
});
