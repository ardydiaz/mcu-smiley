import { Vote } from '../models/Vote.js';
export function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export async function getReport(filters) {
  return Vote.list(filters);
}
export function toCsv(items) {
  const rows = [['ID', 'Date (UTC)', 'Rating', 'Score', 'User Type', 'Department', 'Location', 'Terminal Code', 'Tablet Name', 'Feedback']];
  for (const row of items) rows.push([row.id, row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at, row.rating, row.score, row.user_type, row.department, row.location, row.terminal_code, row.terminal, row.feedback]);
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
