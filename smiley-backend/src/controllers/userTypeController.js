import { UserType } from '../models/UserType.js';
import { success } from '../utils/response.js';

export async function listUserTypes(req, res) {
  return success(res, await UserType.list());
}
