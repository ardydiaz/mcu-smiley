CREATE TABLE IF NOT EXISTS vote_feedback_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vote_id INT NOT NULL,
  feedback_option_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT vote_feedback_options_vote_fk FOREIGN KEY (vote_id) REFERENCES votes(id),
  CONSTRAINT vote_feedback_options_option_fk FOREIGN KEY (feedback_option_id) REFERENCES feedback_options(id),
  UNIQUE KEY vote_feedback_options_unique (vote_id, feedback_option_id),
  INDEX vote_feedback_options_vote (vote_id),
  INDEX vote_feedback_options_option (feedback_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO vote_feedback_options (vote_id, feedback_option_id)
SELECT id, feedback_option_id
FROM votes
WHERE feedback_option_id IS NOT NULL;
