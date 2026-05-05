<?php
/**
 * GET /reports/list.php?status=pending&barangay=Gordon%20Heights&limit=50
 *
 * Public read of hazard reports for the dashboard feed.
 * Anonymous reports are returned without the reporter's name.
 */

declare(strict_types=1);
require_once __DIR__ . '/../lib/helpers.php';

apply_cors();

$status   = $_GET['status']   ?? '';
$barangay = $_GET['barangay'] ?? '';
$limit    = max(1, min(200, (int) ($_GET['limit'] ?? 50)));

$where = [];
$args  = [];

if (in_array($status, ['pending','verified','resolved','dismissed'], true)) {
    $where[] = 'r.status = ?';
    $args[]  = $status;
}
if ($barangay !== '') {
    $where[] = 'b.name = ?';
    $args[]  = $barangay;
}

$sqlWhere = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
$sql = "
    SELECT  r.id, r.hazard_type, r.severity, r.landmark, r.description,
            r.photo_path, r.latitude, r.longitude, r.status, r.created_at,
            r.is_anonymous,
            CASE WHEN r.is_anonymous = 1 THEN 'Anonymous'
                 ELSE u.full_name END                AS reporter,
            COALESCE(u.role, 'citizen')              AS reporter_role,
            b.name                                   AS barangay,
            v.full_name                              AS verified_by
    FROM hazard_reports r
    JOIN barangays b ON b.id = r.barangay_id
    LEFT JOIN users  u ON u.id = r.reporter_id
    LEFT JOIN users  v ON v.id = r.verified_by
    $sqlWhere
    ORDER BY r.created_at DESC
    LIMIT $limit
";

$stmt = db()->prepare($sql);
$stmt->execute($args);
json_ok(['reports' => $stmt->fetchAll()]);
