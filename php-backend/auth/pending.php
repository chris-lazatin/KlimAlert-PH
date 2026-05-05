<?php
/**
 * GET /auth/pending.php
 *
 * Admin-only. Returns the list of volunteer / LGU accounts that are still
 * awaiting verification (is_active = 0). Citizens are never included —
 * they auto-activate at registration time.
 *
 * Optional query params:
 *   role     : filter to a single role (volunteer | lgu)
 *   barangay : filter to a single barangay name
 *   limit    : max rows to return (default 100, hard cap 500)
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/session.php';

apply_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') json_err(405, 'GET required.');

require_role(['admin']);

$role     = strtolower((string)($_GET['role'] ?? ''));
$barangay = trim((string)($_GET['barangay'] ?? ''));
$limit    = max(1, min(500, (int)($_GET['limit'] ?? 100)));

// All filtering happens on the v_pending_approvals view created in
// migration 005, so the "is_active = 0 AND role IN (...)" rule lives
// in exactly one place.
$where  = ['1 = 1'];
$params = [];

if (in_array($role, ['volunteer', 'lgu'], true)) {
    $where[] = 'role = ?';
    $params[] = $role;
}
if ($barangay !== '') {
    $where[] = 'barangay = ?';
    $params[] = $barangay;
}

$sql = 'SELECT id, full_name, email, mobile, role, created_at, barangay
          FROM v_pending_approvals
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY created_at ASC
         LIMIT ' . $limit;

$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$pending = array_map(static function (array $r): array {
    return [
        'id'         => (int) $r['id'],
        'name'       => (string) $r['full_name'],
        'email'      => (string) $r['email'],
        'mobile'     => $r['mobile'] !== null ? (string) $r['mobile'] : null,
        'role'       => (string) $r['role'],
        'barangay'   => $r['barangay'] !== null ? (string) $r['barangay'] : null,
        'created_at' => (string) $r['created_at'],
    ];
}, $rows);

// Per-role counts so the dashboard can show "3 volunteers · 1 LGU" at a glance
// without a second round-trip.
$counts = ['volunteer' => 0, 'lgu' => 0];
foreach ($pending as $p) {
    $counts[$p['role']] = ($counts[$p['role']] ?? 0) + 1;
}

json_ok([
    'pending' => $pending,
    'counts'  => $counts,
    'total'   => count($pending),
]);
