<?php
declare(strict_types=1);

header('Content-Type: application/linkset+json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('Vary: Accept');

$path = __DIR__ . '/api-catalog';
if (!is_readable($path)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":false,"error":"api-catalog missing"}';
    exit;
}

readfile($path);
