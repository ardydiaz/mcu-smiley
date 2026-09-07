import { query } from '../config/database.js';
export const Rating = {
  list() { return query("SELECT id, name AS label, emoji, value AS score, status FROM ratings WHERE status = 'active' ORDER BY value DESC"); },
  async findById(id) { return (await query("SELECT *, name AS label, value AS score, status = 'active' AS active FROM ratings WHERE id = ?", [id]))[0]; },
};
