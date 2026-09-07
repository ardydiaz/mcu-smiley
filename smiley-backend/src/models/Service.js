import { query } from '../config/database.js';

export const Service = {
  list(departmentId, includeInactive = false) {
    const clauses = [];
    const parameters = [];
    if (departmentId) {
      clauses.push('department_id = ?');
      parameters.push(departmentId);
    }
    if (!includeInactive) clauses.push("status = 'active'");
    return query('SELECT *, status = \'active\' AS active FROM services' + (clauses.length ? ' WHERE ' + clauses.join(' AND ') : '') + ' ORDER BY name', parameters);
  },
  async findById(id) {
    return (await query("SELECT *, status = 'active' AS active FROM services WHERE id = ?", [id]))[0];
  },
  async create({ departmentId, name, description = '', status = 'active' }) {
    const result = await query('INSERT INTO services (department_id, name, description, status) VALUES (?, ?, ?, ?)', [departmentId, name, description, status]);
    return this.findById(result.insertId);
  },
};
