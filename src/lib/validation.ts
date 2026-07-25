import { AppError } from './AppError.js';
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  type ImageFormat,
  MAX_HEIGHT,
  MAX_URL_LENGTH,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
  SUPPORTED_FORMATS,
} from '../config.js';

/**
 * Validated, normalized screenshot request.
 * Contract source: tests/integration/validation.spec.ts + screenshot.api.spec.ts.
 */
export interface ScreenshotRequest {
  url: string;
  width: number;
  height: number;
  format: ImageFormat;
  fullPage: boolean;
  responseType: 'binary' | 'base64';
}

/** url must be a non-empty http(s) URL (<= 2048 chars). Anything else -> INVALID_URL. */
function validateUrl(raw: unknown): string {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new AppError(400, 'INVALID_URL', 'url must be a non-empty http(s) URL');
  }
  if (raw.length > MAX_URL_LENGTH) {
    throw new AppError(400, 'INVALID_URL', `url must be <= ${MAX_URL_LENGTH} characters`);
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new AppError(400, 'INVALID_URL', 'url is not a valid URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AppError(400, 'INVALID_URL', 'url must use the http or https protocol');
  }
  return raw;
}

/** width/height must be integers within bounds. Anything else -> INVALID_DIMENSIONS. */
function validateDimension(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  label: string,
): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new AppError(400, 'INVALID_DIMENSIONS', `${label} must be an integer`);
  }
  if (value < min || value > max) {
    throw new AppError(
      400,
      'INVALID_DIMENSIONS',
      `${label} must be between ${min} and ${max}`,
    );
  }
  return value;
}

/** format must be one of the supported types. Anything else -> INVALID_FORMAT. */
function validateFormat(raw: unknown): ImageFormat {
  if (raw === undefined || raw === null) return 'png';
  if (typeof raw !== 'string' || !SUPPORTED_FORMATS.includes(raw as ImageFormat)) {
    throw new AppError(
      400,
      'INVALID_FORMAT',
      `format must be one of: ${SUPPORTED_FORMATS.join(', ')}`,
    );
  }
  return raw as ImageFormat;
}

function validateResponseType(raw: unknown): 'binary' | 'base64' {
  if (raw === undefined || raw === null) return 'binary';
  if (raw === 'binary' || raw === 'base64') return raw;
  throw new AppError(400, 'INVALID_FORMAT', 'responseType must be "binary" or "base64"');
}

/**
 * Validate + normalize the raw POST body. Throws AppError with the exact
 * status/code the integration tests assert on. Order: url -> dimensions -> format.
 */
export function validateScreenshotRequest(body: unknown): ScreenshotRequest {
  const raw = (body ?? {}) as Record<string, unknown>;

  const url = validateUrl(raw.url);
  const width = validateDimension(raw.width, DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH, 'width');
  const height = validateDimension(raw.height, DEFAULT_HEIGHT, MIN_HEIGHT, MAX_HEIGHT, 'height');
  const format = validateFormat(raw.format);
  const responseType = validateResponseType(raw.responseType);
  const fullPage = raw.fullPage === true;

  return { url, width, height, format, fullPage, responseType };
}
