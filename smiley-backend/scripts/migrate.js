import mysql from 'mysql2/promise';
import { readdir, readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { databaseOptions, pool } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const migrationsDirectory = new URL('../database/migrations/', import.meta.url);

function splitSql(sql) {
  return sql
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);
}

export async function runMigrations() {
  let connection;
  try {
    connection = await mysql.createConnection({ ...databaseOptions, database: undefined });
    // DB_NAME is restricted to letters, digits and underscores by env validation.
    await connection.query('CREATE DATABASE IF NOT EXISTS ' + env.DB_NAME + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE ' + env.DB_NAME);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [appliedRows] = await connection.query('SELECT name FROM migrations ORDER BY name');
    const applied = new Set(appliedRows.map(row => row.name));
    const files = (await readdir(migrationsDirectory))
      .filter(file => extname(file) === '.sql')
      .sort();

    let appliedCount = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(new URL(file, migrationsDirectory), 'utf8');
      for (const statement of splitSql(sql)) await connection.query(statement);
      await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
      appliedCount += 1;
      logger.info('Applied migration: ' + file);
    }

    logger.info(appliedCount ? 'Database migrations completed' : 'Database is already up to date');
  } finally {
    if (connection) await connection.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await runMigrations();
  } catch (error) {
    logger.error('Database migration failed: ' + (error.code || error.name));
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
