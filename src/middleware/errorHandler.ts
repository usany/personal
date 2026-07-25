import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/AppError.js';

/**
 * Converts thrown errors into the contract error shape:
 *   application/json  { error: string, code: string }
 * with the exact HTTP status. (tests/integration/helpers.ts::expectErrorShape)
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({ error: message || 'Internal server error', code: 'INTERNAL_ERROR' });
}

/** Wraps async route handlers so thrown/rejected errors reach errorHandler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
