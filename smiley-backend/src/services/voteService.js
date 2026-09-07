import { pool } from '../config/database.js';
import { AppError } from '../utils/response.js';

export async function submitVote({ ratingId, departmentId, serviceId, locationId, terminalId, feedback }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Shared locks keep selected entities active until the vote commits.
    for (const [table, id, label] of [['ratings', ratingId, 'Rating'], ['departments', departmentId, 'Department']]) {
      const [rows] = await connection.execute("SELECT id FROM " + table + " WHERE id = ? AND status = 'active' FOR SHARE", [id]);
      if (!rows.length) throw new AppError(label + ' is unavailable', 400);
    }
    if (serviceId !== undefined) {
      const [rows] = await connection.execute("SELECT id FROM services WHERE id = ? AND department_id = ? AND status = 'active' FOR SHARE", [serviceId, departmentId]);
      if (!rows.length) throw new AppError('Service is unavailable for this department', 400);
    }
    if (locationId !== undefined) {
      const [rows] = await connection.execute("SELECT id FROM locations WHERE id = ? AND status = 'active' FOR SHARE", [locationId]);
      if (!rows.length) throw new AppError('Location is unavailable', 400);
    }
    let terminalLocationId = null;
    if (terminalId !== undefined) {
      const [rows] = await connection.execute("SELECT t.id, t.location_id FROM terminals t JOIN locations l ON l.id = t.location_id WHERE t.id = ? AND t.status = 'active' AND l.status = 'active' FOR SHARE", [terminalId]);
      if (!rows.length) throw new AppError('Terminal is unavailable', 400);
      terminalLocationId = rows[0].location_id;
      if (locationId !== undefined && terminalLocationId !== locationId) throw new AppError('Terminal does not belong to this location', 400);
    }
    const voteLocationId = locationId ?? terminalLocationId;
    const [result] = await connection.execute('INSERT INTO votes (rating_id, department_id, service_id, location_id, terminal_id, feedback) VALUES (?, ?, ?, ?, ?, ?)', [ratingId, departmentId, serviceId ?? null, voteLocationId ?? null, terminalId ?? null, feedback]);
    await connection.commit();
    return { id: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
