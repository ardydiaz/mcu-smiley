import { Router } from 'express';
import {
  createTerminalAssignment,
  deleteTerminalAssignment,
  listTerminalAssignments,
  updateTerminalAssignment,
} from '../controllers/terminalAssignmentController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { terminalAssignmentQuerySchema, terminalAssignmentSchema } from '../validations/terminalAssignmentValidation.js';

const router = Router();
const requireTerminalDepartmentsAccess = [requireAuth, requirePermission('terminal-departments')];

router.get('/', ...requireTerminalDepartmentsAccess, validate(terminalAssignmentQuerySchema, 'query'), listTerminalAssignments);
router.post('/', ...requireTerminalDepartmentsAccess, validate(terminalAssignmentSchema), createTerminalAssignment);
router.put('/:id', ...requireTerminalDepartmentsAccess, validate(idSchema, 'params'), validate(terminalAssignmentSchema), updateTerminalAssignment);
router.delete('/:id', ...requireTerminalDepartmentsAccess, validate(idSchema, 'params'), deleteTerminalAssignment);

export default router;
