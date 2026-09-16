import { query } from '../config/database.js';

const departmentNamesSelect = `(
  SELECT GROUP_CONCAT(d2.name ORDER BY d2.name SEPARATOR ', ')
  FROM vote_departments vd2
  JOIN departments d2 ON d2.id = vd2.department_id
  WHERE vd2.vote_id = v.id
)`;

const voteDepartmentSource = `(
  SELECT vd.vote_id, vd.department_id
  FROM vote_departments vd
  UNION
  SELECT v2.id AS vote_id, v2.department_id
  FROM votes v2
  WHERE v2.department_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM vote_departments vd2 WHERE vd2.vote_id = v2.id)
) vdm`;

// Only fixed SQL fragments are concatenated. All caller values use placeholders.
export function voteFilter({ q, from, to, ratingId, departmentId, userTypeId, locationId, terminalId } = {}) {
  const clauses = [];
  const parameters = [];
  if (q) {
    clauses.push("(INSTR(LOWER(COALESCE(v.feedback, '')), LOWER(?)) > 0 OR INSTR(LOWER(COALESCE(fo.label, '')), LOWER(?)) > 0 OR INSTR(LOWER(r.name), LOWER(?)) > 0 OR INSTR(LOWER(ut.name), LOWER(?)) > 0 OR INSTR(LOWER(COALESCE(l.name, '')), LOWER(?)) > 0 OR INSTR(LOWER(COALESCE(t.name, '')), LOWER(?)) > 0 OR INSTR(LOWER(COALESCE(t.terminal_code, '')), LOWER(?)) > 0 OR EXISTS (SELECT 1 FROM vote_departments vdq JOIN departments dq ON dq.id = vdq.department_id WHERE vdq.vote_id = v.id AND INSTR(LOWER(dq.name), LOWER(?)) > 0) OR INSTR(LOWER(COALESCE(d.name, '')), LOWER(?)) > 0)");
    parameters.push(q, q, q, q, q, q, q, q, q);
  }
  if (from) { clauses.push('v.created_at >= ?'); parameters.push(from); }
  if (to) { clauses.push('v.created_at < DATE_ADD(?, INTERVAL 1 DAY)'); parameters.push(to); }
  if (ratingId) { clauses.push('v.rating_id = ?'); parameters.push(ratingId); }
  if (departmentId) {
    clauses.push('(EXISTS (SELECT 1 FROM vote_departments vd WHERE vd.vote_id = v.id AND vd.department_id = ?) OR v.department_id = ?)');
    parameters.push(departmentId, departmentId);
  }
  if (userTypeId) { clauses.push('v.user_type_id = ?'); parameters.push(userTypeId); }
  if (locationId) { clauses.push('v.location_id = ?'); parameters.push(locationId); }
  if (terminalId) { clauses.push('v.terminal_id = ?'); parameters.push(terminalId); }
  return { where: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '', parameters };
}

function appendDepartmentFilter(where, parameters, departmentId) {
  if (!departmentId) return { where, parameters };
  return {
    where: where + (where ? ' AND ' : ' WHERE ') + 'vdm.department_id = ?',
    parameters: [...parameters, departmentId],
  };
}

function appendWhere(where, clause) {
  return where + (where ? ' AND ' : ' WHERE ') + clause;
}

const joined = ' FROM votes v JOIN ratings r ON r.id = v.rating_id JOIN user_types ut ON ut.id = v.user_type_id LEFT JOIN departments d ON d.id = v.department_id LEFT JOIN locations l ON l.id = v.location_id LEFT JOIN terminals t ON t.id = v.terminal_id LEFT JOIN feedback_options fo ON fo.id = v.feedback_option_id';

export const Vote = {
  async create({ ratingId, userTypeId, departmentId, locationId, terminalId, feedbackOptionId, feedback }) {
    const result = await query('INSERT INTO votes (rating_id, user_type_id, department_id, location_id, terminal_id, feedback_option_id, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)', [ratingId, userTypeId, departmentId, locationId ?? null, terminalId ?? null, feedbackOptionId ?? null, feedback]);
    return { id: result.insertId };
  },
  async list(filters) {
    const { where, parameters } = voteFilter(filters);
    const offset = (filters.page - 1) * filters.limit;
    const rows = await query('SELECT v.id, v.feedback, v.feedback_option_id, fo.label AS feedback_option, fo.requires_text = 1 AS feedback_requires_text, v.created_at, v.user_type_id, v.location_id, v.terminal_id, r.name AS rating, r.emoji AS rating_emoji, r.value AS score, ut.name AS user_type, COALESCE(' + departmentNamesSelect + ', d.name) AS department, l.name AS location, t.terminal_code, t.name AS terminal' + joined + where + ' ORDER BY v.created_at DESC, v.id DESC LIMIT ? OFFSET ?', [...parameters, String(filters.limit), String(offset)]);
    const [count] = await query('SELECT COUNT(*) AS total' + joined + where, parameters);
    return { items: rows, total: Number(count.total), page: filters.page, limit: filters.limit };
  },
  async summary(filters) {
    const { where, parameters } = voteFilter(filters);
    const [summary] = await query('SELECT COUNT(*) AS totalVotes, COALESCE(AVG(r.value), 0) AS averageScore, COALESCE(SUM(r.value >= 4), 0) AS positiveVotes' + joined + where, parameters);
    const ratings = await query('SELECT r.id, r.name AS label, r.emoji, r.value AS score, COUNT(*) AS votes' + joined + where + ' GROUP BY r.id, r.name, r.emoji, r.value ORDER BY r.value DESC', parameters);
    const departmentFilter = appendDepartmentFilter(where, parameters, filters.departmentId);
    const departments = await query('SELECT d2.id, d2.name, COUNT(*) AS votes, AVG(r.value) AS averageScore FROM ' + voteDepartmentSource + ' JOIN votes v ON v.id = vdm.vote_id JOIN ratings r ON r.id = v.rating_id JOIN user_types ut ON ut.id = v.user_type_id JOIN departments d2 ON d2.id = vdm.department_id LEFT JOIN departments d ON d.id = v.department_id LEFT JOIN locations l ON l.id = v.location_id LEFT JOIN terminals t ON t.id = v.terminal_id' + departmentFilter.where + ' GROUP BY d2.id, d2.name ORDER BY votes DESC, d2.name', departmentFilter.parameters);
    const daily = await query('SELECT DATE(v.created_at) AS date, COUNT(*) AS votes, AVG(r.value) AS averageScore, SUM(r.value >= 4) AS positiveVotes' + joined + where + ' GROUP BY DATE(v.created_at) ORDER BY date', parameters);
    const userTypes = await query('SELECT ut.id, ut.name, COUNT(*) AS votes, AVG(r.value) AS averageScore, SUM(r.value >= 4) AS positiveVotes' + joined + where + ' GROUP BY ut.id, ut.name ORDER BY votes DESC, ut.name', parameters);
    const locations = await query('SELECT l.id, COALESCE(l.name, \'No location\') AS name, COUNT(*) AS votes, AVG(r.value) AS averageScore, SUM(r.value >= 4) AS positiveVotes' + joined + where + ' GROUP BY l.id, l.name ORDER BY votes DESC, name', parameters);
    const terminals = await query('SELECT t.id, COALESCE(t.terminal_code, \'No terminal\') AS terminal_code, COALESCE(t.name, \'No terminal\') AS name, COALESCE(l.name, \'\') AS location_name, COUNT(*) AS votes, AVG(r.value) AS averageScore, SUM(r.value >= 4) AS positiveVotes' + joined + where + ' GROUP BY t.id, t.terminal_code, t.name, l.name ORDER BY votes DESC, terminal_code LIMIT 10', parameters);
    const feedbackOptions = await query('SELECT fo.id, COALESCE(fo.label, \'No selected option\') AS label, r.name AS rating, r.emoji, r.value AS score, COUNT(*) AS votes, AVG(r.value) AS averageScore' + joined + where + ' GROUP BY fo.id, fo.label, r.name, r.emoji, r.value ORDER BY votes DESC, label LIMIT 10', parameters);
    const issues = await query('SELECT fo.id, COALESCE(fo.label, \'Written feedback only\') AS label, r.name AS rating, r.emoji, r.value AS score, COUNT(*) AS votes' + joined + appendWhere(where, 'r.value <= 3') + ' GROUP BY fo.id, fo.label, r.name, r.emoji, r.value ORDER BY votes DESC, score ASC, label LIMIT 8', parameters);
    return {
      totalVotes: Number(summary.totalVotes),
      averageScore: Number(summary.averageScore),
      positiveVotes: Number(summary.positiveVotes),
      ratings,
      departments,
      daily,
      userTypes,
      locations,
      terminals,
      feedbackOptions,
      issues,
    };
  },
  async periodSummary(filters, from, to) {
    const { where, parameters } = voteFilter({ ...filters, from, to });
    const [summary] = await query('SELECT COUNT(*) AS totalVotes, COALESCE(AVG(r.value), 0) AS averageScore, COALESCE(SUM(r.value >= 4), 0) AS positiveVotes' + joined + where, parameters);
    return {
      totalVotes: Number(summary.totalVotes),
      averageScore: Number(summary.averageScore),
      positiveVotes: Number(summary.positiveVotes),
    };
  },
};
