import { Router } from 'express';
import {
  createTerminalAssignment,
  deleteTerminalAssignment,
  listTerminalAssignments,
  updateTerminalAssignment,
} from '../controllers/terminalAssignmentController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditLogMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { terminalAssignmentQuerySchema, terminalAssignmentSchema } from '../validations/terminalAssignmentValidation.js';

const router = Router();
const requireTerminalDepartmentsAccess = [requireAuth, requirePermission('terminal-departments')];

router.get('/', ...requireTerminalDepartmentsAccess, validate(terminalAssignmentQuerySchema, 'query'), listTerminalAssignments);
router.post('/', ...requireTerminalDepartmentsAccess, auditLog('terminal-departments'), validate(terminalAssignmentSchema), createTerminalAssignment);
router.put('/:id', ...requireTerminalDepartmentsAccess, auditLog('terminal-departments'), validate(idSchema, 'params'), validate(terminalAssignmentSchema), updateTerminalAssignment);
router.delete('/:id', ...requireTerminalDepartmentsAccess, auditLog('terminal-departments'), validate(idSchema, 'params'), deleteTerminalAssignment);

export default router;
