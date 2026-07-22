<?php
declare(strict_types=1);

require __DIR__ . '/content-negotiate.inc.php';

$link =
    '</.well-known/api-catalog>; rel="api-catalog", ' .
    '</llms.txt>; rel="describedby", ' .
    '</sitemap.xml>; rel="describedby", ' .
    '</auth.md>; rel="alternate"; type="text/markdown", ' .
    '</index.md>; rel="alternate"; type="text/markdown"';

if (studio_accepts_markdown()) {
    studio_send_markdown(__DIR__ . '/index.md', $link);
}

studio_send_html(__DIR__ . '/home.html', $link);
