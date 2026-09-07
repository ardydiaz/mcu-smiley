import mysql from 'mysql2/promise';
import { env } from './env.js';

export const databaseOptions = {
  host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
  password: env.DB_PASSWORD, database: env.DB_NAME,
  timezone: 'Z', charset: 'utf8mb4',
};
export const pool = mysql.createPool({
  ...databaseOptions, waitForConnections: true, connectionLimit: 10, queueLimit: 100,
});
pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'", error => {
    if (error) connection.destroy();
  });
});
export async function query(sql, parameters = []) {
  const [rows] = await pool.execute(sql, parameters);
  return rows;
}
