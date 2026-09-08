import { Router } from 'express';
import { createLocation, deleteLocation, listAllLocations, listLocations, updateLocation } from '../controllers/locationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { locationSchema } from '../validations/locationValidation.js';

const router = Router();

router.get('/', listLocations);
router.get('/all', authMiddleware, listAllLocations);
router.post('/', authMiddleware, validate(locationSchema), createLocation);
router.put('/:id', authMiddleware, validate(idSchema, 'params'), validate(locationSchema), updateLocation);
router.delete('/:id', authMiddleware, validate(idSchema, 'params'), deleteLocation);

export default router;
