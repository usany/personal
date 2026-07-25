import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  EXAMPLE_URL,
  KHUSAN_URL,
  PNG_SIGNATURE,
  captureAndWait,
  fillCaptureForm,
  readPngDimensions,
} from './helpers.js';

/**
 * Real-world captures of public sites at multiple viewport sizes, driven end to
 * end through the browser UI.
 *
 * The headline case (QA brief): capture https://khusan.co.kr at 1980×1080 and
 * verify the returned screenshot honours the requested width/height exactly.
 */
test.describe('real-world capture', () => {
  test('khusan.co.kr at 1980x1080 honours the requested dimensions', async ({ page }) => {
    await page.goto('/');
    await fillCaptureForm(page, { url: KHUSAN_URL, width: 1980, height: 1080, format: 'png' });

    // Confirm the exact values reached the form controls before capturing.
    await expect(page.locator('#width-input')).toHaveValue('1980');
    await expect(page.locator('#height-input')).toHaveValue('1080');

    const response = await captureAndWait(page);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    // The server echoes back the requested viewport.
    expect(response.headers()['x-screenshot-width']).toBe('1980');
    expect(response.headers()['x-screenshot-height']).toBe('1080');

    // UI reflects the same dimensions.
    await expect(page.locator('#status-bar')).toContainText('1980×1080');

    // Download the file and verify the pixels really are 1980×1080.
    const downloadPromise = page.waitForEvent('download');
    await page.click('#download-btn');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('screenshot-1980x1080.png');

    const buf = readFileSync(await download.path());
    expect(buf.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    expect(readPngDimensions(buf)).toEqual({ width: 1980, height: 1080 });
  });

  test('example.com captured at several viewport sizes', async ({ page }) => {
    await page.goto('/');

    const sizes = [
      { width: 390, height: 844 }, // mobile
      { width: 1366, height: 768 }, // laptop
      { width: 1920, height: 1080 }, // desktop
    ];

    for (const { width, height } of sizes) {
      await fillCaptureForm(page, { url: EXAMPLE_URL, width, height, format: 'png' });
      const response = await captureAndWait(page);
      expect(response.status()).toBe(200);
      expect(response.headers()['x-screenshot-width']).toBe(String(width));
      expect(response.headers()['x-screenshot-height']).toBe(String(height));
      await expect(page.locator('#status-bar')).toContainText(`${width}×${height}`);
    }
  });
});
