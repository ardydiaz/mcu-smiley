import { Router } from 'express';
import { createTerminal, deleteTerminal, listAllTerminals, listTerminals, updateTerminal } from '../controllers/terminalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { terminalQuerySchema, terminalSchema } from '../validations/terminalValidation.js';

const router = Router();
router.get('/', validate(terminalQuerySchema, 'query'), listTerminals);
router.get('/all', authMiddleware, validate(terminalQuerySchema, 'query'), listAllTerminals);
router.post('/', authMiddleware, validate(terminalSchema), createTerminal);
router.put('/:id', authMiddleware, validate(idSchema, 'params'), validate(terminalSchema), updateTerminal);
router.delete('/:id', authMiddleware, validate(idSchema, 'params'), deleteTerminal);

export default router;
