import { Router } from 'express';
import {
  createTerminalAssignment,
  deleteTerminalAssignment,
  listTerminalAssignments,
  updateTerminalAssignment,
} from '../controllers/terminalAssignmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { terminalAssignmentQuerySchema, terminalAssignmentSchema } from '../validations/terminalAssignmentValidation.js';

const router = Router();

router.get('/', authMiddleware, validate(terminalAssignmentQuerySchema, 'query'), listTerminalAssignments);
router.post('/', authMiddleware, validate(terminalAssignmentSchema), createTerminalAssignment);
router.put('/:id', authMiddleware, validate(idSchema, 'params'), validate(terminalAssignmentSchema), updateTerminalAssignment);
router.delete('/:id', authMiddleware, validate(idSchema, 'params'), deleteTerminalAssignment);

export default router;
