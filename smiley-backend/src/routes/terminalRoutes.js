import { Router } from 'express';
import { createTerminal, deleteTerminal, listAllTerminals, listTerminals, releaseTerminalReservation, updateTerminal } from '../controllers/terminalController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditLogMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { terminalQuerySchema, terminalSchema } from '../validations/terminalValidation.js';

const router = Router();
const requireTerminalsAccess = [requireAuth, requirePermission('terminals')];
router.get('/', validate(terminalQuerySchema, 'query'), listTerminals);
router.get('/all', ...requireTerminalsAccess, validate(terminalQuerySchema, 'query'), listAllTerminals);
router.post('/', ...requireTerminalsAccess, auditLog('terminals'), validate(terminalSchema), createTerminal);
router.put('/:id', ...requireTerminalsAccess, auditLog('terminals'), validate(idSchema, 'params'), validate(terminalSchema), updateTerminal);
router.delete('/:id', ...requireTerminalsAccess, auditLog('terminals'), validate(idSchema, 'params'), deleteTerminal);
router.post('/:id/release-reservation', ...requireTerminalsAccess, auditLog('terminals'), validate(idSchema, 'params'), releaseTerminalReservation);

export default router;
