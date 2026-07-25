import { expect, test } from '@playwright/test';
import { captureTargetUrl, expectErrorShape, postScreenshot } from './helpers';

/**
 * Parameter validation + error-mapping contract for POST /api/screenshot.
 * Source: 01_planner.md §7.2 (Error table) and §7.4 (recommended tests 5–8).
 *
 * Every error response must be JSON of shape { error: string, code: string }
 * with the exact status/code pairing below. This is the guardrail the
 * server-side validators (validateUrl / validateDimensions / formatImage) must satisfy.
 */

test.describe('POST /api/screenshot — URL validation (400 INVALID_URL)', () => {
  test('missing url', async ({ request }) => {
    const res = await postScreenshot(request, {});
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_URL');
  });

  test('empty url', async ({ request }) => {
    const res = await postScreenshot(request, { url: '' });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_URL');
  });

  test('non-http(s) protocol: ftp://', async ({ request }) => {
    const res = await postScreenshot(request, { url: 'ftp://example.com/file' });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_URL');
  });

  test('blocked scheme: file://', async ({ request }) => {
    const res = await postScreenshot(request, { url: 'file:///etc/passwd' });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_URL');
  });

  test('unparseable url', async ({ request }) => {
    const res = await postScreenshot(request, { url: 'not a url' });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_URL');
  });
});

test.describe('POST /api/screenshot — dimension validation (400 INVALID_DIMENSIONS)', () => {
  test('width = 0 (below min)', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL), width: 0 });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_DIMENSIONS');
  });

  test('width = 99999 (above 3840 max)', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL), width: 99999 });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_DIMENSIONS');
  });

  test('height = 4321 (above 4320 max)', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL), height: 4321 });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_DIMENSIONS');
  });

  test('non-integer height (12.5)', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL), height: 12.5 });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_DIMENSIONS');
  });
});

test.describe('POST /api/screenshot — format validation (400 INVALID_FORMAT)', () => {
  test('unsupported format: webp', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, { url: captureTargetUrl(baseURL), format: 'webp' });
    expect(res.status()).toBe(400);
    expect((await expectErrorShape(res)).code).toBe('INVALID_FORMAT');
  });
});

test.describe('POST /api/screenshot — navigation failure (422 / 504)', () => {
  test('unreachable host maps to NAVIGATION_FAILED (or TIMEOUT)', async ({ request }) => {
    // Port 1 refuses instantly on loopback => deterministic, no external network.
    const res = await postScreenshot(request, { url: 'http://127.0.0.1:1/' });

    // Plan §7.4-8 allows either mapping depending on how Chromium surfaces the failure.
    expect([422, 504]).toContain(res.status());
    const { code } = await expectErrorShape(res);
    expect(['NAVIGATION_FAILED', 'TIMEOUT']).toContain(code);
  });
});

test.describe('POST /api/screenshot — dimension boundaries accepted', () => {
  test('width = 1 (min) is valid → 200', async ({ request, baseURL }) => {
    const res = await postScreenshot(request, {
      url: captureTargetUrl(baseURL),
      width: 1,
      height: 1,
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['x-screenshot-width']).toBe('1');
    expect(res.headers()['x-screenshot-height']).toBe('1');
  });
});
