<?php
/**
 * POST /auth/approve.php
 *
 * Admin-only. Approve or reject a pending volunteer / LGU registration.
 *
 * Body (JSON):
 *   id     : user id (int, required)
 *   action : 'approve' | 'reject' (required)
 *   note   : free-text reason (optional, recorded in audit_log)
 *
 * approve → flips is_active = 1, the user can now sign in.
 * reject  → deletes the user row (cascades sessions). The applicant is
 *           free to register again, optionally with corrected info.
 *
 * Both branches write to audit_log so the Admin dashboard can surface
 * who approved which account and when.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/session.php';

apply_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_err(405, 'POST required.');

$admin = require_role(['admin']);

$in     = read_input();
$id     = (int)   ($in['id'] ?? 0);
$action = strtolower((string)($in['action'] ?? ''));
$note   = str_field($in, 'note', 280, false);

if ($id <= 0)                                json_err(422, 'Valid user id is required.');
if (!in_array($action, ['approve','reject'], true)) {
    json_err(422, "Action must be 'approve' or 'reject'.");
}

// Make sure the target user is actually a pending volunteer / LGU.
// Approving an admin or a citizen via this endpoint is not allowed —
// citizens are already active and admins are out of scope by design.
$stmt = db()->prepare(
    'SELECT id, full_name, email, role, is_active
       FROM users
      WHERE id = ?
        AND role IN (\'volunteer\',\'lgu\')
        AND is_active = 0
      LIMIT 1'
);
$stmt->execute([$id]);
$target = $stmt->fetch();

if (!$target) {
    json_err(404, 'No pending account with that id was found.');
}

try {
    if ($action === 'approve') {
        db()->prepare('UPDATE users SET is_active = 1 WHERE id = ?')->execute([$id]);
        audit('user_approved', (int)$admin['id'], 'users', $id, [
            'role'  => $target['role'],
            'email' => $target['email'],
            'note'  => $note,
        ]);

        json_ok([
            'id'     => $id,
            'status' => 'approved',
            'user'   => [
                'id'    => $id,
                'name'  => (string) $target['full_name'],
                'email' => (string) $target['email'],
                'role'  => (string) $target['role'],
            ],
        ]);
    }

    // Reject path: remove the row entirely. ON DELETE CASCADE on `sessions`
    // will clean up any login attempts; audit_log keeps the trail because
    // it has ON DELETE SET NULL.
    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    audit('user_rejected', (int)$admin['id'], 'users', $id, [
        'role'  => $target['role'],
        'email' => $target['email'],
        'note'  => $note,
    ]);

    json_ok([
        'id'     => $id,
        'status' => 'rejected',
    ]);
} catch (PDOException $e) {
    json_err(500, APP_ENV === 'development' ? $e->getMessage() : 'Could not update account.');
}
