import { query } from '../config/database.js';
export const Terminal = {
  list(locationId, includeInactive = false) {
    const clauses = [];
    const parameters = [];
    if (locationId) {
      clauses.push('t.location_id = ?');
      parameters.push(locationId);
    }
    if (!includeInactive) clauses.push("t.status = 'active'");
    return query('SELECT t.*, l.name AS location_name, t.status = \'active\' AS active FROM terminals t JOIN locations l ON l.id = t.location_id' + (clauses.length ? ' WHERE ' + clauses.join(' AND ') : '') + ' ORDER BY l.name, t.name', parameters);
  },
  async findById(id) { return (await query("SELECT t.*, l.name AS location_name, t.status = 'active' AS active FROM terminals t JOIN locations l ON l.id = t.location_id WHERE t.id = ?", [id]))[0]; },
  async findDuplicateFields({ terminalCode, name }, excludeId) {
    const parameters = [terminalCode, name];
    let sql = 'SELECT terminal_code, name FROM terminals WHERE (terminal_code = ? OR name = ?)';
    if (excludeId) {
      sql += ' AND id <> ?';
      parameters.push(excludeId);
    }
    return query(sql, parameters);
  },
  async create({ terminalCode, name, locationId, status = 'active' }) {
    const result = await query('INSERT INTO terminals (terminal_code, name, location_id, status) VALUES (?, ?, ?, ?)', [terminalCode, name, locationId, status]);
    return this.findById(result.insertId);
  },
  async update(id, { terminalCode, name, locationId, status = 'active' }) {
    await query('UPDATE terminals SET terminal_code = ?, name = ?, location_id = ?, status = ? WHERE id = ?', [terminalCode, name, locationId, status, id]);
    return this.findById(id);
  },
  async deactivate(id) {
    await query("UPDATE terminals SET status = 'inactive' WHERE id = ?", [id]);
  },
};