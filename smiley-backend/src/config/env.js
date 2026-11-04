import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
const booleanEnv = z.preprocess(
  value => value === undefined ? 'false' : String(value).toLowerCase(),
  z.enum(['true', 'false']).transform(value => value === 'true'),
);
const optionalString = z.preprocess(value => String(value || '').trim() || undefined, z.string().optional());
const optionalUrl = z.preprocess(value => String(value || '').trim() || undefined, z.string().url().optional());
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
  KIOSK_JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/).default('400d'),
  ALLOW_ADMIN_REGISTRATION: booleanEnv.default(false),
  FRONTEND_URL: optionalUrl,
  SSO_ENABLED: booleanEnv.default(false),
  SSO_PROVIDER_NAME: z.string().default('SSO'),
  SSO_AUTHORIZATION_URL: optionalUrl,
  SSO_TOKEN_URL: optionalUrl,
  SSO_USERINFO_URL: optionalUrl,
  SSO_CLIENT_ID: optionalString,
  SSO_CLIENT_SECRET: optionalString,
  SSO_REDIRECT_URI: optionalUrl,
  SSO_SCOPES: z.string().default('openid email profile'),
  AZURE_CLIENT_ID: optionalString,
  AZURE_CLIENT_SECRET: optionalString,
  AZURE_TENANT_ID: optionalString,
  AZURE_REDIRECT_URI: optionalUrl,
  TEAMS_SMILEY_WEBHOOK_URL: optionalUrl,
  TEAMS_DIGEST_CRON: z.string().default('45 14 * * *'),
  TEAMS_DIGEST_TIMEZONE: z.string().default('Asia/Manila'),
  PUBLIC_API_BASE_URL: optionalUrl,
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
