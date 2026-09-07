import { Router } from 'express';
import { dashboard } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { filterSchema } from '../validations/voteValidation.js';
const router = Router();
router.get('/', authMiddleware, validate(filterSchema, 'query'), dashboard);
export default router;
