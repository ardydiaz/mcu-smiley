import { Terminal } from '../models/Terminal.js';
import { success, AppError } from '../utils/response.js';

export async function listTerminals(req, res) {
  return success(res, await Terminal.list(req.validated?.query?.locationId));
}

export async function listAllTerminals(req, res) {
  return success(res, await Terminal.list(req.validated?.query?.locationId, true));
}

export async function createTerminal(req, res) {
  return success(res, await Terminal.create(req.validated.body), 'Terminal created', 201);
}

export async function updateTerminal(req, res) {
  const { id } = req.validated.params;
  if (!await Terminal.findById(id)) throw new AppError('Terminal not found', 404);
  return success(res, await Terminal.update(id, req.validated.body), 'Terminal updated');
}

export async function deleteTerminal(req, res) {
  const { id } = req.validated.params;
  if (!await Terminal.findById(id)) throw new AppError('Terminal not found', 404);
  await Terminal.deactivate(id);
  return success(res, null, 'Terminal deactivated');
}
