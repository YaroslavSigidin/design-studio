<?php
declare(strict_types=1);

/**
 * Ensures RFC 8288 Link headers even when the edge serves PHP for /.
 * Body is the static homepage — no visual changes.
 */
header(
    'Link: </.well-known/api-catalog>; rel="api-catalog", ' .
    '</llms.txt>; rel="describedby", ' .
    '</sitemap.xml>; rel="describedby", ' .
    '</auth.md>; rel="alternate"; type="text/markdown"'
);
header('Cache-Control: public, max-age=60');

$html = __DIR__ . '/index.html';
if (!is_readable($html)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'index.html missing';
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($html);
