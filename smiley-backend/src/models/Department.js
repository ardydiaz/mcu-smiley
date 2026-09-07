import { query } from '../config/database.js';
export const Department = {
  list(includeInactive = false) {
    return query("SELECT *, status = 'active' AS active FROM departments" + (includeInactive ? '' : " WHERE status = 'active'") + ' ORDER BY name');
  },
  async findById(id) { return (await query('SELECT * FROM departments WHERE id = ?', [id]))[0]; },
  async create({ code = null, name, description, active = true, status }) {
    const departmentStatus = status || (active ? 'active' : 'inactive');
    const result = await query('INSERT INTO departments (code, name, description, status) VALUES (?, ?, ?, ?)', [code, name, description, departmentStatus]);
    return this.findById(result.insertId);
  },
  async update(id, { code = null, name, description, active = true, status }) {
    const departmentStatus = status || (active ? 'active' : 'inactive');
    await query('UPDATE departments SET code = ?, name = ?, description = ?, status = ? WHERE id = ?', [code, name, description, departmentStatus, id]);
    return this.findById(id);
  },
  async deactivate(id) { await query("UPDATE departments SET status = 'inactive' WHERE id = ?", [id]); },
};
