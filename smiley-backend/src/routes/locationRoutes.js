import { Router } from 'express';
import { createLocation, deleteLocation, listAllLocations, listLocations, updateLocation } from '../controllers/locationController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { locationSchema } from '../validations/locationValidation.js';

const router = Router();
const requireLocationsAccess = [requireAuth, requirePermission('locations')];

router.get('/', listLocations);
router.get('/all', ...requireLocationsAccess, listAllLocations);
router.post('/', ...requireLocationsAccess, validate(locationSchema), createLocation);
router.put('/:id', ...requireLocationsAccess, validate(idSchema, 'params'), validate(locationSchema), updateLocation);
router.delete('/:id', ...requireLocationsAccess, validate(idSchema, 'params'), deleteLocation);

export default router;
