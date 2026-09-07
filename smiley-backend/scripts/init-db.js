import { pool } from '../src/config/database.js';
import { runMigrations } from './migrate.js';
import { logger } from '../src/utils/logger.js';

try {
  await runMigrations();
  logger.info('Database initialized');
} catch (error) {
  logger.error('Database initialization failed: ' + (error.code || error.name));
  process.exitCode = 1;
} finally {
  await pool.end();
}
