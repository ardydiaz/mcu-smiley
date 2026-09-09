import { z } from 'zod';
const status = z.enum(['active', 'inactive']);
export const departmentSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(100, 'Department name must be 100 characters or fewer'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description must be 500 characters or fewer'),
  active: z.boolean().default(true),
  status: status.optional(),
}).strict();
