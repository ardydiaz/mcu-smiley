import { Router } from 'express';
import { createLocation, deleteLocation, listAllLocations, listLocations, updateLocation } from '../controllers/locationController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditLogMiddleware.js';
import { validate, idSchema } from '../middleware/validationMiddleware.js';
import { locationSchema } from '../validations/locationValidation.js';

const router = Router();
const requireLocationsAccess = [requireAuth, requirePermission('locations')];

router.get('/', listLocations);
router.get('/all', ...requireLocationsAccess, listAllLocations);
router.post('/', ...requireLocationsAccess, auditLog('locations'), validate(locationSchema), createLocation);
router.put('/:id', ...requireLocationsAccess, auditLog('locations'), validate(idSchema, 'params'), validate(locationSchema), updateLocation);
router.delete('/:id', ...requireLocationsAccess, auditLog('locations'), validate(idSchema, 'params'), deleteLocation);

export default router;
