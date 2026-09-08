import { TerminalDepartmentAssignment } from '../models/TerminalDepartmentAssignment.js';
import { success, AppError } from '../utils/response.js';

export async function listTerminalAssignments(req, res) {
  return success(res, await TerminalDepartmentAssignment.list(req.validated?.query));
}

export async function createTerminalAssignment(req, res) {
  return success(res, await TerminalDepartmentAssignment.create(req.validated.body), 'Terminal assignment created', 201);
}

export async function updateTerminalAssignment(req, res) {
  const { id } = req.validated.params;
  if (!await TerminalDepartmentAssignment.findById(id)) throw new AppError('Terminal assignment not found', 404);
  return success(res, await TerminalDepartmentAssignment.update(id, req.validated.body), 'Terminal assignment updated');
}

export async function deleteTerminalAssignment(req, res) {
  const { id } = req.validated.params;
  if (!await TerminalDepartmentAssignment.findById(id)) throw new AppError('Terminal assignment not found', 404);
  await TerminalDepartmentAssignment.delete(id);
  return success(res, null, 'Terminal assignment deleted');
}
