SET @votes_service_fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'votes'
    AND CONSTRAINT_NAME = 'votes_service_fk'
);

SET @drop_votes_service_fk_sql = IF(
  @votes_service_fk_exists > 0,
  'ALTER TABLE votes DROP FOREIGN KEY votes_service_fk',
  'SELECT 1'
);

PREPARE drop_votes_service_fk_statement FROM @drop_votes_service_fk_sql;
EXECUTE drop_votes_service_fk_statement;
DEALLOCATE PREPARE drop_votes_service_fk_statement;

SET @votes_service_index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'votes'
    AND INDEX_NAME = 'votes_service_created'
);

SET @drop_votes_service_index_sql = IF(
  @votes_service_index_exists > 0,
  'ALTER TABLE votes DROP INDEX votes_service_created',
  'SELECT 1'
);

PREPARE drop_votes_service_index_statement FROM @drop_votes_service_index_sql;
EXECUTE drop_votes_service_index_statement;
DEALLOCATE PREPARE drop_votes_service_index_statement;

SET @votes_service_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'votes'
    AND COLUMN_NAME = 'service_id'
);

SET @drop_votes_service_column_sql = IF(
  @votes_service_column_exists > 0,
  'ALTER TABLE votes DROP COLUMN service_id',
  'SELECT 1'
);

PREPARE drop_votes_service_column_statement FROM @drop_votes_service_column_sql;
EXECUTE drop_votes_service_column_statement;
DEALLOCATE PREPARE drop_votes_service_column_statement;

DROP TABLE IF EXISTS services;

SET @old_terminal_assignments_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'terminal_department_assignments'
);

SET @terminal_departments_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'terminal_departments'
);

SET @rename_terminal_departments_sql = IF(
  @old_terminal_assignments_exists > 0 AND @terminal_departments_exists = 0,
  'RENAME TABLE terminal_department_assignments TO terminal_departments',
  'SELECT 1'
);

PREPARE rename_terminal_departments_statement FROM @rename_terminal_departments_sql;
EXECUTE rename_terminal_departments_statement;
DEALLOCATE PREPARE rename_terminal_departments_statement;
