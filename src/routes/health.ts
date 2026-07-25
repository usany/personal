import { Router } from 'express';

/**
 * GET /api/health -> 200 { status: "ok" }
 * Contract: tests/integration/health.spec.ts asserts the body EQUALS
 * { status: "ok" } exactly — no extra fields.
 */
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
