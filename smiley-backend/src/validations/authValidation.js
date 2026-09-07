import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(1).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password exceeds 72 bytes'),
}).strict();

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(12).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password exceeds 72 bytes'),
}).strict();
