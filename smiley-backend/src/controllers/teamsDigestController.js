import { getSadVotes, verifyDigestDownloadToken } from '../services/teamsDigestService.js';
import { buildSadVotesWorkbook } from '../services/excelReportService.js';

export async function downloadTeamsDigestExcel(req, res) {
  let payload;
  try {
    payload = verifyDigestDownloadToken(String(req.query.token || ''));
    if (!payload.from || !payload.to) throw new Error('Link predates the rolling digest window');
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired download link' });
  }
  const votes = await getSadVotes(new Date(payload.from), new Date(payload.to));
  const buffer = await buildSadVotesWorkbook(votes, payload.date);
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="smiley-sad-votes-${payload.date}.xlsx"`,
  });
  return res.send(buffer);
}
