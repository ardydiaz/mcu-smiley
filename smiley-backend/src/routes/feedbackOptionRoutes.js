import { Router } from 'express';
import { createFeedbackOption, deleteFeedbackOption, listAllFeedbackOptions, listFeedbackOptions, updateFeedbackOption } from '../controllers/feedbackOptionController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditLogMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { feedbackOptionQuerySchema, feedbackOptionSchema } from '../validations/feedbackOptionValidation.js';

const router = Router();
const requireRatingsAccess = [requireAuth, requirePermission('ratings')];
router.get('/', validate(feedbackOptionQuerySchema, 'query'), listFeedbackOptions);
router.get('/all', ...requireRatingsAccess, validate(feedbackOptionQuerySchema, 'query'), listAllFeedbackOptions);
router.post('/', ...requireRatingsAccess, auditLog('ratings'), validate(feedbackOptionSchema), createFeedbackOption);
router.put('/:id', ...requireRatingsAccess, auditLog('ratings'), validate(idSchema, 'params'), validate(feedbackOptionSchema), updateFeedbackOption);
router.delete('/:id', ...requireRatingsAccess, auditLog('ratings'), validate(idSchema, 'params'), deleteFeedbackOption);
export default router;
