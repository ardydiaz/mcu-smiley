CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500) NOT NULL DEFAULT '',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX departments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500) NOT NULL DEFAULT '',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX locations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS terminals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id INT NOT NULL,
  terminal_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT terminals_location_fk FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX terminals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  emoji VARCHAR(16) NOT NULL,
  name VARCHAR(50) NOT NULL,
  value TINYINT NOT NULL UNIQUE,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ratings_value_check CHECK (value BETWEEN 1 AND 5),
  INDEX ratings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rating_id INT NOT NULL,
  department_id INT NULL,
  location_id INT NULL,
  terminal_id INT NULL,
  feedback TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT votes_rating_fk FOREIGN KEY (rating_id) REFERENCES ratings(id),
  CONSTRAINT votes_department_fk FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT votes_location_fk FOREIGN KEY (location_id) REFERENCES locations(id),
  CONSTRAINT votes_terminal_fk FOREIGN KEY (terminal_id) REFERENCES terminals(id),
  INDEX votes_created (created_at),
  INDEX votes_department_created (department_id, created_at),
  INDEX votes_location_created (location_id, created_at),
  INDEX votes_terminal_created (terminal_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

INSERT INTO ratings (emoji, name, value, status) VALUES
  (CAST(UNHEX('F09F9884') AS CHAR CHARACTER SET utf8mb4), 'Very Satisfied', 5, 'active'),
  (CAST(UNHEX('F09F9982') AS CHAR CHARACTER SET utf8mb4), 'Satisfied', 4, 'active'),
  (CAST(UNHEX('F09F9890') AS CHAR CHARACTER SET utf8mb4), 'Neutral', 3, 'active'),
  (CAST(UNHEX('F09F9981') AS CHAR CHARACTER SET utf8mb4), 'Dissatisfied', 2, 'active'),
  (CAST(UNHEX('F09F989E') AS CHAR CHARACTER SET utf8mb4), 'Very Dissatisfied', 1, 'inactive')
ON DUPLICATE KEY UPDATE
  emoji = VALUES(emoji),
  name = VALUES(name),
  status = VALUES(status);
