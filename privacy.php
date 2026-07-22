<?php
declare(strict_types=1);
require __DIR__ . '/content-negotiate.inc.php';

$link = '</privacy.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"';
if (studio_accepts_markdown()) {
    studio_send_markdown(__DIR__ . '/privacy.md', $link);
}
studio_send_html(__DIR__ . '/privacy.html', $link);
