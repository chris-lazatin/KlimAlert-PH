<?php
/**
 * KlimAlert PH · Database & app configuration
 *
 * Edit the constants below to match your XAMPP/LAMP setup.
 * NEVER commit a real DB password to a public repo — use a .env or a
 * config.local.php that is .gitignored when you go to production.
 */

declare(strict_types=1);

// ---------- Environment ----------
const APP_NAME       = 'KlimAlert PH';
const APP_ENV        = 'development';   // 'production' on deploy
const APP_TIMEZONE   = 'Asia/Manila';
const APP_BASE_URL   = 'http://localhost';

// Front end origin allowed to call the API (change in production).
const ALLOWED_ORIGIN = 'http://localhost:3000';

// ---------- Database (MySQL via PDO) ----------
const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;
const DB_NAME = 'klimalert_ph';
const DB_USER = 'root';
const DB_PASS = '';     // set in your local XAMPP MySQL; blank by default
const DB_CHARSET = 'utf8mb4';

// ---------- Sessions ----------
const SESSION_COOKIE  = 'klimalert_sid';
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;     // 7 days
const SESSION_REFRESH = 60 * 30;              // bump last_seen every 30 min

// ---------- Uploads ----------
const UPLOAD_DIR     = __DIR__ . '/uploads';
const UPLOAD_MAX_KB  = 5120;                    // 5 MB
const UPLOAD_TYPES   = ['image/jpeg', 'image/png'];

date_default_timezone_set(APP_TIMEZONE);

/**
 * Single, lazily-created PDO instance.
 *
 * Using prepared statements via PDO with ATTR_EMULATE_PREPARES=false
 * is the recommended way to prevent SQL injection in PHP.
 */
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_CHARSET
    );

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,   // real prepared statements
            PDO::MYSQL_ATTR_INIT_COMMAND =>
                "SET sql_mode='STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION', time_zone='+08:00'",
        ]);
    } catch (PDOException $e) {
        // In dev we want the message; in prod we hide it.
        http_response_code(500);
        if (APP_ENV === 'development') {
            header('Content-Type: application/json');
            echo json_encode(['ok' => false, 'error' => 'DB connect failed: ' . $e->getMessage()]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(['ok' => false, 'error' => 'Database temporarily unavailable.']);
        }
        exit;
    }

    return $pdo;
}
