import { z } from 'zod';

const id = z.coerce.number().int('Location is required').positive('Location is required').max(2147483647);

export const terminalSchema = z.object({
  locationId: id,
  terminalCode: z.string().trim().min(1, 'Terminal code is required').max(50, 'Terminal code must be 50 characters or fewer'),
  name: z.string().trim().min(1, 'Terminal name is required').max(100, 'Terminal name must be 100 characters or fewer'),
  status: z.enum(['active', 'inactive']).default('active'),
}).strict();

export const terminalQuerySchema = z.object({
  locationId: id.optional(),
}).strict();