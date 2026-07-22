<?php
declare(strict_types=1);
require __DIR__ . '/content-negotiate.inc.php';

$link = '</case.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"';
if (studio_accepts_markdown()) {
    studio_send_markdown(__DIR__ . '/case.md', $link);
}
studio_send_html(__DIR__ . '/case.html', $link);
