<?php
/**
 * POST /reports/create.php   (multipart/form-data — for the optional photo)
 *
 * Fields: hazard_type, severity, barangay, landmark, description, anonymous,
 *         latitude, longitude, photo (file)
 *
 * Anyone can submit; if logged in, the report is tied to their user_id
 * unless `anonymous=1`.
 */

declare(strict_types=1);
require_once __DIR__ . '/../lib/session.php';

apply_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_err(405, 'POST required.');
rate_limit('report', 30, 600);

$me = session_current_user();   // may be null

$type        = strtolower((string)($_POST['hazard_type'] ?? ''));
$severity    = strtolower((string)($_POST['severity'] ?? 'moderate'));
$barangay    = trim((string)($_POST['barangay'] ?? ''));
$landmark    = trim((string)($_POST['landmark'] ?? '')) ?: null;
$description = trim((string)($_POST['description'] ?? ''));
$anonymous   = !empty($_POST['anonymous']) && $_POST['anonymous'] !== '0';
$lat         = isset($_POST['latitude'])  ? (float) $_POST['latitude']  : null;
$lng         = isset($_POST['longitude']) ? (float) $_POST['longitude'] : null;

$validTypes  = ['flood','fire','landslide','fallen_tree','road_blocked','power_outage','other'];
$validSev    = ['low','moderate','high','critical'];

if (!in_array($type, $validTypes, true))   json_err(422, 'Invalid hazard type.');
if (!in_array($severity, $validSev, true)) json_err(422, 'Invalid severity.');
if ($description === '' || mb_strlen($description) > 500) {
    json_err(422, 'Description must be 1–500 characters.');
}
$bId = barangay_id_by_name($barangay);
if (!$bId) json_err(422, 'Please select a valid Olongapo barangay.');

// ---- Optional photo upload ----
$photoPath = null;
if (!empty($_FILES['photo']['tmp_name'])) {
    $f = $_FILES['photo'];
    if ($f['error'] !== UPLOAD_ERR_OK) json_err(400, 'Photo upload failed.');
    if ($f['size'] > UPLOAD_MAX_KB * 1024) json_err(413, 'Photo larger than 5 MB.');

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = (string) $finfo->file($f['tmp_name']);
    if (!in_array($mime, UPLOAD_TYPES, true)) json_err(415, 'Photo must be JPG or PNG.');

    if (!is_dir(UPLOAD_DIR)) @mkdir(UPLOAD_DIR, 0775, true);
    $ext  = $mime === 'image/png' ? 'png' : 'jpg';
    $name = date('Ymd') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = UPLOAD_DIR . '/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) json_err(500, 'Could not save photo.');
    $photoPath = 'uploads/' . $name;
}

// ---- Insert ----
db()->prepare(
    'INSERT INTO hazard_reports
       (reporter_id, is_anonymous, hazard_type, severity, barangay_id, landmark,
        description, photo_path, latitude, longitude, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")'
)->execute([
    $anonymous ? null : ($me['id'] ?? null),
    $anonymous ? 1 : 0,
    $type,
    $severity,
    $bId,
    $landmark,
    $description,
    $photoPath,
    $lat,
    $lng,
]);

$id = (int) db()->lastInsertId();
audit('report_create', $me['id'] ?? null, 'hazard_reports', $id, [
    'type' => $type, 'severity' => $severity, 'barangay' => $barangay,
]);

json_response(201, ['ok' => true, 'id' => $id]);
