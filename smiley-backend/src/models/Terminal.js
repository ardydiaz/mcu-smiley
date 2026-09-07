import { query } from '../config/database.js';
export const Terminal = {
  list() { return query("SELECT *, status = 'active' AS active FROM terminals WHERE status = 'active' ORDER BY name"); },
  async findById(id) { return (await query('SELECT * FROM terminals WHERE id = ?', [id]))[0]; },
  async create({ terminalCode, name, locationId, status = 'active' }) {
    const result = await query('INSERT INTO terminals (terminal_code, name, location_id, status) VALUES (?, ?, ?, ?)', [terminalCode, name, locationId, status]);
    return this.findById(result.insertId);
  },
};
