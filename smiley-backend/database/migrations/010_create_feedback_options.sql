CREATE TABLE IF NOT EXISTS feedback_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rating_id INT NOT NULL,
  label VARCHAR(150) NOT NULL,
  requires_text TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT feedback_options_rating_fk FOREIGN KEY (rating_id) REFERENCES ratings(id),
  UNIQUE KEY feedback_options_rating_label_unique (rating_id, label),
  INDEX feedback_options_rating_status (rating_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE votes
  ADD COLUMN feedback_option_id INT NULL AFTER terminal_id,
  ADD CONSTRAINT votes_feedback_option_fk FOREIGN KEY (feedback_option_id) REFERENCES feedback_options(id),
  ADD INDEX votes_feedback_option_created (feedback_option_id, created_at);

INSERT INTO feedback_options (rating_id, label, requires_text, status)
SELECT r.id, seed.label, seed.requires_text, 'active'
FROM ratings r
JOIN (
  SELECT 5 AS rating_value, 'Accessible support services' AS label, 0 AS requires_text UNION ALL
  SELECT 5, 'Inclusive activities', 0 UNION ALL
  SELECT 5, 'Comfortable facilities', 0 UNION ALL
  SELECT 5, 'Effective counseling/workshops', 0 UNION ALL
  SELECT 5, 'Timely assistance', 0 UNION ALL
  SELECT 5, 'Friendly Staff', 0 UNION ALL
  SELECT 5, 'Engaging student programs/events', 0 UNION ALL
  SELECT 5, 'Comprehensive resources', 0 UNION ALL
  SELECT 5, 'Exceptional support', 0 UNION ALL
  SELECT 5, 'Well-structured policies', 0 UNION ALL
  SELECT 5, 'Others. Please Specify', 1 UNION ALL
  SELECT 4, 'Improve support services', 0 UNION ALL
  SELECT 4, 'Make activities inclusive', 0 UNION ALL
  SELECT 4, 'Enhance facilities', 0 UNION ALL
  SELECT 4, 'Improve counseling/workshops', 0 UNION ALL
  SELECT 4, 'Provide timely assistance', 0 UNION ALL
  SELECT 4, 'Train staff to be friendly', 0 UNION ALL
  SELECT 4, 'Make programs/events engaging', 0 UNION ALL
  SELECT 4, 'Expand resources', 0 UNION ALL
  SELECT 4, 'Strengthen support', 0 UNION ALL
  SELECT 4, 'Organize policies', 0 UNION ALL
  SELECT 4, 'Others. Please Specify', 1 UNION ALL
  SELECT 3, 'Limited support services', 0 UNION ALL
  SELECT 3, 'Exclusive activities', 0 UNION ALL
  SELECT 3, 'Uncomfortable facilities', 0 UNION ALL
  SELECT 3, 'Ineffective counseling/workshops', 0 UNION ALL
  SELECT 3, 'Delayed assistance', 0 UNION ALL
  SELECT 3, 'Unfriendly staff', 0 UNION ALL
  SELECT 3, 'Unengaging programs/events', 0 UNION ALL
  SELECT 3, 'Insufficient resources', 0 UNION ALL
  SELECT 3, 'Poor support', 0 UNION ALL
  SELECT 3, 'Disorganized policies', 0 UNION ALL
  SELECT 3, 'Others. Please Specify', 1 UNION ALL
  SELECT 2, 'Limited support services', 0 UNION ALL
  SELECT 2, 'Exclusive activities', 0 UNION ALL
  SELECT 2, 'Uncomfortable facilities', 0 UNION ALL
  SELECT 2, 'Ineffective counseling/workshops', 0 UNION ALL
  SELECT 2, 'Delayed assistance', 0 UNION ALL
  SELECT 2, 'Unfriendly staff', 0 UNION ALL
  SELECT 2, 'Unengaging programs/events', 0 UNION ALL
  SELECT 2, 'Insufficient resources', 0 UNION ALL
  SELECT 2, 'Poor support', 0 UNION ALL
  SELECT 2, 'Disorganized policies', 0 UNION ALL
  SELECT 2, 'Others. Please Specify', 1
) seed ON seed.rating_value = r.value
ON DUPLICATE KEY UPDATE
  requires_text = VALUES(requires_text),
  status = VALUES(status);