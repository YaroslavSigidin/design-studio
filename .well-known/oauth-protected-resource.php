<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

$path = __DIR__ . '/oauth-protected-resource';
if (!is_readable($path)) {
    http_response_code(404);
    echo '{"error":"missing"}';
    exit;
}
readfile($path);
