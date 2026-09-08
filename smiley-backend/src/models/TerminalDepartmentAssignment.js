import { query } from '../config/database.js';

function buildAssignmentFilter({ terminalId, departmentId } = {}) {
  const clauses = [];
  const parameters = [];
  if (terminalId) {
    clauses.push('a.terminal_id = ?');
    parameters.push(terminalId);
  }
  if (departmentId) {
    clauses.push('a.department_id = ?');
    parameters.push(departmentId);
  }
  return { where: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '', parameters };
}

const assignmentSelect = `
  SELECT
    a.id,
    a.terminal_id,
    t.terminal_code,
    t.name AS terminal_name,
    t.status AS terminal_status,
    a.department_id,
    d.name AS department_name,
    d.status AS department_status,
    a.created_at,
    a.updated_at
  FROM terminal_departments a
  JOIN terminals t ON t.id = a.terminal_id
  JOIN departments d ON d.id = a.department_id
`;

export const TerminalDepartmentAssignment = {
  list(filters = {}) {
    const { where, parameters } = buildAssignmentFilter(filters);
    return query(assignmentSelect + where + ' ORDER BY t.terminal_code, d.name, a.id', parameters);
  },
  async findById(id) {
    const rows = await query(assignmentSelect + ' WHERE a.id = ?', [id]);
    return rows[0];
  },
  async create({ terminalId, departmentId }) {
    const result = await query(
      'INSERT INTO terminal_departments (terminal_id, department_id) VALUES (?, ?)',
      [terminalId, departmentId],
    );
    return this.findById(result.insertId);
  },
  async update(id, { terminalId, departmentId }) {
    await query(
      'UPDATE terminal_departments SET terminal_id = ?, department_id = ? WHERE id = ?',
      [terminalId, departmentId, id],
    );
    return this.findById(id);
  },
  async delete(id) {
    await query('DELETE FROM terminal_departments WHERE id = ?', [id]);
  },
};
