import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Shared helpers for the integration (Playwright API) tests.
 *
 * Contract source of truth: _workspace/01_planner.md §7 (Integration Points).
 * These helpers exist so every spec agrees on endpoints, the capture target,
 * and the error-body shape — the writers implement against this.
 */

export const HEALTH_PATH = '/api/health';
export const SCREENSHOT_PATH = '/api/screenshot';

/** PNG magic number (8 bytes): 89 50 4E 47 0D 0A 1A 0A */
export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** JPEG SOI + marker: FF D8 FF */
export const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

export interface ScreenshotBody {
  url?: unknown;
  width?: unknown;
  height?: unknown;
  format?: unknown;
}

/**
 * Capture target for happy-path tests.
 *
 * Decision (see 02_integration_tests.md §Assumptions): tests capture the app's
 * OWN served origin instead of an external site. This keeps the test
 * deterministic and network-independent — the server-under-test is already
 * running locally via playwright webServer, so its Chromium can always reach it.
 * The local fixtures/testPage.html documents the intended shape of that target.
 */
export function captureTargetUrl(baseURL: string | undefined): string {
  if (!baseURL) throw new Error('baseURL is not configured in playwright.config.ts');
  return new URL('/', baseURL).toString();
}

export function postScreenshot(
  request: APIRequestContext,
  data: ScreenshotBody,
): Promise<APIResponse> {
  return request.post(SCREENSHOT_PATH, { data });
}

/** Asserts the error body matches the { error: string, code: string } contract and returns code. */
export async function expectErrorShape(res: APIResponse): Promise<{ error: string; code: string }> {
  const contentType = res.headers()['content-type'] ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`expected JSON error body, got content-type "${contentType}"`);
  }
  const body = (await res.json()) as { error?: unknown; code?: unknown };
  if (typeof body.error !== 'string' || body.error.length === 0) {
    throw new Error(`error field must be a non-empty string, got: ${JSON.stringify(body.error)}`);
  }
  if (typeof body.code !== 'string' || body.code.length === 0) {
    throw new Error(`code field must be a non-empty string, got: ${JSON.stringify(body.code)}`);
  }
  return { error: body.error, code: body.code };
}
