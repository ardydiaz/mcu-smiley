import { z } from 'zod';

const id = z.coerce.number().int().positive().max(2147483647);
const status = z.enum(['active', 'inactive']);

export const feedbackOptionSchema = z.object({
  ratingId: id,
  label: z.string().trim().min(1, 'Feedback option is required').max(150, 'Feedback option must be 150 characters or fewer'),
  requiresText: z.boolean().default(false),
  status: status.default('active'),
}).strict();

export const feedbackOptionQuerySchema = z.object({
  ratingId: id.optional(),
}).strict();