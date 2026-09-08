import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(''),
  status: z.enum(['active', 'inactive']).default('active'),
}).strict();
