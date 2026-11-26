import { AuditLog } from '../models/AuditLog.js';
import { success } from '../utils/response.js';

export async function listAuditLogs(req, res) {
  return success(res, await AuditLog.list(req.validated.query));
}
