import { AppError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function notFound(req, res, next) {
  next(new AppError('Route not found', 404));
}
export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err instanceof AppError ? err.status : 500;
  let message = err instanceof AppError ? err.message : 'Internal server error';
  if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON body'; }
  if (err.type === 'entity.too.large') { status = 413; message = 'Request body too large'; }
  if (err.code === 'ER_DUP_ENTRY') { status = 409; message = 'A record with this value already exists'; }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') { status = 400; message = 'Referenced record does not exist'; }
  if (status === 500) logger.error('Request failed: ' + (err.code || err.name));
  res.status(status).json({ success: false, message });
}
