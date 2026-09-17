import { getReport, getReportExport, toCsv } from '../services/reportService.js';
import { sendDailySadVotesDigest } from '../services/teamsDigestService.js';
import { success } from '../utils/response.js';

export async function report(req, res) { return success(res, await getReport(req.validated.query)); }

export async function exportCsv(req, res) {
  const items = await getReportExport(req.validated.query);
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="smiley-votes.csv"', 'X-Total-Count': String(items.length) });
  return res.send(toCsv(items));
}

export async function sendTeamsDigestNow(req, res) { return success(res, await sendDailySadVotesDigest(), 'Teams digest triggered'); }
