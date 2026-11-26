import { Vote } from '../models/Vote.js';
import { env } from '../config/env.js';

function formatCsvDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString('en-US', {
    timeZone: env.TEAMS_DIGEST_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export async function getReport(filters) {
  const [list, summary] = await Promise.all([
    Vote.list(filters),
    Vote.summary(filters),
  ]);

  return { ...list, summary };
}

export async function getReportExport(filters) {
  const result = await Vote.list({ ...filters, page: 1, limit: 100000 });
  return result.items;
}

export function toCsv(items) {
  const rows = [['Date', 'Rating', 'Score', 'User Type', 'Department', 'Location', 'Terminal Code', 'Tablet Name', 'Feedback Options', 'Feedback']];
  for (const row of items) rows.push([formatCsvDate(row.created_at), row.rating, row.score, row.user_type, row.department, row.location, row.terminal_code, row.terminal, row.feedback_options, row.feedback]);
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
