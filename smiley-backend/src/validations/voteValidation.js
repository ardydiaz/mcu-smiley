import { z } from 'zod';
const id = z.number().int().positive().max(2147483647);
export const voteSchema = z.object({
  ratingId: id,
  departmentId: id,
  serviceId: id.optional(),
  locationId: id.optional(),
  feedback: z.string().trim().max(2000).default(''),
  terminalId: id.optional(),
}).strict();
const date = z.iso.date();
export const filterSchema = z.object({
  from: date.optional(),
  to: date.optional(),
  departmentId: z.coerce.number().int().positive().max(2147483647).optional(),
  serviceId: z.coerce.number().int().positive().max(2147483647).optional(),
  locationId: z.coerce.number().int().positive().max(2147483647).optional(),
  terminalId: z.coerce.number().int().positive().max(2147483647).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict().refine(v => !v.from || !v.to || v.from <= v.to, { message: 'from must be on or before to', path: ['to'] });
