import { expect, test } from '@playwright/test';
import {
  captureTargetUrl,
  JPEG_SIGNATURE,
  PNG_SIGNATURE,
  postScreenshot,
} from './helpers';

/**
 * Happy-path contract for POST /api/screenshot.
 * Source: 01_planner.md §7.2 (Success — 200) and §7.4 (recommended tests 2–4).
 *
 * These assert the *binary image response* design (assumption §10.4 in the plan):
 * the body is the raw image, not base64 JSON. Metadata travels in X-Screenshot-* headers.
 */
test.describe('POST /api/screenshot — success', () => {
  test('PNG (default format): 200, image/png, valid PNG body', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL) });

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');

    const body = await res.body();
    expect(body.length).toBeGreaterThan(0);
    // First 8 bytes must be the PNG signature.
    expect(body.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)).toBe(true);
  });

  test('JPEG format: 200, image/jpeg, valid JPEG body', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, {
      url: captureTargetUrl(baseURL),
      format: 'jpeg',
    });

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/jpeg');

    const body = await res.body();
    expect(body.length).toBeGreaterThan(0);
    expect(body.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)).toBe(true);
  });

  test('requested width/height are echoed in X-Screenshot-* headers', async ({
    request,
    baseURL,
  }) => {
    const width = 800;
    const height = 600;
    const res = await postScreenshot(request, {
      url: captureTargetUrl(baseURL),
      width,
      height,
    });

    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers['x-screenshot-width']).toBe(String(width));
    expect(headers['x-screenshot-height']).toBe(String(height));
    expect(headers['x-screenshot-format']).toBe('png');
  });

  test('omitting dimensions applies the 1280x720 defaults (plan §7.2 / §10.1)', async ({
    request,
    baseURL,
  }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL) });

    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers['x-screenshot-width']).toBe('1280');
    expect(headers['x-screenshot-height']).toBe('720');
  });

  test('Content-Disposition carries the screenshot-{w}x{h}.{ext} filename', async ({
    request,
    baseURL,
  }) => {
    const res = await postScreenshot(request, {
      url: captureTargetUrl(baseURL),
      width: 640,
      height: 480,
      format: 'jpeg',
    });

    expect(res.status()).toBe(200);
    const disposition = res.headers()['content-disposition'] ?? '';
    expect(disposition).toContain('inline');
    expect(disposition).toContain('filename="screenshot-640x480.jpeg"');
  });

  test('X-Screenshot-Duration-Ms is present and numeric', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL) });

    expect(res.status()).toBe(200);
    const duration = res.headers()['x-screenshot-duration-ms'];
    expect(duration).toBeDefined();
    expect(Number.isNaN(Number(duration))).toBe(false);
    expect(Number(duration)).toBeGreaterThanOrEqual(0);
  });
});
