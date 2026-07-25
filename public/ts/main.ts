/**
 * main.ts — entry point. Wires the DOM (planner §3.1 ids) to the API client.
 *
 * Flow:
 *   boot -> health check + load presets -> user edits form -> Capture ->
 *   POST /api/screenshot -> preview + enable Download.
 */

import {
  captureScreenshot,
  getHealth,
  getPresets,
  ScreenshotError,
  type CaptureParams,
  type ScreenshotFormat,
} from './api.js';
import {
  clearError,
  el,
  populatePresets,
  setHealth,
  setLoading,
  setUrlHint,
  showError,
  updatePreview,
} from './components.js';

/** URL is "capturable" when non-empty AND parseable http(s). */
function readUrlState(raw: string): { value: string; valid: boolean } {
  const value = raw.trim();
  if (!value) return { value, valid: false };
  try {
    const u = new URL(value);
    return { value, valid: u.protocol === 'http:' || u.protocol === 'https:' };
  } catch {
    return { value, valid: false };
  }
}

function syncCaptureEnabled(): void {
  const { value, valid } = readUrlState(el<HTMLInputElement>('url-input').value);
  const btn = el<HTMLButtonElement>('capture-btn');
  // Planner §3.1: Capture enabled when URL non-empty. We also require it to be
  // valid http(s) so the request can't fail client-side; hint explains why.
  btn.disabled = value.length === 0 || !valid;
  setUrlHint(value.length > 0 && !valid);
}

function collectParams(): CaptureParams {
  const { value } = readUrlState(el<HTMLInputElement>('url-input').value);
  const width = clampInt(el<HTMLInputElement>('width-input').value, 1, 3840, 1920);
  const height = clampInt(el<HTMLInputElement>('height-input').value, 1, 2160, 1080);
  const format = el<HTMLSelectElement>('format-select').value as ScreenshotFormat;
  const fullPage = el<HTMLInputElement>('fullpage-toggle').checked;
  return { url: value, width, height, format, fullPage };
}

function clampInt(raw: string, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Preset change fills width/height from the selected option's data-* dims. */
function onPresetChange(): void {
  const select = el<HTMLSelectElement>('preset-select');
  const opt = select.selectedOptions[0];
  if (!opt) return;
  const w = opt.dataset.width;
  const h = opt.dataset.height;
  if (w) el<HTMLInputElement>('width-input').value = w;
  if (h) el<HTMLInputElement>('height-input').value = h;
}

async function onCapture(event: Event): Promise<void> {
  event.preventDefault();
  clearError();
  setLoading(true);
  try {
    const result = await captureScreenshot(collectParams());
    updatePreview(result);
  } catch (err) {
    showError(errorMessage(err));
  } finally {
    setLoading(false);
    syncCaptureEnabled();
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof ScreenshotError) return `${err.message} (${err.code})`;
  if (err instanceof TypeError) return 'Could not reach the server. Is it running?';
  return err instanceof Error ? err.message : 'Unexpected error.';
}

/** Download the current preview blob using the server-provided filename. */
function onDownload(): void {
  const btn = el<HTMLButtonElement>('download-btn');
  const url = btn.dataset.objectUrl;
  const filename = btn.dataset.filename ?? 'screenshot.png';
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function boot(): Promise<void> {
  // Wire events first so the form is interactive even if health/presets lag.
  el('url-input').addEventListener('input', syncCaptureEnabled);
  el('preset-select').addEventListener('change', onPresetChange);
  el('capture-form').addEventListener('submit', onCapture);
  el('download-btn').addEventListener('click', onDownload);
  syncCaptureEnabled();

  // Presets (independent, with built-in fallback).
  const presets = await getPresets();
  populatePresets(presets.presets, presets.default);
  onPresetChange();

  // Health (best-effort; drives the status dot only).
  try {
    const health = await getHealth();
    setHealth(health.status === 'ok' && health.browserReady ? 'ready' : 'connecting');
  } catch {
    setHealth('error');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  void boot();
}
