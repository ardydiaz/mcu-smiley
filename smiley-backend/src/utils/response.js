export function success(res, data, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, message, data });
}
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
