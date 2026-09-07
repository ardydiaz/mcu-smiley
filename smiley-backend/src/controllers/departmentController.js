import { Department } from '../models/Department.js';
import { success, AppError } from '../utils/response.js';
export async function listDepartments(req, res) { return success(res, await Department.list()); }
export async function listAllDepartments(req, res) { return success(res, await Department.list(true)); }
export async function createDepartment(req, res) { return success(res, await Department.create(req.validated.body), 'Department created', 201); }
export async function updateDepartment(req, res) {
  const { id } = req.validated.params;
  if (!await Department.findById(id)) throw new AppError('Department not found', 404);
  return success(res, await Department.update(id, req.validated.body), 'Department updated');
}
export async function deleteDepartment(req, res) {
  const { id } = req.validated.params;
  if (!await Department.findById(id)) throw new AppError('Department not found', 404);
  await Department.deactivate(id);
  return success(res, null, 'Department deactivated');
}
