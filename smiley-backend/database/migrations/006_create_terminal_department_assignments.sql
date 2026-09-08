CREATE TABLE IF NOT EXISTS terminal_departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terminal_id INT NOT NULL,
  department_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT terminal_departments_terminal_fk FOREIGN KEY (terminal_id) REFERENCES terminals(id),
  CONSTRAINT terminal_departments_department_fk FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE KEY terminal_departments_unique (terminal_id, department_id),
  INDEX terminal_departments_terminal (terminal_id),
  INDEX terminal_departments_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
