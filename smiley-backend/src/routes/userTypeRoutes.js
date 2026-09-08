import { Router } from 'express';
import { listUserTypes } from '../controllers/userTypeController.js';

const router = Router();

router.get('/', listUserTypes);

export default router;
