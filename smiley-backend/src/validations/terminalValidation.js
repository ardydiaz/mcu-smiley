import { z } from 'zod';

const id = z.coerce.number().int().positive().max(2147483647);

export const terminalSchema = z.object({
  locationId: id,
  terminalCode: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  status: z.enum(['active', 'inactive']).default('active'),
}).strict();

export const terminalQuerySchema = z.object({
  locationId: id.optional(),
}).strict();
