import { query } from '../config/database.js';
import { normalizePermissions } from '../config/menuPermissions.js';

const userSelect = `
  SELECT
    id,
    name,
    email,
    password AS password_hash,
    role,
    status,
    status = 'active' AS active,
    provider,
    provider_user_id,
    last_login_at,
    created_at,
    updated_at
  FROM users
`;

export const User = {
  async findByEmail(email) {
    return (await query(userSelect + ' WHERE email = ?', [email]))[0];
  },
  async findById(id) {
    return (await query(userSelect + ' WHERE id = ?', [id]))[0];
  },
  async list() {
    const users = await query(userSelect + ' ORDER BY FIELD(status, \'pending\', \'active\', \'inactive\'), name, email');
    const permissionRows = await query('SELECT user_id, permission FROM user_menu_permissions ORDER BY permission');
    const permissionsByUser = permissionRows.reduce((groups, row) => {
      const key = Number(row.user_id);
      groups[key] ||= [];
      groups[key].push(row.permission);
      return groups;
    }, {});
    return users.map(user => ({ ...user, permissions: normalizePermissions(user.role, permissionsByUser[user.id] || []) }));
  },
  async listPermissions(id) {
    const rows = await query('SELECT permission FROM user_menu_permissions WHERE user_id = ? ORDER BY permission', [id]);
    return rows.map(row => row.permission);
  },
  async replacePermissions(id, permissions = []) {
    await query('DELETE FROM user_menu_permissions WHERE user_id = ?', [id]);
    const normalized = normalizePermissions('user', permissions);
    for (const permission of normalized) {
      await query('INSERT INTO user_menu_permissions (user_id, permission) VALUES (?, ?)', [id, permission]);
    }
    return normalized;
  },
  async countAdmins() {
    const [row] = await query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
    return Number(row.total);
  },
  async create({ name, email, passwordHash = null, role = 'admin', status = 'active', provider = 'local', providerUserId = null }) {
    const result = await query(
      'INSERT INTO users (name, email, password, role, status, provider, provider_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, status, provider, providerUserId],
    );
    return this.findById(result.insertId);
  },
  async createPendingSsoUser({ name, email, provider, providerUserId }) {
    return this.create({ name, email, passwordHash: null, role: 'user', status: 'pending', provider, providerUserId });
  },
  async updateSsoProfile(id, { name, provider, providerUserId }) {
    await query(
      'UPDATE users SET name = ?, provider = ?, provider_user_id = ?, last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, provider, providerUserId, id],
    );
    return this.findById(id);
  },
  async updateAccess(id, { role, status, permissions = [] }) {
    await query('UPDATE users SET role = ?, status = ? WHERE id = ?', [role, status, id]);
    const savedPermissions = role === 'user' && status === 'active'
      ? await this.replacePermissions(id, permissions)
      : await this.replacePermissions(id, []);
    const user = await this.findById(id);
    return { ...user, permissions: normalizePermissions(user.role, savedPermissions) };
  },
  async touchLogin(id) {
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  },
};
