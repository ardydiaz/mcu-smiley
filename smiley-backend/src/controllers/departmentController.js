import { Department } from '../models/Department.js';
import { success, AppError } from '../utils/response.js';

function duplicateDepartmentName(res) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: [{ field: 'name', message: 'Department name already exists' }],
  });
}

export async function listDepartments(req, res) { return success(res, await Department.list()); }
export async function listAllDepartments(req, res) { return success(res, await Department.list(true)); }

export async function createDepartment(req, res) {
  if (await Department.findDuplicateName(req.validated.body.name)) return duplicateDepartmentName(res);
  return success(res, await Department.create(req.validated.body), 'Department created', 201);
}

export async function updateDepartment(req, res) {
  const { id } = req.validated.params;
  if (!await Department.findById(id)) throw new AppError('Department not found', 404);
  if (await Department.findDuplicateName(req.validated.body.name, id)) return duplicateDepartmentName(res);
  return success(res, await Department.update(id, req.validated.body), 'Department updated');
}

export async function deleteDepartment(req, res) {
  const { id } = req.validated.params;
  if (!await Department.findById(id)) throw new AppError('Department not found', 404);
  await Department.deactivate(id);
  return success(res, null, 'Department deactivated');
}