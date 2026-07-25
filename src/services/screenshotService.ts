import { type Browser, chromium } from 'playwright';
import { CAPTURE_TIMEOUT_MS, type ImageFormat } from '../config.js';
import { AppError } from '../lib/AppError.js';

/**
 * Playwright chromium singleton. One browser is launched lazily on first use
 * and reused across requests; each capture gets a fresh isolated context/page.
 */
let browserPromise: Promise<Browser> | null = null;

export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true }).catch((err) => {
      // reset so a later request can retry the launch
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

export async function isBrowserReady(): Promise<boolean> {
  if (!browserPromise) return false;
  try {
    const browser = await browserPromise;
    return browser.isConnected();
  } catch {
    return false;
  }
}

export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    // ignore
  } finally {
    browserPromise = null;
  }
}

export interface CaptureOptions {
  url: string;
  width: number;
  height: number;
  format: ImageFormat;
  fullPage: boolean;
}

export interface CaptureResult {
  buffer: Buffer;
  mime: string;
  ext: string;
  width: number;
  height: number;
  format: ImageFormat;
  durationMs: number;
}

/**
 * Capture a screenshot of `url` at the requested viewport.
 * Maps Playwright failures to the contract error codes:
 *   - timeout           -> 504 TIMEOUT
 *   - any other nav err -> 422 NAVIGATION_FAILED
 *   - unexpected        -> 500 INTERNAL_ERROR
 */
export async function captureScreenshot(opts: CaptureOptions): Promise<CaptureResult> {
  const { url, width, height, format, fullPage } = opts;
  const started = Date.now();

  const browser = await getBrowser();
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'load', timeout: CAPTURE_TIMEOUT_MS });

    const buffer = await page.screenshot({
      type: format,
      fullPage,
      ...(format === 'jpeg' ? { quality: 80 } : {}),
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpeg' : 'png';

    return {
      buffer,
      mime,
      ext,
      width,
      height,
      format,
      durationMs: Date.now() - started,
    };
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    const message = err instanceof Error ? err.message : String(err);
    if (name === 'TimeoutError' || /timeout/i.test(message)) {
      throw new AppError(504, 'TIMEOUT', `capture timed out: ${message}`);
    }
    throw new AppError(422, 'NAVIGATION_FAILED', `failed to navigate to url: ${message}`);
  } finally {
    await context.close().catch(() => {});
  }
}
