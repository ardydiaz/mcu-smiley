import { query } from '../config/database.js';

// Only fixed SQL fragments are concatenated. All caller values use placeholders.
export function voteFilter({ from, to, departmentId, serviceId, locationId, terminalId } = {}) {
  const clauses = [];
  const parameters = [];
  if (from) { clauses.push('v.created_at >= ?'); parameters.push(from); }
  if (to) { clauses.push('v.created_at < DATE_ADD(?, INTERVAL 1 DAY)'); parameters.push(to); }
  if (departmentId) { clauses.push('v.department_id = ?'); parameters.push(departmentId); }
  if (serviceId) { clauses.push('v.service_id = ?'); parameters.push(serviceId); }
  if (locationId) { clauses.push('v.location_id = ?'); parameters.push(locationId); }
  if (terminalId) { clauses.push('v.terminal_id = ?'); parameters.push(terminalId); }
  return { where: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '', parameters };
}
const joined = ' FROM votes v JOIN ratings r ON r.id = v.rating_id JOIN departments d ON d.id = v.department_id LEFT JOIN services s ON s.id = v.service_id LEFT JOIN locations l ON l.id = v.location_id LEFT JOIN terminals t ON t.id = v.terminal_id';
export const Vote = {
  async create({ ratingId, departmentId, serviceId, locationId, terminalId, feedback }) {
    const result = await query('INSERT INTO votes (rating_id, department_id, service_id, location_id, terminal_id, feedback) VALUES (?, ?, ?, ?, ?, ?)', [ratingId, departmentId, serviceId ?? null, locationId ?? null, terminalId ?? null, feedback]);
    return { id: result.insertId };
  },
  async list(filters) {
    const { where, parameters } = voteFilter(filters);
    const offset = (filters.page - 1) * filters.limit;
    const rows = await query('SELECT v.id, v.feedback, v.created_at, v.service_id, v.location_id, v.terminal_id, r.name AS rating, r.value AS score, d.name AS department, s.name AS service, l.name AS location, t.name AS terminal' + joined + where + ' ORDER BY v.created_at DESC, v.id DESC LIMIT ? OFFSET ?', [...parameters, String(filters.limit), String(offset)]);
    const [count] = await query('SELECT COUNT(*) AS total FROM votes v' + where, parameters);
    return { items: rows, total: Number(count.total), page: filters.page, limit: filters.limit };
  },
  async summary(filters) {
    const { where, parameters } = voteFilter(filters);
    const [summary] = await query('SELECT COUNT(*) AS totalVotes, COALESCE(AVG(r.value), 0) AS averageScore, COALESCE(SUM(r.value >= 4), 0) AS positiveVotes' + joined + where, parameters);
    const ratings = await query('SELECT r.id, r.name AS label, r.emoji, r.value AS score, COUNT(*) AS votes' + joined + where + ' GROUP BY r.id, r.name, r.emoji, r.value ORDER BY r.value DESC', parameters);
    const departments = await query('SELECT d.id, d.name, COUNT(*) AS votes, AVG(r.value) AS averageScore' + joined + where + ' GROUP BY d.id, d.name ORDER BY votes DESC, d.id', parameters);
    const daily = await query('SELECT DATE(v.created_at) AS date, COUNT(*) AS votes' + joined + where + ' GROUP BY DATE(v.created_at) ORDER BY date', parameters);
    return { totalVotes: Number(summary.totalVotes), averageScore: Number(summary.averageScore), positiveVotes: Number(summary.positiveVotes), ratings, departments, daily };
  },
};
