-- ============================================================
-- KlimAlert PH · 003 · Evacuation centers & alerts
-- ============================================================

USE klimalert_ph;

CREATE TABLE IF NOT EXISTS evacuation_centers (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(160) NOT NULL,
  barangay_id  SMALLINT UNSIGNED NOT NULL,
  address      VARCHAR(255) NULL,
  contact      VARCHAR(40)  NULL,
  capacity     INT UNSIGNED NOT NULL DEFAULT 0,
  occupancy    INT UNSIGNED NOT NULL DEFAULT 0,
  latitude     DECIMAL(10,7) NOT NULL,
  longitude    DECIMAL(10,7) NOT NULL,
  facilities   JSON NULL COMMENT 'e.g. ["Medical","Power","Water","WiFi"]',
  status       ENUM('open','limited','full','closed') NOT NULL DEFAULT 'open',
  updated_by   INT UNSIGNED NULL,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evac_barangay (barangay_id),
  KEY idx_evac_status (status),
  CONSTRAINT fk_evac_barangay FOREIGN KEY (barangay_id)
    REFERENCES barangays(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_evac_updater FOREIGN KEY (updated_by)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View used by the public locator: only centers with available capacity.
-- IMPORTANT: matches the instructor's requirement that FULL/CLOSED never appear.
CREATE OR REPLACE VIEW v_available_evac_centers AS
SELECT
  ec.id, ec.name, b.name AS barangay, ec.address, ec.contact,
  ec.capacity, ec.occupancy,
  GREATEST(ec.capacity - ec.occupancy, 0) AS slots_open,
  ec.latitude, ec.longitude, ec.facilities, ec.status, ec.updated_at
FROM evacuation_centers ec
JOIN barangays b ON b.id = ec.barangay_id
WHERE ec.status IN ('open','limited');

-- ----------------------------------------------------------
-- Alerts feed (PAGASA bulletins, LGU broadcasts, community)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  source       ENUM('pagasa','phivolcs','ndrrmc','lgu','community') NOT NULL,
  hazard_type  ENUM('typhoon','flood','earthquake','tsunami','fire','landslide','heat','other')
                 NOT NULL,
  severity     ENUM('info','advisory','warning','critical') NOT NULL,
  title        VARCHAR(180) NOT NULL,
  message      TEXT NOT NULL,
  area_scope   VARCHAR(120) NULL COMMENT 'barangay name, "Olongapo", or "Region III"',
  issued_at    DATETIME NOT NULL,
  expires_at   DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_alerts_severity (severity),
  KEY idx_alerts_issued (issued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
