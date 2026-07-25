/**
 * components.ts — UI component helpers (pure DOM, no fetching).
 *
 * These operate on the stable ids from planner §3.1 (do not rename — the
 * e2e selectors depend on them). main.ts wires events; this file mutates DOM.
 */

import type { CaptureResult, Preset } from './api.js';

/** Narrow getElementById with a thrown error if the element is missing. */
export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

/** Toggle the capture button's loading state (spinner + [data-loading] + disabled). */
export function setLoading(isLoading: boolean): void {
  const btn = el<HTMLButtonElement>('capture-btn');
  const spinner = el('loading-spinner');
  const label = el('capture-btn-label');
  btn.setAttribute('data-loading', String(isLoading));
  btn.disabled = isLoading;
  spinner.classList.toggle('hidden', !isLoading);
  label.textContent = isLoading ? 'Capturing…' : 'Capture';
}

/** Show the error banner with a message. */
export function showError(message: string): void {
  const banner = el('error-banner');
  el('error-message').textContent = message;
  banner.classList.remove('hidden');
}

/** Hide the error banner. */
export function clearError(): void {
  el('error-banner').classList.add('hidden');
}

/** Swap the preview image to a fresh capture, revoking the previous object URL. */
export function updatePreview(result: CaptureResult): void {
  const img = el<HTMLImageElement>('preview-img');
  const prev = img.dataset.objectUrl;
  if (prev) URL.revokeObjectURL(prev);

  img.src = result.objectUrl;
  img.dataset.objectUrl = result.objectUrl;
  img.classList.remove('hidden');
  el('preview-empty').classList.add('hidden');

  // Enable download and stash filename for the download handler.
  const download = el<HTMLButtonElement>('download-btn');
  download.disabled = false;
  download.dataset.filename = result.filename;
  download.dataset.objectUrl = result.objectUrl;

  renderStatus(result);
}

/** Fill the status bar under the preview with capture metadata. */
function renderStatus(result: CaptureResult): void {
  const status = el('status-bar');
  const kb = Math.max(1, Math.round(result.blob.size / 1024));
  const parts = [
    `${result.width}×${result.height}`,
    result.format.toUpperCase(),
    `${kb} KB`,
  ];
  if (result.durationMs != null) parts.push(`${result.durationMs} ms`);
  status.textContent = parts.join(' · ');
  status.classList.remove('hidden');
}

/** Populate the preset <select> and select `defaultId`. */
export function populatePresets(presets: Preset[], defaultId: string): void {
  const select = el<HTMLSelectElement>('preset-select');
  select.innerHTML = '';
  for (const p of presets) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.label} (${p.width}×${p.height})`;
    opt.dataset.width = String(p.width);
    opt.dataset.height = String(p.height);
    select.appendChild(opt);
  }
  const exists = presets.some((p) => p.id === defaultId);
  select.value = exists ? defaultId : (presets[0]?.id ?? '');
}

/** Reflect server health on the status dot + label. */
export function setHealth(state: 'ready' | 'error' | 'connecting'): void {
  const dot = el('health-status');
  const label = el('health-label');
  if (state === 'ready') {
    dot.setAttribute('data-ready', 'true');
    label.textContent = 'ready';
  } else if (state === 'error') {
    dot.setAttribute('data-ready', 'error');
    label.textContent = 'server offline';
  } else {
    dot.setAttribute('data-ready', 'false');
    label.textContent = 'connecting…';
  }
}

/** Show/hide the URL format hint (real-time validation feedback). */
export function setUrlHint(show: boolean): void {
  el('url-hint').classList.toggle('hidden', !show);
}
