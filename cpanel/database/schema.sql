-- Realty Center cPanel / MySQL schema
-- Import this file into realtycentercom_realty through phpMyAdmin.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(40) NULL,
  role ENUM('admin','manager','advisor') NOT NULL DEFAULT 'advisor',
  status ENUM('active','inactive','suspended','left') NOT NULL DEFAULT 'active',
  force_password_change TINYINT(1) NOT NULL DEFAULT 0,
  avatar_url VARCHAR(500) NULL,
  last_login_at DATETIME NULL,
  reset_token_hash CHAR(64) NULL,
  reset_token_expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offices (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(190) NULL,
  manager_user_id CHAR(36) NULL,
  image_url VARCHAR(500) NULL,
  description TEXT NULL,
  work_hours VARCHAR(80) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_offices_manager FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_offices_location (city, district, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS office_advisors (
  office_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  is_manager TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (office_id, user_id),
  CONSTRAINT fk_office_advisors_office FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  CONSTRAINT fk_office_advisors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listings (
  id CHAR(36) NOT NULL PRIMARY KEY,
  listing_number VARCHAR(40) NOT NULL UNIQUE,
  owner_user_id CHAR(36) NOT NULL,
  office_id CHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  transaction_type ENUM('Satılık','Kiralık','Devren') NOT NULL,
  category VARCHAR(100) NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(150) NULL,
  rooms VARCHAR(30) NULL,
  area DECIMAL(12,2) NULL,
  description TEXT NULL,
  details JSON NULL,
  approval_status ENUM('draft','pending','Yayında','Reddedildi','archived') NOT NULL DEFAULT 'pending',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_listings_owner FOREIGN KEY (owner_user_id) REFERENCES users(id),
  CONSTRAINT fk_listings_office FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
  INDEX idx_listings_feed (approval_status, deleted_at, created_at),
  INDEX idx_listings_filter (city, district, category, property_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listing_media (
  id CHAR(36) NOT NULL PRIMARY KEY,
  listing_id CHAR(36) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  media_type ENUM('image','video') NOT NULL DEFAULT 'image',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_media_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_listing_media_order (listing_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS homepage_settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id CHAR(36) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
