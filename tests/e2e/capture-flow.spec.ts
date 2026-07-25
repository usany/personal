import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { EXAMPLE_URL, PNG_SIGNATURE, captureAndWait, fillCaptureForm, readPngDimensions } from './helpers.js';

/**
 * Happy path (planner §5.2-3, §5.2-5): enter URL → set dimensions → Capture →
 * preview renders → Download produces a valid PNG file with the right name/size.
 * Real capture of the stable public site example.com.
 */
test.describe('capture flow (happy path)', () => {
  test('capture example.com at 1024x768, preview + download a valid PNG', async ({ page }) => {
    await page.goto('/');
    await fillCaptureForm(page, { url: EXAMPLE_URL, width: 1024, height: 768, format: 'png' });

    const response = await captureAndWait(page);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    expect(response.headers()['x-screenshot-width']).toBe('1024');
    expect(response.headers()['x-screenshot-height']).toBe('768');

    // Status bar reflects the capture metadata.
    await expect(page.locator('#status-bar')).toBeVisible();
    await expect(page.locator('#status-bar')).toContainText('1024×768');
    await expect(page.locator('#status-bar')).toContainText('PNG');

    // Download becomes enabled after a successful capture.
    await expect(page.locator('#download-btn')).toBeEnabled();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#download-btn');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('screenshot-1024x768.png');

    const path = await download.path();
    const buf = readFileSync(path);
    expect(buf.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    // The downloaded PNG really is 1024x768.
    expect(readPngDimensions(buf)).toEqual({ width: 1024, height: 768 });
  });

  test('a second capture replaces the preview image', async ({ page }) => {
    await page.goto('/');

    await fillCaptureForm(page, { url: EXAMPLE_URL, width: 800, height: 600 });
    await captureAndWait(page);
    const firstSrc = await page.locator('#preview-img').getAttribute('src');

    await fillCaptureForm(page, { url: EXAMPLE_URL, width: 640, height: 480 });
    await captureAndWait(page);
    const secondSrc = await page.locator('#preview-img').getAttribute('src');

    expect(secondSrc).not.toBe(firstSrc);
    await expect(page.locator('#status-bar')).toContainText('640×480');
  });
});
