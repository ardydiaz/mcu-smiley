ALTER TABLE users
  MODIFY password VARCHAR(255) NULL,
  MODIFY role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  MODIFY status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
  ADD COLUMN provider VARCHAR(50) NOT NULL DEFAULT 'local' AFTER status,
  ADD COLUMN provider_user_id VARCHAR(255) NULL AFTER provider,
  ADD COLUMN last_login_at TIMESTAMP NULL AFTER provider_user_id,
  ADD UNIQUE KEY users_provider_subject_unique (provider, provider_user_id),
  ADD INDEX users_role_status (role, status);
