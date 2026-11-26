import { z } from 'zod';
const date = z.iso.date();
export const auditLogQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  entityType: z.string().trim().max(50).optional(),
  action: z.string().trim().max(50).optional(),
  userId: z.coerce.number().int().positive().max(2147483647).optional(),
  from: date.optional(),
  to: date.optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict().refine(v => !v.from || !v.to || v.from <= v.to, { message: 'from must be on or before to', path: ['to'] });
