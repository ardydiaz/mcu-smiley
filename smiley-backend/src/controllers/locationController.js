import { Location } from '../models/Location.js';
import { success, AppError } from '../utils/response.js';

export async function listLocations(req, res) {
  return success(res, await Location.list());
}

export async function listAllLocations(req, res) {
  return success(res, await Location.list(true));
}

export async function createLocation(req, res) {
  return success(res, await Location.create(req.validated.body), 'Location created', 201);
}

export async function updateLocation(req, res) {
  const { id } = req.validated.params;
  if (!await Location.findById(id)) throw new AppError('Location not found', 404);
  return success(res, await Location.update(id, req.validated.body), 'Location updated');
}

export async function deleteLocation(req, res) {
  const { id } = req.validated.params;
  if (!await Location.findById(id)) throw new AppError('Location not found', 404);
  await Location.deactivate(id);
  return success(res, null, 'Location deactivated');
}
