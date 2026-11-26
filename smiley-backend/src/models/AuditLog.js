import { query } from '../config/database.js';

function auditLogFilter({ q, entityType, action, userId, from, to } = {}) {
  const clauses = [];
  const parameters = [];
  if (q) {
    clauses.push("(INSTR(LOWER(COALESCE(user_name, '')), LOWER(?)) > 0 OR INSTR(LOWER(COALESCE(user_email, '')), LOWER(?)) > 0 OR INSTR(LOWER(action), LOWER(?)) > 0 OR INSTR(LOWER(entity_type), LOWER(?)) > 0)");
    parameters.push(q, q, q, q);
  }
  if (entityType) { clauses.push('entity_type = ?'); parameters.push(entityType); }
  if (action) { clauses.push('action = ?'); parameters.push(action); }
  if (userId) { clauses.push('user_id = ?'); parameters.push(userId); }
  if (from) { clauses.push('created_at >= ?'); parameters.push(from); }
  if (to) { clauses.push('created_at < DATE_ADD(?, INTERVAL 1 DAY)'); parameters.push(to); }
  return { where: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '', parameters };
}

export const AuditLog = {
  async create({ userId, userName, userEmail, action, entityType, entityId, details, ipAddress }) {
    await query(
      `INSERT INTO audit_logs (user_id, user_name, user_email, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId ?? null,
        userName ?? null,
        userEmail ?? null,
        action,
        entityType,
        entityId ?? null,
        details === undefined ? null : JSON.stringify(details),
        ipAddress ?? null,
      ],
    );
  },

  async list(filters = {}) {
    const { where, parameters } = auditLogFilter(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;
    const rows = await query(
      'SELECT id, user_id, user_name, user_email, action, entity_type, entity_id, details, ip_address, created_at FROM audit_logs'
        + where + ' ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?',
      [...parameters, String(limit), String(offset)],
    );
    const [count] = await query('SELECT COUNT(*) AS total FROM audit_logs' + where, parameters);
    return { items: rows, total: Number(count.total), page, limit };
  },
};
