CREATE TABLE IF NOT EXISTS user_types (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX user_types_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_types (name, status) VALUES
  ('Student', 'active'),
  ('Faculty / Employee', 'active'),
  ('Alumni', 'active'),
  ('Others', 'active')
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

ALTER TABLE votes
  ADD COLUMN user_type_id BIGINT UNSIGNED NULL AFTER rating_id;

UPDATE votes
SET user_type_id = (SELECT id FROM user_types WHERE name = 'Others' LIMIT 1)
WHERE user_type_id IS NULL;

ALTER TABLE votes
  MODIFY user_type_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE votes
  ADD CONSTRAINT votes_user_type_fk FOREIGN KEY (user_type_id) REFERENCES user_types(id);

CREATE INDEX votes_user_type_created ON votes (user_type_id, created_at);
