-- ============================================================
-- KlimAlert PH · 002 · Hazard reports
-- ============================================================

USE klimalert_ph;

CREATE TABLE IF NOT EXISTS hazard_reports (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reporter_id  INT UNSIGNED NULL COMMENT 'NULL when reporter is anonymous',
  is_anonymous TINYINT(1) NOT NULL DEFAULT 0,
  hazard_type  ENUM('flood','fire','landslide','fallen_tree','road_blocked','power_outage','other')
                 NOT NULL,
  severity     ENUM('low','moderate','high','critical') NOT NULL DEFAULT 'moderate',
  barangay_id  SMALLINT UNSIGNED NOT NULL,
  landmark     VARCHAR(180) NULL,
  description  TEXT NOT NULL,
  photo_path   VARCHAR(255) NULL COMMENT 'relative path under /uploads',
  latitude     DECIMAL(10,7) NULL,
  longitude    DECIMAL(10,7) NULL,
  status       ENUM('pending','verified','resolved','dismissed') NOT NULL DEFAULT 'pending',
  verified_by  INT UNSIGNED NULL,
  verified_at  DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_status (status),
  KEY idx_reports_barangay (barangay_id),
  KEY idx_reports_type (hazard_type),
  KEY idx_reports_created (created_at),
  CONSTRAINT fk_reports_user FOREIGN KEY (reporter_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_reports_barangay FOREIGN KEY (barangay_id)
    REFERENCES barangays(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reports_verifier FOREIGN KEY (verified_by)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Confirmations let neighbors corroborate a report (one per user per report).
CREATE TABLE IF NOT EXISTS hazard_confirmations (
  report_id  BIGINT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id, user_id),
  CONSTRAINT fk_confirm_report FOREIGN KEY (report_id)
    REFERENCES hazard_reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_confirm_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
