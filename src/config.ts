/**
 * Central configuration + contract constants.
 * Source of truth: tests/integration/*.spec.ts (the authoritative contract).
 */

export const PORT = Number(process.env.PORT ?? 3000);

/** Default viewport when width/height are omitted (contract: screenshot.api.spec.ts). */
export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;

/** Dimension bounds (contract: validation.spec.ts — 3840 / 4320 are the maxima). */
export const MIN_WIDTH = 1;
export const MAX_WIDTH = 3840;
export const MIN_HEIGHT = 1;
export const MAX_HEIGHT = 4320;

/** Navigation / capture timeout in milliseconds. */
export const CAPTURE_TIMEOUT_MS = 30_000;

/** Max URL length. */
export const MAX_URL_LENGTH = 2048;

export type ImageFormat = 'png' | 'jpeg';
export const SUPPORTED_FORMATS: ImageFormat[] = ['png', 'jpeg'];

/** Device presets for the UI (GET /api/presets). */
export const PRESETS = [
  { id: 'desktop', label: 'Desktop', width: 1920, height: 1080 },
  { id: 'laptop', label: 'Laptop', width: 1366, height: 768 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const;

export const DEFAULT_PRESET = 'desktop';
