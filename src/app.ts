import express, { type Express } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { presetsRouter } from './routes/presets.js';
import { screenshotRouter } from './routes/screenshot.js';

/**
 * Builds the Express app WITHOUT calling listen(), so tests (and src/index.ts)
 * can import it. src/index.ts owns the listen() call.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  // API routes
  app.use('/api/health', healthRouter);
  app.use('/api/presets', presetsRouter);
  app.use('/api/screenshot', screenshotRouter);

  // Static UI (client-side-writer owns public/). Served at the app origin so the
  // screenshot service can capture the app's own page deterministically.
  const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
  app.use(express.static(publicDir));

  // Fallback for "/" so the capture target always returns 200, even before the
  // client-side-writer has produced public/index.html.
  app.get('/', (_req, res) => {
    res
      .status(200)
      .type('html')
      .send(
        '<!doctype html><html lang="en"><head><meta charset="utf-8" />' +
          '<title>URL Screenshot</title></head><body style="margin:0;background:#0f172a;' +
          'color:#f8fafc;font-family:monospace;display:flex;align-items:center;' +
          'justify-content:center;min-height:100vh"><div>URL Screenshot service ready</div>' +
          '</body></html>',
      );
  });

  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
