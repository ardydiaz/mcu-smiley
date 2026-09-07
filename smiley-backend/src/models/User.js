import { query } from '../config/database.js';
export const User = {
  async findByEmail(email) { return (await query("SELECT *, password AS password_hash, status = 'active' AS active FROM users WHERE email = ?", [email]))[0]; },
  async findById(id) { return (await query("SELECT id, name, email, role, status, status = 'active' AS active FROM users WHERE id = ?", [id]))[0]; },
  async countAdmins() {
    const [row] = await query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
    return Number(row.total);
  },
  async create({ name, email, passwordHash }) {
    const result = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, passwordHash]);
    return this.findById(result.insertId);
  },
};
