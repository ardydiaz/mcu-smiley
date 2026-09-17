import { getSadVotes, verifyDigestDownloadToken } from '../services/teamsDigestService.js';
import { buildSadVotesWorkbook } from '../services/excelReportService.js';

export async function downloadTeamsDigestExcel(req, res) {
  let payload;
  try {
    payload = verifyDigestDownloadToken(String(req.query.token || ''));
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired download link' });
  }
  const votes = await getSadVotes(payload.date);
  const buffer = await buildSadVotesWorkbook(votes, payload.date);
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="smiley-sad-votes-${payload.date}.xlsx"`,
  });
  return res.send(buffer);
}
