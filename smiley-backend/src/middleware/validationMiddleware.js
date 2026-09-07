import { z } from 'zod';
export const idSchema = z.object({ id: z.coerce.number().int().positive().max(2147483647) });
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return res.status(400).json({
      success: false, message: 'Validation failed',
      errors: result.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
    });
    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
}
