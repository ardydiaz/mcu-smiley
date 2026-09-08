import { z } from 'zod';

const id = z.coerce.number().int().positive().max(2147483647);

export const terminalAssignmentSchema = z.object({
  terminalId: id,
  departmentId: id,
}).strict();

export const terminalAssignmentQuerySchema = z.object({
  terminalId: id.optional(),
  departmentId: id.optional(),
}).strict();
