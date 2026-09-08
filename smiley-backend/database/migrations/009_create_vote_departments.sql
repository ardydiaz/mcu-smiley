CREATE TABLE IF NOT EXISTS vote_departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vote_id INT NOT NULL,
  department_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT vote_departments_vote_fk FOREIGN KEY (vote_id) REFERENCES votes(id),
  CONSTRAINT vote_departments_department_fk FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE KEY vote_departments_unique (vote_id, department_id),
  INDEX vote_departments_vote (vote_id),
  INDEX vote_departments_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO vote_departments (vote_id, department_id)
SELECT id, department_id
FROM votes
WHERE department_id IS NOT NULL;
