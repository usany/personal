/**
 * main.ts — entry point. Wires the DOM (planner §3.1 ids) to the API client.
 *
 * Flow:
 *   boot -> health check + load presets -> user edits form -> Capture ->
 *   POST /api/screenshot -> preview + enable Download.
 */
import { captureScreenshot, getHealth, getPresets, ScreenshotError, } from './api.js';
import { clearError, el, populatePresets, setHealth, setLoading, setUrlHint, showError, updatePreview, } from './components.js';
/** URL is "capturable" when non-empty AND parseable http(s). */
function readUrlState(raw) {
    const value = raw.trim();
    if (!value)
        return { value, valid: false };
    try {
        const u = new URL(value);
        return { value, valid: u.protocol === 'http:' || u.protocol === 'https:' };
    }
    catch {
        return { value, valid: false };
    }
}
function syncCaptureEnabled() {
    const { value, valid } = readUrlState(el('url-input').value);
    const btn = el('capture-btn');
    // Planner §3.1: Capture enabled when URL non-empty. We also require it to be
    // valid http(s) so the request can't fail client-side; hint explains why.
    btn.disabled = value.length === 0 || !valid;
    setUrlHint(value.length > 0 && !valid);
}
function collectParams() {
    const { value } = readUrlState(el('url-input').value);
    const width = clampInt(el('width-input').value, 1, 3840, 1920);
    const height = clampInt(el('height-input').value, 1, 2160, 1080);
    const format = el('format-select').value;
    const fullPage = el('fullpage-toggle').checked;
    return { url: value, width, height, format, fullPage };
}
function clampInt(raw, min, max, fallback) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n))
        return fallback;
    return Math.min(max, Math.max(min, n));
}
/** Preset change fills width/height from the selected option's data-* dims. */
function onPresetChange() {
    const select = el('preset-select');
    const opt = select.selectedOptions[0];
    if (!opt)
        return;
    const w = opt.dataset.width;
    const h = opt.dataset.height;
    if (w)
        el('width-input').value = w;
    if (h)
        el('height-input').value = h;
}
async function onCapture(event) {
    event.preventDefault();
    clearError();
    setLoading(true);
    try {
        const result = await captureScreenshot(collectParams());
        updatePreview(result);
    }
    catch (err) {
        showError(errorMessage(err));
    }
    finally {
        setLoading(false);
        syncCaptureEnabled();
    }
}
function errorMessage(err) {
    if (err instanceof ScreenshotError)
        return `${err.message} (${err.code})`;
    if (err instanceof TypeError)
        return 'Could not reach the server. Is it running?';
    return err instanceof Error ? err.message : 'Unexpected error.';
}
/** Download the current preview blob using the server-provided filename. */
function onDownload() {
    const btn = el('download-btn');
    const url = btn.dataset.objectUrl;
    const filename = btn.dataset.filename ?? 'screenshot.png';
    if (!url)
        return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}
async function boot() {
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
    }
    catch {
        setHealth('error');
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
}
else {
    void boot();
}
//# sourceMappingURL=main.js.map