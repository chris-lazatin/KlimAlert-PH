<?php
declare(strict_types=1);
require_once __DIR__ . '/../lib/session.php';

apply_cors();
session_destroy_current();
json_ok();
