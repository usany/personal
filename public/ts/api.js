/**
 * api.ts — API client helpers for the URL Screenshot server.
 *
 * Contract sources:
 *   - 01_planner.md §2 (endpoints, request/response shapes)
 *   - 02_integration_tests.md §4 (locked fixed points):
 *       * POST /api/screenshot success = BINARY body (image/png|image/jpeg),
 *         NOT base64/JSON. Client reads it as a Blob -> object URL.
 *       * Success headers: X-Screenshot-Width, X-Screenshot-Height,
 *         X-Screenshot-Format, X-Screenshot-Duration-Ms,
 *         Content-Disposition: inline; filename="screenshot-{w}x{h}.{ext}"
 *       * Error body shape: { error: string, code: string }
 *
 * The planner §2.3 documents an alternate error shape { error:{ code,message } }.
 * parseError() below accepts BOTH so the UI is robust to whichever the server ships.
 */
/** Typed error carrying the stable server `code` (integration tests assert on it). */
export class ScreenshotError extends Error {
    constructor(code, message, status) {
        super(message);
        this.name = 'ScreenshotError';
        this.code = code;
        this.status = status;
    }
}
/**
 * Fallback presets used when GET /api/presets is unavailable.
 * Values mirror planner §2.2 (the server config's source of truth) so the
 * offline fallback matches what the API would return.
 */
export const FALLBACK_PRESETS = {
    presets: [
        { id: 'desktop', label: 'Desktop', width: 1920, height: 1080 },
        { id: 'laptop', label: 'Laptop', width: 1366, height: 768 },
        { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
        { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
    ],
    default: 'desktop',
};
/** GET /api/health — liveness + browser singleton readiness. */
export async function getHealth() {
    const res = await fetch('/api/health', { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`health check failed: ${res.status}`);
    return (await res.json());
}
/**
 * GET /api/presets — device presets for the width/height selector.
 * Falls back to FALLBACK_PRESETS on any failure so the UI stays usable.
 */
export async function getPresets() {
    try {
        const res = await fetch('/api/presets', { headers: { Accept: 'application/json' } });
        if (!res.ok)
            throw new Error(`presets failed: ${res.status}`);
        const data = (await res.json());
        if (!Array.isArray(data.presets) || data.presets.length === 0) {
            throw new Error('presets payload empty');
        }
        return data;
    }
    catch {
        return FALLBACK_PRESETS;
    }
}
/**
 * POST /api/screenshot — capture. Sends the locked request schema
 * {url,width,height,format(,fullPage)} and returns a Blob-backed CaptureResult.
 * Throws ScreenshotError(code,message,status) on any non-2xx.
 */
export async function captureScreenshot(params) {
    const res = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: params.url,
            width: params.width,
            height: params.height,
            format: params.format,
            fullPage: params.fullPage ?? false,
        }),
    });
    if (!res.ok) {
        throw await parseError(res);
    }
    const blob = await res.blob();
    const h = res.headers;
    const format = normalizeFormat(h.get('X-Screenshot-Format'), params.format);
    const width = toInt(h.get('X-Screenshot-Width'), params.width);
    const height = toInt(h.get('X-Screenshot-Height'), params.height);
    const durationRaw = h.get('X-Screenshot-Duration-Ms');
    const durationMs = durationRaw != null && durationRaw !== '' ? Number(durationRaw) : null;
    const filename = filenameFromDisposition(h.get('Content-Disposition')) ??
        `screenshot-${width}x${height}.${format === 'jpeg' ? 'jpeg' : 'png'}`;
    return {
        objectUrl: URL.createObjectURL(blob),
        blob,
        format,
        width,
        height,
        durationMs: Number.isFinite(durationMs) ? durationMs : null,
        filename,
    };
}
/** Parse an error response into a ScreenshotError, tolerating both error shapes. */
async function parseError(res) {
    let code = 'UNKNOWN_ERROR';
    let message = `Request failed (${res.status})`;
    try {
        const body = (await res.json());
        // Shape A (integration contract §4): { error: string, code: string }
        if (typeof body.code === 'string' && body.code)
            code = body.code;
        if (typeof body.error === 'string' && body.error) {
            message = body.error;
        }
        else if (body.error && typeof body.error === 'object') {
            // Shape B (planner §2.3): { error: { code, message } }
            const inner = body.error;
            if (typeof inner.code === 'string' && inner.code)
                code = inner.code;
            if (typeof inner.message === 'string' && inner.message)
                message = inner.message;
        }
    }
    catch {
        // Non-JSON error body — keep defaults.
    }
    return new ScreenshotError(code, message, res.status);
}
function filenameFromDisposition(value) {
    if (!value)
        return null;
    const match = /filename="?([^"]+)"?/i.exec(value);
    return match?.[1] ?? null;
}
function normalizeFormat(value, fallback) {
    return value === 'png' || value === 'jpeg' ? value : fallback;
}
function toInt(value, fallback) {
    const n = value != null ? Number.parseInt(value, 10) : NaN;
    return Number.isFinite(n) ? n : fallback;
}
//# sourceMappingURL=api.js.map