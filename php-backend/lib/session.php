<?php
/**
 * Server-side session management for KlimAlert PH.
 *
 * Why not just session_start()?
 * - We want a row per session so admins can see who is logged in and we can
 *   revoke a single device without invalidating everyone.
 * - We hash the token at rest so a leaked DB cannot be used to impersonate.
 * - The cookie is HttpOnly + SameSite=Lax + Secure (in production).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

function session_create_for_user(int $userId): string
{
    $sid    = bin2hex(random_bytes(16));   // 32 hex chars; cookie value
    $secret = bin2hex(random_bytes(32));   // 64 hex chars; never sent
    $hash   = hash('sha256', $secret);

    db()->prepare(
        'INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))'
    )->execute([
        $sid,
        $userId,
        $hash,
        $_SERVER['REMOTE_ADDR']     ?? null,
        substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
        SESSION_TTL_SEC,
    ]);

    // Cookie value is "<sid>.<secret>".
    $cookieValue = $sid . '.' . $secret;
    setcookie(SESSION_COOKIE, $cookieValue, [
        'expires'  => time() + SESSION_TTL_SEC,
        'path'     => '/',
        'domain'   => '',
        'secure'   => APP_ENV === 'production',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    return $cookieValue;
}

function session_destroy_current(): void
{
    $cookie = $_COOKIE[SESSION_COOKIE] ?? '';
    if ($cookie && str_contains($cookie, '.')) {
        [$sid] = explode('.', $cookie, 2);
        try {
            db()->prepare('DELETE FROM sessions WHERE id = ?')->execute([$sid]);
        } catch (Throwable $e) { /* ignore */ }
    }
    setcookie(SESSION_COOKIE, '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/** Returns the user row (assoc array) when authenticated, otherwise null. */
function session_current_user(): ?array
{
    $cookie = $_COOKIE[SESSION_COOKIE] ?? '';
    if (!$cookie || !str_contains($cookie, '.')) return null;

    [$sid, $secret] = explode('.', $cookie, 2);
    if (strlen($sid) !== 32 || strlen($secret) !== 64) return null;

    $stmt = db()->prepare(
        'SELECT s.id AS sid, s.token_hash, s.expires_at, u.*
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id = ? LIMIT 1'
    );
    $stmt->execute([$sid]);
    $row = $stmt->fetch();
    if (!$row) return null;

    // Expired?
    if (strtotime((string)$row['expires_at']) < time()) {
        db()->prepare('DELETE FROM sessions WHERE id = ?')->execute([$sid]);
        return null;
    }

    // Constant-time compare so timing attacks cannot leak the secret.
    if (!hash_equals((string)$row['token_hash'], hash('sha256', $secret))) {
        return null;
    }

    if (!(int)$row['is_active']) return null;

    // Bump last_seen at most every SESSION_REFRESH seconds.
    db()->prepare(
        'UPDATE sessions SET last_seen_at = NOW()
         WHERE id = ? AND TIMESTAMPDIFF(SECOND, last_seen_at, NOW()) > ?'
    )->execute([$sid, SESSION_REFRESH]);

    // Strip the password hash before returning to callers.
    unset($row['password_hash']);
    return $row;
}

/** Convenience guard for protected endpoints. */
function require_login(): array
{
    $u = session_current_user();
    if (!$u) {
        json_err(401, 'Not authenticated.');
    }
    return $u;
}

function require_role(array $roles): array
{
    $u = require_login();
    if (!in_array($u['role'], $roles, true)) {
        json_err(403, 'Forbidden.');
    }
    return $u;
}
