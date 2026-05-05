-- ============================================================
-- KlimAlert PH · 001 · Users & Sessions
-- Capstone: Christopher V. Lazatin · Gordon College · BSIT 2nd Yr.
-- Run on MySQL 5.7+ / MariaDB 10.4+
-- ============================================================

CREATE DATABASE IF NOT EXISTS klimalert_ph
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE klimalert_ph;

-- ----------------------------------------------------------
-- Barangays of Olongapo (lookup table; never trust client)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS barangays (
  id            SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(60) NOT NULL,
  city          VARCHAR(60) NOT NULL DEFAULT 'Olongapo',
  province      VARCHAR(60) NOT NULL DEFAULT 'Zambales',
  PRIMARY KEY (id),
  UNIQUE KEY uk_barangays_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO barangays (name) VALUES
  ('Asinan'), ('Banicain'), ('Barretto'), ('East Bajac-Bajac'),
  ('East Tapinac'), ('Gordon Heights'), ('Kalaklan'), ('Mabayuan'),
  ('New Cabalan'), ('New Ilalim'), ('New Kababae'), ('New Kalalake'),
  ('Old Cabalan'), ('Pag-asa'), ('Santa Rita'), ('West Bajac-Bajac'),
  ('West Tapinac');

-- ----------------------------------------------------------
-- Users (passwords stored ONLY as bcrypt hash via PHP password_hash)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL,
  mobile          VARCHAR(20)  NULL,
  password_hash   VARCHAR(255) NOT NULL COMMENT 'bcrypt via password_hash() — never store plaintext',
  role            ENUM('citizen','volunteer','lgu','admin') NOT NULL DEFAULT 'citizen',
  barangay_id     SMALLINT UNSIGNED NULL,
  email_verified  TINYINT(1) NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until    DATETIME NULL,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_barangay (barangay_id),
  CONSTRAINT fk_users_barangay FOREIGN KEY (barangay_id)
    REFERENCES barangays(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Sessions (server-side; the cookie only holds a random token)
-- Token is hashed at rest so a DB leak cannot grant logins.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id           CHAR(32) NOT NULL COMMENT 'random hex; sent to client as cookie',
  user_id      INT UNSIGNED NOT NULL,
  token_hash   CHAR(64) NOT NULL COMMENT 'sha256 of the random session secret',
  ip_address   VARCHAR(45) NULL,
  user_agent   VARCHAR(255) NULL,
  expires_at   DATETIME NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Audit log (admin tracing; minimal PII)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NULL,
  action     VARCHAR(60)  NOT NULL,
  entity     VARCHAR(60)  NULL,
  entity_id  VARCHAR(60)  NULL,
  meta_json  JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_action (action),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
