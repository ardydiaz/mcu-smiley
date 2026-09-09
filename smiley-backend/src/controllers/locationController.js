import { Location } from '../models/Location.js';
import { success, AppError } from '../utils/response.js';

function duplicateLocationName(res) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: [{ field: 'name', message: 'Location name already exists' }],
  });
}

export async function listLocations(req, res) {
  return success(res, await Location.list());
}

export async function listAllLocations(req, res) {
  return success(res, await Location.list(true));
}

export async function createLocation(req, res) {
  if (await Location.findDuplicateName(req.validated.body.name)) return duplicateLocationName(res);
  return success(res, await Location.create(req.validated.body), 'Location created', 201);
}

export async function updateLocation(req, res) {
  const { id } = req.validated.params;
  if (!await Location.findById(id)) throw new AppError('Location not found', 404);
  if (await Location.findDuplicateName(req.validated.body.name, id)) return duplicateLocationName(res);
  return success(res, await Location.update(id, req.validated.body), 'Location updated');
}

export async function deleteLocation(req, res) {
  const { id } = req.validated.params;
  if (!await Location.findById(id)) throw new AppError('Location not found', 404);
  await Location.deactivate(id);
  return success(res, null, 'Location deactivated');
}