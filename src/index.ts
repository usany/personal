import { app } from './app.js';
import { PORT } from './config.js';
import { closeBrowser } from './services/screenshotService.js';

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`URL Screenshot server listening on http://127.0.0.1:${PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received — shutting down.`);
  await closeBrowser();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
