import { expect, type Page } from '@playwright/test';

/**
 * Shared helpers for the E2E (browser UI) tests.
 *
 * These drive the real client (public/index.html + compiled public/ts/*.js)
 * through Playwright's `page` fixture and assert on the stable ids from
 * planner §3.1. The app is auto-started by playwright.config.ts `webServer`.
 */

/** PNG magic number (8 bytes): 89 50 4E 47 0D 0A 1A 0A */
export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** JPEG SOI + marker: FF D8 FF */
export const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

/** Stable public test targets (planner §5 keeps happy paths deterministic). */
export const EXAMPLE_URL = 'https://example.com';
export const KHUSAN_URL = 'https://khusan.co.kr';

/** Read width/height from a PNG buffer's IHDR chunk (bytes 16–23, big-endian). */
export function readPngDimensions(buf: Buffer): { width: number; height: number } {
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('buffer is not a valid PNG');
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/**
 * Fill the capture form. Setting width/height directly (not via preset) so the
 * exact requested viewport reaches the API.
 */
export async function fillCaptureForm(
  page: Page,
  opts: { url: string; width?: number; height?: number; format?: 'png' | 'jpeg' },
): Promise<void> {
  await page.fill('#url-input', opts.url);
  if (opts.width != null) await page.fill('#width-input', String(opts.width));
  if (opts.height != null) await page.fill('#height-input', String(opts.height));
  if (opts.format != null) await page.selectOption('#format-select', opts.format);
}

/**
 * Click Capture and wait for the preview image to render with a blob URL.
 * Returns the /api/screenshot response so callers can assert on headers.
 */
export async function captureAndWait(page: Page) {
  const responsePromise = page.waitForResponse((r) => r.url().includes('/api/screenshot'));
  await page.click('#capture-btn');
  const response = await responsePromise;
  // Loading state clears and the image becomes visible with a blob: src.
  await expect(page.locator('#capture-btn')).toHaveAttribute('data-loading', 'false');
  await expect(page.locator('#preview-img')).toBeVisible();
  const src = await page.locator('#preview-img').getAttribute('src');
  expect(src ?? '').toMatch(/^blob:/);
  return response;
}
