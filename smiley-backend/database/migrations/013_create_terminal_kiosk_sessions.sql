CREATE TABLE IF NOT EXISTS terminal_kiosk_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terminal_id INT NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  status ENUM('active', 'released') NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP NULL,
  active_terminal_id INT GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN terminal_id ELSE NULL END) STORED,
  active_device_id VARCHAR(100) GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN device_id ELSE NULL END) STORED,
  CONSTRAINT terminal_kiosk_sessions_terminal_fk FOREIGN KEY (terminal_id) REFERENCES terminals(id),
  UNIQUE KEY terminal_kiosk_sessions_active_terminal_unique (active_terminal_id),
  UNIQUE KEY terminal_kiosk_sessions_active_device_unique (active_device_id),
  INDEX terminal_kiosk_sessions_status_seen (status, last_seen_at),
  INDEX terminal_kiosk_sessions_device_status (device_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
