-- ============================================================
-- KlimAlert PH · 004 · Seed sample data (run AFTER 001-003)
-- WARNING: only run on dev DB. Passwords below are demo only.
-- ============================================================

USE klimalert_ph;

-- ----------------------------------------------------------
-- Demo accounts.
-- The hashes below were generated with: password_hash('password123', PASSWORD_BCRYPT)
-- For real seeding, generate fresh hashes from PHP and replace these.
-- ----------------------------------------------------------
INSERT IGNORE INTO users (full_name, email, mobile, password_hash, role, barangay_id, email_verified)
VALUES
  ('Christopher Lazatin','admin@klimalert.ph','09171234567',
   '$2y$10$wH8kF5o3Yw1q1mC7yVrM7eR0jq1H2yQyCq8X8Wf6sJtP3o9Z6k0Wm','admin',
   (SELECT id FROM barangays WHERE name='East Tapinac'), 1),
  ('LGU DRRMO Officer','drrmo@olongapo.gov.ph','09181234567',
   '$2y$10$wH8kF5o3Yw1q1mC7yVrM7eR0jq1H2yQyCq8X8Wf6sJtP3o9Z6k0Wm','lgu',
   (SELECT id FROM barangays WHERE name='West Bajac-Bajac'), 1),
  ('Maria Volunteer','volunteer@klimalert.ph','09191234567',
   '$2y$10$wH8kF5o3Yw1q1mC7yVrM7eR0jq1H2yQyCq8X8Wf6sJtP3o9Z6k0Wm','volunteer',
   (SELECT id FROM barangays WHERE name='Barretto'), 1),
  ('Juan Dela Cruz','citizen@klimalert.ph','09201234567',
   '$2y$10$wH8kF5o3Yw1q1mC7yVrM7eR0jq1H2yQyCq8X8Wf6sJtP3o9Z6k0Wm','citizen',
   (SELECT id FROM barangays WHERE name='Gordon Heights'), 1);

-- ----------------------------------------------------------
-- Evacuation centers (real Olongapo facilities; coordinates approximate)
-- ----------------------------------------------------------
INSERT IGNORE INTO evacuation_centers
  (name, barangay_id, address, contact, capacity, occupancy, latitude, longitude, facilities, status)
VALUES
  ('Olongapo City Convention Center', (SELECT id FROM barangays WHERE name='East Tapinac'),
   'Magsaysay Drive cor. East Tapinac', '(047) 222-2024', 800, 240, 14.83980, 120.28660,
   JSON_ARRAY('Medical','Power','Water','WiFi'), 'open'),
  ('Gordon Heights Covered Court', (SELECT id FROM barangays WHERE name='Gordon Heights'),
   'Rizal Ave., near Gordon College', '(047) 222-3015', 350, 110, 14.83210, 120.28150,
   JSON_ARRAY('Medical','Power','Water'), 'open'),
  ('West Bajac-Bajac Multi-Purpose Hall', (SELECT id FROM barangays WHERE name='West Bajac-Bajac'),
   'Otero Street', '(047) 222-3120', 420, 380, 14.83440, 120.28740,
   JSON_ARRAY('Power','Water'), 'limited'),
  ('Barretto Elementary School', (SELECT id FROM barangays WHERE name='Barretto'),
   'National Highway, Barretto', '(047) 222-4880', 600, 600, 14.86500, 120.27410,
   JSON_ARRAY('Medical','Water'), 'full'),  -- excluded from public view
  ('Mabayuan Community Hall', (SELECT id FROM barangays WHERE name='Mabayuan'),
   'Mabayuan Sitio Center', '(047) 222-5532', 280, 90, 14.85440, 120.28910,
   JSON_ARRAY('Power','Water','WiFi'), 'open'),
  ('Asinan Senior High School', (SELECT id FROM barangays WHERE name='Asinan'),
   'Asinan St.', '(047) 222-6611', 450, 130, 14.83720, 120.27860,
   JSON_ARRAY('Medical','Power'), 'open'),
  ('New Cabalan Sports Complex', (SELECT id FROM barangays WHERE name='New Cabalan'),
   'New Cabalan Hwy.', '(047) 222-7144', 700, 690, 14.84920, 120.30270,
   JSON_ARRAY('Medical','Power','Water'), 'limited'),
  ('Pag-asa Barangay Hall', (SELECT id FROM barangays WHERE name='Pag-asa'),
   'Pag-asa Center', '(047) 222-3900', 200, 200, 14.83310, 120.29100,
   JSON_ARRAY('Power'), 'closed'); -- excluded from public view

-- ----------------------------------------------------------
-- Sample alerts
-- ----------------------------------------------------------
INSERT INTO alerts (source, hazard_type, severity, title, message, area_scope, issued_at, expires_at)
VALUES
  ('pagasa','typhoon','warning','TCWS #2 raised over Zambales',
   'Severe Tropical Storm "Kiko" expected to bring heavy rains and winds 89-117 kph.',
   'Zambales', NOW() - INTERVAL 18 MINUTE, NOW() + INTERVAL 24 HOUR),
  ('lgu','flood','advisory','Flood watch — low-lying barangays',
   'Residents in flood-prone sitios advised to pre-emptively evacuate to identified centers.',
   'Olongapo', NOW() - INTERVAL 35 MINUTE, NOW() + INTERVAL 12 HOUR),
  ('community','road_blocked','info','Fallen tree on National Highway',
   'Reported by Brgy. Barretto resident; LGU clearing crew dispatched.',
   'Barretto', NOW() - INTERVAL 47 MINUTE, NOW() + INTERVAL 4 HOUR);

-- ----------------------------------------------------------
-- Sample hazard report
-- ----------------------------------------------------------
INSERT INTO hazard_reports
  (reporter_id, is_anonymous, hazard_type, severity, barangay_id, landmark, description, status)
VALUES
  ((SELECT id FROM users WHERE email='citizen@klimalert.ph'), 0,
   'flood', 'high',
   (SELECT id FROM barangays WHERE name='Gordon Heights'),
   'Rizal Ave., near Gordon College',
   'Tubig na hanggang baywang. Hindi madaanan ng tricycle papuntang highway.',
   'verified');
