import { query } from '../config/database.js';

export const FeedbackOption = {
  list({ ratingId, includeInactive = false } = {}) {
    const clauses = [];
    const parameters = [];
    if (ratingId) {
      clauses.push('fo.rating_id = ?');
      parameters.push(ratingId);
    }
    if (!includeInactive) clauses.push("fo.status = 'active'");
    return query(
      'SELECT fo.*, fo.requires_text = 1 AS requiresText, r.name AS rating, r.emoji AS rating_emoji, r.value AS rating_score ' +
      'FROM feedback_options fo JOIN ratings r ON r.id = fo.rating_id' +
      (clauses.length ? ' WHERE ' + clauses.join(' AND ') : '') +
      ' ORDER BY r.value DESC, fo.id',
      parameters,
    );
  },
  async findById(id) {
    return (await query(
      'SELECT fo.*, fo.requires_text = 1 AS requiresText, r.name AS rating, r.emoji AS rating_emoji, r.value AS rating_score ' +
      'FROM feedback_options fo JOIN ratings r ON r.id = fo.rating_id WHERE fo.id = ?',
      [id],
    ))[0];
  },
  async findDuplicateLabel({ ratingId, label }, excludeId) {
    const parameters = [ratingId, label];
    let sql = 'SELECT id FROM feedback_options WHERE rating_id = ? AND label = ?';
    if (excludeId) {
      sql += ' AND id <> ?';
      parameters.push(excludeId);
    }
    return (await query(sql + ' LIMIT 1', parameters))[0];
  },
  async create({ ratingId, label, requiresText = false, status = 'active' }) {
    const result = await query(
      'INSERT INTO feedback_options (rating_id, label, requires_text, status) VALUES (?, ?, ?, ?)',
      [ratingId, label, requiresText ? 1 : 0, status],
    );
    return this.findById(result.insertId);
  },
  async update(id, { ratingId, label, requiresText = false, status = 'active' }) {
    await query(
      'UPDATE feedback_options SET rating_id = ?, label = ?, requires_text = ?, status = ? WHERE id = ?',
      [ratingId, label, requiresText ? 1 : 0, status, id],
    );
    return this.findById(id);
  },
  async deactivate(id) {
    await query("UPDATE feedback_options SET status = 'inactive' WHERE id = ?", [id]);
  },
};