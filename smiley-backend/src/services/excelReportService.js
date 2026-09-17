import ExcelJS from 'exceljs';
import { env } from '../config/env.js';

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: env.TEAMS_DIGEST_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export async function buildSadVotesWorkbook(votes, date) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sad Votes ' + date);
  sheet.columns = [
    { header: 'Date/Time', key: 'created_at', width: 24 },
    { header: 'Rating', key: 'rating', width: 16 },
    { header: 'User Type', key: 'user_type', width: 16 },
    { header: 'Department', key: 'department', width: 30 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Terminal', key: 'terminal', width: 24 },
    { header: 'Feedback', key: 'feedback', width: 50 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const vote of votes) {
    sheet.addRow({
      created_at: formatDateTime(vote.created_at),
      rating: vote.rating,
      user_type: vote.user_type,
      department: vote.department || '',
      location: vote.location || '',
      terminal: vote.terminal || vote.terminal_code || '',
      feedback: vote.feedback || '',
    });
  }
  return workbook.xlsx.writeBuffer();
}
