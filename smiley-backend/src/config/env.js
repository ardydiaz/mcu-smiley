import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
const booleanEnv = z.preprocess(
  value => value === undefined ? 'false' : String(value).toLowerCase(),
  z.enum(['true', 'false']).transform(value => value === 'true'),
);
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().regex(/^[a-zA-Z0-9_]+$/).default('smiley_face'),
  JWT_SECRET: z.string().default(''),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/).default('8h'),
  ALLOW_ADMIN_REGISTRATION: booleanEnv.default(false),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error('Invalid environment configuration: ' + parsed.error.issues.map(i => i.path.join('.') + ': ' + i.message).join('; '));
}
const authOptionalScript = /scripts[\\/](migrate|init-db|create-admin)\.js$/.test(process.argv[1] || '');
if (parsed.data.NODE_ENV !== 'test' && !authOptionalScript && (parsed.data.JWT_SECRET.length < 32 || parsed.data.JWT_SECRET.startsWith('replace-'))) {
  throw new Error('Invalid environment configuration: JWT_SECRET: Set a random JWT secret');
}
export const env = parsed.data;
