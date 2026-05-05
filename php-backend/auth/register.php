<?php
/**
 * POST /auth/register.php
 * Body (JSON or form):
 *   full_name, email, mobile, password, barangay, role (citizen|volunteer|lgu)
 *
 * Citizens auto-activate and receive a session cookie.
 * Volunteer / LGU accounts insert with is_active = 0 and DO NOT receive
 * a session — they must be approved by an admin from the Admin dashboard
 * (see /auth/pending.php and /auth/approve.php) before they can sign in.
 *
 * Response:
 *   { ok: true, status: 'active'  | 'pending', user: { ... } }
 *   - 'active'  → session cookie is set, frontend redirects to /dashboard
 *   - 'pending' → no session, frontend redirects to /pending
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/session.php';

apply_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_err(405, 'POST required.');

rate_limit('register', 8, 600);   // max 8 registrations per IP per 10 min

$in = read_input();

$fullName = str_field($in, 'full_name', 120);
$email    = strtolower((string) str_field($in, 'email', 160));
$mobile   = str_field($in, 'mobile', 20, false);
$password = (string)($in['password'] ?? '');
$barangay = str_field($in, 'barangay', 60);
$role     = strtolower((string)($in['role'] ?? 'citizen'));

if (!$fullName)              json_err(422, 'Full name is required.');
if (!$email || !valid_email($email)) json_err(422, 'Valid email is required.');
if (!valid_password($password))      json_err(422, 'Password must be at least 8 chars and include a letter and a number.');
if (!in_array($role, ['citizen','volunteer','lgu'], true)) {
    // 'admin' is intentionally never self-registerable.
    json_err(422, 'Role must be citizen, volunteer, or lgu.');
}

$bId = barangay_id_by_name($barangay);
if (!$bId) json_err(422, 'Please select a valid Olongapo barangay.');

// Already registered?
$stmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) json_err(409, 'An account with this email already exists.');

// password_hash() picks bcrypt by default; cost 10 is the modern recommendation.
$hash = password_hash($password, PASSWORD_BCRYPT);

// Citizens are trusted by default; volunteer / LGU accounts require admin
// approval before they can sign in. This matches the flow described in the
// project README ("Volunteer at LGU accounts ay i-vine-verify ng City DRRMO").
$needsApproval = in_array($role, ['volunteer', 'lgu'], true);
$isActive      = $needsApproval ? 0 : 1;

try {
    db()->prepare(
        'INSERT INTO users (full_name, email, mobile, password_hash, role, barangay_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([$fullName, $email, $mobile, $hash, $role, $bId, $isActive]);
} catch (PDOException $e) {
    json_err(500, APP_ENV === 'development' ? $e->getMessage() : 'Could not create account.');
}

$userId = (int) db()->lastInsertId();

if ($needsApproval) {
    audit('register_pending', $userId, 'users', $userId, ['role' => $role, 'barangay' => $barangay]);

    json_response(202, [
        'ok'     => true,
        'status' => 'pending',
        'user'   => [
            'id'       => $userId,
            'name'     => $fullName,
            'email'    => $email,
            'role'     => $role,
            'barangay' => $barangay,
        ],
        'message' => 'Account created. Awaiting admin verification before sign-in is allowed.',
    ]);
}

// Citizen path: open a session immediately.
session_create_for_user($userId);
audit('register', $userId, 'users', $userId, ['role' => $role]);

json_response(201, [
    'ok'     => true,
    'status' => 'active',
    'user'   => [
        'id'       => $userId,
        'name'     => $fullName,
        'email'    => $email,
        'role'     => $role,
        'barangay' => $barangay,
    ],
]);
