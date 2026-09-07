import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { logger } from './utils/logger.js';

try {
  await pool.query('SELECT 1');
  const server = app.listen(env.PORT, () => logger.info('Smiley API listening on port ' + env.PORT));
  server.on('error', async error => {
    logger.error('Server failed: ' + error.code);
    await pool.end();
    process.exitCode = 1;
  });
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    logger.info('Shutting down');
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => { await pool.end(); clearTimeout(timeout); });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  logger.error('Database connection failed: ' + (error.code || error.name));
  await pool.end();
  process.exitCode = 1;
}
