<?php
/**
 * POST /auth/login.php
 * Body: email, password
 *
 * Sets the session cookie on success.
 * Locks an account for 15 minutes after 5 failed attempts.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/session.php';

apply_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_err(405, 'POST required.');

rate_limit('login', 20, 600);   // 20 attempts per IP per 10 min

$in       = read_input();
$email    = strtolower(trim((string)($in['email'] ?? '')));
$password = (string)($in['password'] ?? '');

if ($email === '' || $password === '') json_err(422, 'Email and password are required.');

$stmt = db()->prepare(
    'SELECT id, full_name, email, password_hash, role, barangay_id, is_active,
            failed_attempts, locked_until
     FROM users WHERE email = ? LIMIT 1'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

// Generic message for both "no such user" and "wrong password" so attackers
// can't enumerate valid emails.
$genericFail = function (): void { json_err(401, 'Invalid email or password.'); };

if (!$user)                                   $genericFail();
if ($user['locked_until'] && strtotime((string)$user['locked_until']) > time()) {
    json_err(423, 'Account temporarily locked. Try again later.');
}

if (!password_verify($password, (string) $user['password_hash'])) {
    $attempts = ((int) $user['failed_attempts']) + 1;
    $lockSql  = $attempts >= 5
        ? ', locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE), failed_attempts = 0'
        : ', failed_attempts = ?';
    if ($attempts >= 5) {
        db()->prepare("UPDATE users SET updated_at = NOW() $lockSql WHERE id = ?")
            ->execute([$user['id']]);
        audit('login_locked', (int)$user['id']);
    } else {
        db()->prepare("UPDATE users SET updated_at = NOW() $lockSql WHERE id = ?")
            ->execute([$attempts, $user['id']]);
    }
    audit('login_failed', (int)$user['id']);
    $genericFail();
}

// Password is correct — but if the account is still awaiting admin approval
// we tell the user clearly instead of pretending the credentials were wrong.
// (Safe: a correct password already proves the account exists, so this does
// not become an email-enumeration vector.)
if (!(int) $user['is_active']) {
    audit('login_pending', (int)$user['id']);
    json_err(403, 'Account is awaiting admin verification. You will be notified once approved.', [
        'status' => 'pending',
        'role'   => $user['role'],
    ]);
}

// Optional: re-hash if PHP recommends a stronger algorithm.
if (password_needs_rehash((string) $user['password_hash'], PASSWORD_BCRYPT)) {
    $newHash = password_hash($password, PASSWORD_BCRYPT);
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        ->execute([$newHash, $user['id']]);
}

db()->prepare(
    'UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW()
     WHERE id = ?'
)->execute([$user['id']]);

session_create_for_user((int) $user['id']);
audit('login_ok', (int)$user['id']);

json_ok([
    'user' => [
        'id'       => (int) $user['id'],
        'name'     => $user['full_name'],
        'email'    => $user['email'],
        'role'     => $user['role'],
    ],
]);
