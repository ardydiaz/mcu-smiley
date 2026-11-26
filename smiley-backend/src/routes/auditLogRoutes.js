import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditLogController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { auditLogQuerySchema } from '../validations/auditLogValidation.js';

const router = Router();
router.get('/', requireAuth, requirePermission('audit-logs'), validate(auditLogQuerySchema, 'query'), listAuditLogs);
export default router;
