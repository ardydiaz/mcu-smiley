import { Terminal } from '../models/Terminal.js';
import { success, AppError } from '../utils/response.js';

async function validateDuplicateTerminalFields(body, res, excludeId) {
  const duplicates = await Terminal.findDuplicateFields(body, excludeId);
  const errors = [];
  if (duplicates.some(row => row.terminal_code === body.terminalCode)) {
    errors.push({ field: 'terminalCode', message: 'Terminal code already exists' });
  }
  if (duplicates.some(row => row.name === body.name)) {
    errors.push({ field: 'name', message: 'Terminal name already exists' });
  }
  if (!errors.length) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors });
  return true;
}

export async function listTerminals(req, res) {
  return success(res, await Terminal.list(req.validated?.query?.locationId));
}

export async function listAllTerminals(req, res) {
  return success(res, await Terminal.list(req.validated?.query?.locationId, true));
}

export async function createTerminal(req, res) {
  if (await validateDuplicateTerminalFields(req.validated.body, res)) return;
  return success(res, await Terminal.create(req.validated.body), 'Terminal created', 201);
}

export async function updateTerminal(req, res) {
  const { id } = req.validated.params;
  if (!await Terminal.findById(id)) throw new AppError('Terminal not found', 404);
  if (await validateDuplicateTerminalFields(req.validated.body, res, id)) return;
  return success(res, await Terminal.update(id, req.validated.body), 'Terminal updated');
}

export async function deleteTerminal(req, res) {
  const { id } = req.validated.params;
  if (!await Terminal.findById(id)) throw new AppError('Terminal not found', 404);
  await Terminal.deactivate(id);
  return success(res, null, 'Terminal deactivated');
}