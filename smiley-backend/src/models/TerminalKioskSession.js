import { pool, query } from '../config/database.js';

const staleMinutes = 2;

const terminalSelect = `
  SELECT
    t.id,
    t.location_id,
    t.terminal_code,
    t.name,
    t.status,
    l.name AS location_name,
    s.device_id AS reserved_by_device_id,
    s.last_seen_at AS reserved_last_seen_at,
    (
      SELECT GROUP_CONCAT(d.name ORDER BY d.name SEPARATOR ', ')
      FROM terminal_departments td
      JOIN departments d ON d.id = td.department_id
      WHERE td.terminal_id = t.id
    ) AS department_names
  FROM terminals t
  JOIN locations l ON l.id = t.location_id
  LEFT JOIN terminal_kiosk_sessions s
    ON s.terminal_id = t.id
    AND s.status = 'active'
`;

function normalizeDeviceId(deviceId) {
  return String(deviceId || '').trim();
}

export const TerminalKioskSession = {
  async releaseStale() {
    const result = await query(
      `UPDATE terminal_kiosk_sessions
       SET status = 'released', released_at = UTC_TIMESTAMP()
       WHERE status = 'active'
         AND last_seen_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${staleMinutes} MINUTE)`,
    );
    return result.affectedRows || 0;
  },

  async listAvailable({ deviceId } = {}) {
    await this.releaseStale();
    const normalizedDeviceId = normalizeDeviceId(deviceId);
    const parameters = [];
    let deviceClause = 's.id IS NULL';
    if (normalizedDeviceId) {
      deviceClause = '(s.id IS NULL OR s.device_id = ?)';
      parameters.push(normalizedDeviceId);
    }
    return query(
      terminalSelect + `
        WHERE t.status = 'active'
          AND ${deviceClause}
        ORDER BY l.name, t.name
      `,
      parameters,
    );
  },

  async findActiveByDevice(deviceId) {
    const rows = await query(
      terminalSelect + `
        WHERE s.status = 'active'
          AND s.device_id = ?
        LIMIT 1
      `,
      [normalizeDeviceId(deviceId)],
    );
    return rows[0];
  },

  async assign({ terminalCode, deviceId }) {
    const normalizedDeviceId = normalizeDeviceId(deviceId);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `UPDATE terminal_kiosk_sessions
         SET status = 'released', released_at = UTC_TIMESTAMP()
         WHERE status = 'active' AND last_seen_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${staleMinutes} MINUTE)`,
      );

      const [terminalRows] = await connection.execute(
        `SELECT t.*, l.name AS location_name,
           (
             SELECT GROUP_CONCAT(d.name ORDER BY d.name SEPARATOR ', ')
             FROM terminal_departments td
             JOIN departments d ON d.id = td.department_id
             WHERE td.terminal_id = t.id
           ) AS department_names
         FROM terminals t
         JOIN locations l ON l.id = t.location_id
         WHERE t.terminal_code = ? AND t.status = 'active'
         FOR UPDATE`,
        [terminalCode],
      );
      const terminal = terminalRows[0];
      if (!terminal) {
        const error = new Error('Terminal not found or inactive');
        error.status = 404;
        throw error;
      }

      const [existingTerminalRows] = await connection.execute(
        `SELECT s.*, t.terminal_code
         FROM terminal_kiosk_sessions s
         JOIN terminals t ON t.id = s.terminal_id
         WHERE s.terminal_id = ? AND s.status = 'active'
         FOR UPDATE`,
        [terminal.id],
      );
      const existingTerminal = existingTerminalRows[0];
      if (existingTerminal && existingTerminal.device_id !== normalizedDeviceId) {
        const error = new Error('Terminal is already selected on another kiosk');
        error.status = 409;
        throw error;
      }

      await connection.execute(
        `UPDATE terminal_kiosk_sessions
         SET status = 'released', released_at = UTC_TIMESTAMP()
         WHERE device_id = ? AND status = 'active' AND terminal_id <> ?`,
        [normalizedDeviceId, terminal.id],
      );

      if (existingTerminal) {
        await connection.execute(
          `UPDATE terminal_kiosk_sessions
           SET last_seen_at = UTC_TIMESTAMP()
           WHERE id = ?`,
          [existingTerminal.id],
        );
      } else {
        await connection.execute(
          `INSERT INTO terminal_kiosk_sessions (terminal_id, device_id)
           VALUES (?, ?)`,
          [terminal.id, normalizedDeviceId],
        );
      }

      await connection.commit();
      return {
        id: terminal.id,
        location_id: terminal.location_id,
        terminal_code: terminal.terminal_code,
        name: terminal.name,
        status: terminal.status,
        location_name: terminal.location_name,
        department_names: terminal.department_names,
      };
    } catch (error) {
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY') {
        error.status = 409;
        error.message = 'Terminal is already selected on another kiosk';
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  async heartbeat({ terminalCode, deviceId }) {
    const rows = await query(
      `SELECT s.id
       FROM terminal_kiosk_sessions s
       JOIN terminals t ON t.id = s.terminal_id
       WHERE s.device_id = ?
         AND t.terminal_code = ?
         AND s.status = 'active'
       LIMIT 1`,
      [normalizeDeviceId(deviceId), terminalCode],
    );
    if (!rows[0]) return null;
    await query('UPDATE terminal_kiosk_sessions SET last_seen_at = UTC_TIMESTAMP() WHERE id = ?', [rows[0].id]);
    return this.findActiveByDevice(deviceId);
  },

  async releaseByTerminalId(terminalId) {
    const result = await query(
      `UPDATE terminal_kiosk_sessions
       SET status = 'released', released_at = UTC_TIMESTAMP()
       WHERE terminal_id = ? AND status = 'active'`,
      [terminalId],
    );
    return result.affectedRows || 0;
  },

  async release({ deviceId, terminalCode }) {
    const parameters = [normalizeDeviceId(deviceId)];
    let terminalJoin = '';
    let terminalClause = '';
    if (terminalCode) {
      terminalJoin = ' JOIN terminals t ON t.id = s.terminal_id';
      terminalClause = ' AND t.terminal_code = ?';
      parameters.push(terminalCode);
    }
    const result = await query(
      `UPDATE terminal_kiosk_sessions s${terminalJoin}
       SET s.status = 'released', s.released_at = UTC_TIMESTAMP()
       WHERE s.device_id = ?
         AND s.status = 'active'
         ${terminalClause}`,
      parameters,
    );
    return result.affectedRows || 0;
  },
};
