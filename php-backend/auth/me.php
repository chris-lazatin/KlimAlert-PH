<?php
/**
 * GET /auth/me.php → returns the currently authenticated user, or 401.
 */

declare(strict_types=1);
require_once __DIR__ . '/../lib/session.php';

apply_cors();
$u = session_current_user();
if (!$u) json_err(401, 'Not authenticated.');

// Look up barangay name for convenience.
$brgy = null;
if ($u['barangay_id']) {
    $stmt = db()->prepare('SELECT name FROM barangays WHERE id = ?');
    $stmt->execute([$u['barangay_id']]);
    $brgy = $stmt->fetchColumn() ?: null;
}

json_ok([
    'user' => [
        'id'       => (int) $u['id'],
        'name'     => $u['full_name'],
        'email'    => $u['email'],
        'mobile'   => $u['mobile'],
        'role'     => $u['role'],
        'barangay' => $brgy,
        'verified' => (bool) $u['email_verified'],
    ],
]);
