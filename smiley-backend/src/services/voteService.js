import { pool } from '../config/database.js';
import { AppError } from '../utils/response.js';

export async function submitVote({ ratingId, userTypeId, terminalCode, feedback }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Shared locks keep selected entities active until the vote commits.
    for (const [table, id, label] of [['ratings', ratingId, 'Rating'], ['user_types', userTypeId, 'User type']]) {
      const [rows] = await connection.execute("SELECT id FROM " + table + " WHERE id = ? AND status = 'active' FOR SHARE", [id]);
      if (!rows.length) throw new AppError(label + ' is unavailable', 400);
    }

    const [terminalRows] = await connection.execute(
      "SELECT t.id, t.location_id FROM terminals t JOIN locations l ON l.id = t.location_id WHERE t.terminal_code = ? AND t.status = 'active' AND l.status = 'active' FOR SHARE",
      [terminalCode],
    );
    if (!terminalRows.length) throw new AppError('Terminal is unavailable', 400);

    const terminal = terminalRows[0];
    const [departmentRows] = await connection.execute(
      "SELECT td.department_id FROM terminal_departments td JOIN departments d ON d.id = td.department_id WHERE td.terminal_id = ? AND d.status = 'active' ORDER BY td.id FOR SHARE",
      [terminal.id],
    );
    if (!departmentRows.length) throw new AppError('Terminal has no active department assignment', 400);
    const departmentId = departmentRows.length === 1 ? departmentRows[0].department_id : null;

    const [result] = await connection.execute(
      'INSERT INTO votes (rating_id, user_type_id, department_id, location_id, terminal_id, feedback) VALUES (?, ?, ?, ?, ?, ?)',
      [ratingId, userTypeId, departmentId, terminal.location_id, terminal.id, feedback],
    );
    for (const department of departmentRows) {
      await connection.execute(
        'INSERT IGNORE INTO vote_departments (vote_id, department_id) VALUES (?, ?)',
        [result.insertId, department.department_id],
      );
    }
    await connection.commit();
    return { id: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
