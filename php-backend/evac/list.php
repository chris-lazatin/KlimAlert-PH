<?php
/**
 * GET /evac/list.php
 *
 * Public list of AVAILABLE evacuation centers.
 * Backed by the v_available_evac_centers VIEW which already filters out
 * FULL and CLOSED centers — matching the instructor's requirement.
 */

declare(strict_types=1);
require_once __DIR__ . '/../lib/helpers.php';

apply_cors();

$rows = db()->query(
    'SELECT id, name, barangay, address, contact, capacity, occupancy, slots_open,
            latitude, longitude, facilities, status, updated_at
     FROM v_available_evac_centers
     ORDER BY slots_open DESC'
)->fetchAll();

// `facilities` is JSON in MySQL; decode for the client.
foreach ($rows as &$r) {
    if (isset($r['facilities']) && is_string($r['facilities'])) {
        $r['facilities'] = json_decode($r['facilities'], true) ?? [];
    }
}
unset($r);

json_ok(['centers' => $rows]);
