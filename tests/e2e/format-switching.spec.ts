import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  EXAMPLE_URL,
  JPEG_SIGNATURE,
  PNG_SIGNATURE,
  captureAndWait,
  fillCaptureForm,
} from './helpers.js';

/**
 * Format switching — capturing as PNG then JPEG produces the right MIME,
 * body magic bytes, and download filename extension (.png vs .jpeg).
 */
test.describe('format switching', () => {
  test('PNG then JPEG yield distinct content-types and filenames', async ({ page }) => {
    await page.goto('/');

    // --- PNG ---
    await fillCaptureForm(page, { url: EXAMPLE_URL, width: 800, height: 600, format: 'png' });
    const pngRes = await captureAndWait(page);
    expect(pngRes.headers()['content-type']).toContain('image/png');
    expect(pngRes.headers()['x-screenshot-format']).toBe('png');

    const pngDownloadPromise = page.waitForEvent('download');
    await page.click('#download-btn');
    const pngDownload = await pngDownloadPromise;
    expect(pngDownload.suggestedFilename()).toBe('screenshot-800x600.png');
    const pngBuf = readFileSync(await pngDownload.path());
    expect(pngBuf.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);

    // --- JPEG (same page, switch format) ---
    await page.selectOption('#format-select', 'jpeg');
    const jpegRes = await captureAndWait(page);
    expect(jpegRes.headers()['content-type']).toContain('image/jpeg');
    expect(jpegRes.headers()['x-screenshot-format']).toBe('jpeg');

    const jpegDownloadPromise = page.waitForEvent('download');
    await page.click('#download-btn');
    const jpegDownload = await jpegDownloadPromise;
    // Contract: jpeg extension is ".jpeg", not ".jpg".
    expect(jpegDownload.suggestedFilename()).toBe('screenshot-800x600.jpeg');
    const jpegBuf = readFileSync(await jpegDownload.path());
    expect(jpegBuf.subarray(0, 3).equals(JPEG_SIGNATURE)).toBe(true);

    await expect(page.locator('#status-bar')).toContainText('JPEG');
  });
});
