import { query } from '../config/database.js';
export const Location = {
  list() { return query("SELECT *, status = 'active' AS active FROM locations WHERE status = 'active' ORDER BY name"); },
  async findById(id) { return (await query('SELECT * FROM locations WHERE id = ?', [id]))[0]; },
  async create({ name, description = '', status = 'active' }) {
    const result = await query('INSERT INTO locations (name, description, status) VALUES (?, ?, ?)', [name, description, status]);
    return this.findById(result.insertId);
  },
};
