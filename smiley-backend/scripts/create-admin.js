import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../src/models/User.js';
import { pool } from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

try {
  const admin = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
    password: z.string().min(12).refine(v => Buffer.byteLength(v, 'utf8') <= 72),
  }).safeParse({ name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  if (!admin.success) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (12 characters minimum, 72 UTF-8 bytes maximum)');
  await User.create({ name: admin.data.name, email: admin.data.email, passwordHash: await bcrypt.hash(admin.data.password, 12) });
  logger.info('Administrator created');
} catch (error) {
  logger.error(error.code ? 'Admin creation failed: ' + error.code : error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
