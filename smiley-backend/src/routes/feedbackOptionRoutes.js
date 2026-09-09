import { Router } from 'express';
import { createFeedbackOption, deleteFeedbackOption, listAllFeedbackOptions, listFeedbackOptions, updateFeedbackOption } from '../controllers/feedbackOptionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { feedbackOptionQuerySchema, feedbackOptionSchema } from '../validations/feedbackOptionValidation.js';

const router = Router();
router.get('/', validate(feedbackOptionQuerySchema, 'query'), listFeedbackOptions);
router.get('/all', authMiddleware, validate(feedbackOptionQuerySchema, 'query'), listAllFeedbackOptions);
router.post('/', authMiddleware, validate(feedbackOptionSchema), createFeedbackOption);
router.put('/:id', authMiddleware, validate(idSchema, 'params'), validate(feedbackOptionSchema), updateFeedbackOption);
router.delete('/:id', authMiddleware, validate(idSchema, 'params'), deleteFeedbackOption);
export default router;