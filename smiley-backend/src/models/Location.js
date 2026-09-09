import { query } from '../config/database.js';
export const Location = {
  list(includeInactive = false) {
    return query(
      "SELECT *, status = 'active' AS active FROM locations" +
      (includeInactive ? '' : " WHERE status = 'active'") +
      ' ORDER BY name',
    );
  },
  async findById(id) { return (await query('SELECT * FROM locations WHERE id = ?', [id]))[0]; },
  async findDuplicateName(name, excludeId) {
    const parameters = [name];
    let sql = 'SELECT id FROM locations WHERE name = ?';
    if (excludeId) {
      sql += ' AND id <> ?';
      parameters.push(excludeId);
    }
    return (await query(sql + ' LIMIT 1', parameters))[0];
  },
  async create({ name, description, status = 'active' }) {
    const result = await query('INSERT INTO locations (name, description, status) VALUES (?, ?, ?)', [name, description, status]);
    return this.findById(result.insertId);
  },
  async update(id, { name, description, status = 'active' }) {
    await query('UPDATE locations SET name = ?, description = ?, status = ? WHERE id = ?', [name, description, status, id]);
    return this.findById(id);
  },
  async deactivate(id) {
    await query("UPDATE locations SET status = 'inactive' WHERE id = ?", [id]);
  },
};