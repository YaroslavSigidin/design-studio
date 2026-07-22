<?php
declare(strict_types=1);

/**
 * Fresh robots.txt (avoids stale CDN copies of the static file).
 */
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('CDN-Cache-Control: no-store');

echo "User-agent: *\n";
echo "Allow: /\n";
echo "Disallow: /api/\n";
echo "Disallow: /docs/\n";
echo "Disallow: /.well-known/\n";
echo "Content-Signal: search=yes, ai-train=no, ai-input=yes\n";
echo "\n";
echo "Sitemap: https://soglasovano.online/sitemap.xml\n";
