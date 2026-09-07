import { Router } from 'express';
import { listRatings } from '../controllers/ratingController.js';
const router = Router();
router.get('/', listRatings);
export default router;
