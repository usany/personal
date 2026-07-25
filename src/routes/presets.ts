import { Router } from 'express';
import { DEFAULT_PRESET, PRESETS } from '../config.js';

/**
 * GET /api/presets -> 200 { presets: [...], default: "desktop" }
 * Populates width/height defaults in the UI.
 */
export const presetsRouter = Router();

presetsRouter.get('/', (_req, res) => {
  res.status(200).json({ presets: PRESETS, default: DEFAULT_PRESET });
});
