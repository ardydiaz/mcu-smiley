import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().trim().min(1, 'Location name is required').max(100, 'Location name must be 100 characters or fewer'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description must be 500 characters or fewer'),
  status: z.enum(['active', 'inactive']).default('active'),
}).strict();