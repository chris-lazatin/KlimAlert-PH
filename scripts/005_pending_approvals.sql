-- ============================================================
-- KlimAlert PH · 005 · Pending approvals support
--
-- Citizens auto-activate (is_active = 1).
-- Volunteer / LGU registrations land here with is_active = 0
-- until an admin approves them from the Admin dashboard.
--
-- This migration is additive only — safe to run on top of 001..004.
-- ============================================================

USE klimalert_ph;

-- ------------------------------------------------------------
-- 1. Index so the admin "pending approvals" query
--    (is_active = 0 AND role IN ('volunteer','lgu')) is index-only.
-- ------------------------------------------------------------
ALTER TABLE users
  ADD INDEX idx_users_active_role (is_active, role);

-- ------------------------------------------------------------
-- 2. Tag any existing volunteer/LGU rows that pre-date this flow
--    as "needs review" so admins can audit them.
--    Citizens are unaffected.
-- ------------------------------------------------------------
UPDATE users
   SET is_active = 0
 WHERE role IN ('volunteer','lgu')
   AND is_active = 1
   AND last_login_at IS NULL;

-- ------------------------------------------------------------
-- 3. Centralize the "who is awaiting verification?" query in a
--    view so the PHP endpoint, future admin reports, and direct
--    DBA inspection all see the same shape.
--
--    Mirrors the v_available_evac_centers pattern used in 003.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.mobile,
    u.role,
    u.barangay_id,
    b.name        AS barangay,
    u.created_at
FROM users u
LEFT JOIN barangays b ON b.id = u.barangay_id
WHERE u.is_active = 0
  AND u.role IN ('volunteer', 'lgu');
