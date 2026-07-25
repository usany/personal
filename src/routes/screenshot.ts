import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { captureScreenshot } from '../services/screenshotService.js';
import { validateScreenshotRequest } from '../lib/validation.js';

/**
 * POST /api/screenshot
 * Success (binary): 200, raw image body + X-Screenshot-* headers.
 * Success (base64): 200 JSON { format, width, height, mime, dataUrl, bytes }.
 * Errors: JSON { error, code } with the contract status/code pairing.
 */
export const screenshotRouter = Router();

screenshotRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const params = validateScreenshotRequest(req.body);

    const result = await captureScreenshot({
      url: params.url,
      width: params.width,
      height: params.height,
      format: params.format,
      fullPage: params.fullPage,
    });

    if (params.responseType === 'base64') {
      res.status(200).json({
        format: result.format,
        width: result.width,
        height: result.height,
        mime: result.mime,
        dataUrl: `data:${result.mime};base64,${result.buffer.toString('base64')}`,
        bytes: result.buffer.length,
      });
      return;
    }

    res.setHeader('Content-Type', result.mime);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="screenshot-${result.width}x${result.height}.${result.ext}"`,
    );
    res.setHeader('X-Screenshot-Width', String(result.width));
    res.setHeader('X-Screenshot-Height', String(result.height));
    res.setHeader('X-Screenshot-Format', result.format);
    res.setHeader('X-Screenshot-Duration-Ms', String(result.durationMs));
    res.status(200).send(result.buffer);
  }),
);
