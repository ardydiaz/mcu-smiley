import { z } from 'zod';
import { allPermissionKeys } from '../config/menuPermissions.js';
export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(1).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password exceeds 72 bytes'),
}).strict();

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(12).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password exceeds 72 bytes'),
}).strict();

export const userAccessSchema = z.object({
  role: z.enum(['admin', 'user']),
  status: z.enum(['active', 'inactive', 'pending']),
  permissions: z.array(z.enum(allPermissionKeys)).default([]),
}).strict().superRefine((value, context) => {
  if (value.role === 'user' && value.status === 'active' && value.permissions.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['permissions'],
      message: 'Select at least one menu for user access',
    });
  }
});
