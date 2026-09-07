import { z } from 'zod';
const status = z.enum(['active', 'inactive']);
export const departmentSchema = z.object({
  code: z.string().trim().min(1).max(50).nullable().optional(),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(''),
  active: z.boolean().default(true),
  status: status.optional(),
}).strict();
