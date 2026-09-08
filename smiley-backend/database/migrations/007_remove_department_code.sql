SET @department_code_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'departments'
    AND COLUMN_NAME = 'code'
);

SET @drop_department_code_sql = IF(
  @department_code_exists > 0,
  'ALTER TABLE departments DROP COLUMN code',
  'SELECT 1'
);

PREPARE drop_department_code_statement FROM @drop_department_code_sql;
EXECUTE drop_department_code_statement;
DEALLOCATE PREPARE drop_department_code_statement;
