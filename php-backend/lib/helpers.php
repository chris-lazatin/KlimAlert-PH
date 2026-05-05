<?php
/**
 * Tiny request/response helpers + CSRF + rate limiting.
 * Keep this file dependency-free so it loads fast on shared hosting.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

/** Send a JSON response and exit. */
function json_response(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_ok(array $data = []): void   { json_response(200, ['ok' => true]  + $data); }
function json_err(int $status, string $msg, array $extra = []): void
{
    json_response($status, ['ok' => false, 'error' => $msg] + $extra);
}

/** Apply CORS for the configured front-end origin. */
function apply_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === ALLOWED_ORIGIN) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** Read JSON body or fall back to $_POST. */
function read_input(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw !== '' && str_starts_with(trim($raw), '{')) {
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
    return $_POST ?? [];
}

/** Trim + cap string length. Pass `null` to allow optional fields. */
function str_field(array $src, string $key, int $max = 255, bool $required = true): ?string
{
    $v = trim((string)($src[$key] ?? ''));
    if ($v === '') return $required ? null : null;
    if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
    return $v;
}

function valid_email(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function valid_password(string $pw): bool
{
    // At least 8 chars, with at least one letter and one number.
    return strlen($pw) >= 8 && preg_match('/[A-Za-z]/', $pw) && preg_match('/\d/', $pw);
}

/** Look up a barangay id; returns null if invalid. */
function barangay_id_by_name(?string $name): ?int
{
    if (!$name) return null;
    $stmt = db()->prepare('SELECT id FROM barangays WHERE name = ? LIMIT 1');
    $stmt->execute([$name]);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int)$id : null;
}

/**
 * Very simple file-based rate limit; suitable for a capstone demo.
 * For production, replace with Redis or a DB-backed counter.
 */
function rate_limit(string $bucket, int $max, int $windowSec): void
{
    $key = sha1($bucket . '|' . ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
    $path = sys_get_temp_dir() . "/klimalert_rl_$key";
    $now = time();
    $hits = [];
    if (is_file($path)) {
        $hits = array_filter((array) json_decode((string) file_get_contents($path), true) ?: [],
            fn ($t) => $now - (int)$t < $windowSec);
    }
    if (count($hits) >= $max) {
        json_err(429, 'Too many attempts. Please try again later.');
    }
    $hits[] = $now;
    @file_put_contents($path, json_encode(array_values($hits)));
}

/** Insert a row into audit_log. Best-effort; never throws to the caller. */
function audit(string $action, ?int $userId = null, ?string $entity = null,
               $entityId = null, array $meta = []): void
{
    try {
        db()->prepare(
            'INSERT INTO audit_log (user_id, action, entity, entity_id, meta_json, ip_address)
             VALUES (?,?,?,?,?,?)'
        )->execute([
            $userId, $action, $entity,
            $entityId !== null ? (string)$entityId : null,
            $meta ? json_encode($meta) : null,
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    } catch (Throwable $e) {
        // Swallow — audit must never break the user-facing call.
    }
}
