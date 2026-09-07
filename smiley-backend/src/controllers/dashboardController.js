import { getDashboard } from '../services/dashboardService.js';
import { success } from '../utils/response.js';
export async function dashboard(req, res) { return success(res, await getDashboard(req.validated.query)); }
