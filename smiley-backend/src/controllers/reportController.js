import { getReport, toCsv } from '../services/reportService.js';
import { success } from '../utils/response.js';
export async function report(req, res) { return success(res, await getReport(req.validated.query)); }
export async function exportCsv(req, res) {
  const result = await getReport(req.validated.query);
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="smiley-votes.csv"', 'X-Total-Count': String(result.total) });
  return res.send(toCsv(result.items));
}
