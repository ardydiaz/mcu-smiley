import { z } from 'zod';
const id = z.number().int().positive().max(2147483647);
export const voteSchema = z.object({
  ratingId: id,
  userTypeId: id,
  terminalCode: z.string().trim().min(1, 'Terminal code is required').max(50),
  feedback: z.string().trim().min(1, 'Feedback is required').max(2000),
}).strict();
const date = z.iso.date();
export const filterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  from: date.optional(),
  to: date.optional(),
  ratingId: z.coerce.number().int().positive().max(2147483647).optional(),
  departmentId: z.coerce.number().int().positive().max(2147483647).optional(),
  userTypeId: z.coerce.number().int().positive().max(2147483647).optional(),
  locationId: z.coerce.number().int().positive().max(2147483647).optional(),
  terminalId: z.coerce.number().int().positive().max(2147483647).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict().refine(v => !v.from || !v.to || v.from <= v.to, { message: 'from must be on or before to', path: ['to'] });
