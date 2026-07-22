<?php
declare(strict_types=1);
require __DIR__ . '/content-negotiate.inc.php';

$link = '</case.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"';
if (studio_accepts_markdown()) {
    studio_send_markdown(__DIR__ . '/case.md', $link);
}

$slug = isset($_GET['slug']) ? trim((string) $_GET['slug']) : '';
$manifestPath = __DIR__ . '/data/cases.manifest.json';
$templatePath = __DIR__ . '/case.html';
$manifest = is_readable($manifestPath)
    ? json_decode((string) file_get_contents($manifestPath), true)
    : null;
$projects = is_array($manifest) && isset($manifest['projects']) && is_array($manifest['projects'])
    ? $manifest['projects']
    : array();
$project = null;

foreach ($projects as $candidate) {
    $candidateId = isset($candidate['id']) ? (string) $candidate['id'] : '';
    $candidateKey = isset($candidate['caseKey']) ? (string) $candidate['caseKey'] : '';
    if ($slug !== '' && ($slug === $candidateId || $slug === $candidateKey)) {
        $project = $candidate;
        break;
    }
}

$html = is_readable($templatePath) ? (string) file_get_contents($templatePath) : '';
if ($html === '') {
    studio_send_html($templatePath, $link);
}

if (!is_array($project)) {
    $html = str_replace('<meta name="robots" content="index,follow" />', '<meta name="robots" content="noindex,nofollow" />', $html);
    $html = str_replace('<title>Кейс — Согласовано</title>', '<title>Кейс не найден — Согласовано</title>', $html);
    studio_send_html_content($html, $link, 404);
}

$siteUrl = 'https://soglasovano.online';
$title = trim((string) ($project['title'] ?? 'Кейс'));
$description = trim((string) ($project['description'] ?? ''));
if ($description === '') {
    $description = 'Кейс «' . $title . '» дизайн-студии Согласовано.';
}
$description = preg_replace('/\s+/u', ' ', $description);
$descriptionLength = function_exists('mb_strlen') ? mb_strlen($description) : strlen($description);
if ($descriptionLength > 160) {
    $description = (function_exists('mb_substr') ? mb_substr($description, 0, 157) : substr($description, 0, 157)) . '…';
}
$pageTitle = $title . ' — кейс UX/UI и дизайна | Согласовано';
$canonical = $siteUrl . '/case.html?slug=' . rawurlencode($slug);
$image = trim((string) ($project['image'] ?? '/assets/images/brand/og-cover.png'));
if (!preg_match('#^https?://#i', $image)) {
    $image = $siteUrl . '/' . ltrim($image, '/');
}

$escape = static function ($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
};
$replaceMeta = static function ($htmlBody, $attribute, $key, $value) use ($escape) {
    $pattern = '#<meta\s+' . preg_quote($attribute, '#') . '="' . preg_quote($key, '#') . '"\s+content="[^"]*"\s*/?>#i';
    $tag = '<meta ' . $attribute . '="' . $escape($key) . '" content="' . $escape($value) . '" />';
    return preg_replace($pattern, $tag, $htmlBody, 1);
};

$html = preg_replace('#<title>.*?</title>#is', '<title>' . $escape($pageTitle) . '</title>', $html, 1);
$html = $replaceMeta($html, 'name', 'description', $description);
$html = preg_replace('#<link\s+rel="canonical"\s+href="[^"]*"\s*/?>#i', '<link rel="canonical" href="' . $escape($canonical) . '" />', $html, 1);
$html = $replaceMeta($html, 'property', 'og:title', $pageTitle);
$html = $replaceMeta($html, 'property', 'og:description', $description);
$html = $replaceMeta($html, 'property', 'og:url', $canonical);
$html = preg_replace('#<meta\s+property="og:image"\s+content="[^"]*"\s*/?>#i', '<meta property="og:image" content="' . $escape($image) . '" />', $html, 1);
$html = $replaceMeta($html, 'name', 'twitter:title', $pageTitle);
$html = $replaceMeta($html, 'name', 'twitter:description', $description);
$html = $replaceMeta($html, 'name', 'twitter:image', $image);

$schema = array(
    '@context' => 'https://schema.org',
    '@graph' => array(
        array(
            '@type' => 'CreativeWork',
            '@id' => $canonical . '#case',
            'name' => $title,
            'headline' => $pageTitle,
            'description' => $description,
            'url' => $canonical,
            'image' => $image,
            'inLanguage' => 'ru-RU',
            'creator' => array('@id' => $siteUrl . '/#organization'),
            'keywords' => array_values(array_filter(array_merge(
                isset($project['tags']) && is_array($project['tags']) ? $project['tags'] : array(),
                isset($project['category']) ? array((string) $project['category']) : array()
            )))
        ),
        array(
            '@type' => 'BreadcrumbList',
            'itemListElement' => array(
                array('@type' => 'ListItem', 'position' => 1, 'name' => 'Главная', 'item' => $siteUrl . '/'),
                array('@type' => 'ListItem', 'position' => 2, 'name' => 'Кейсы', 'item' => $siteUrl . '/#cases'),
                array('@type' => 'ListItem', 'position' => 3, 'name' => $title, 'item' => $canonical)
            )
        )
    )
);
$schemaJson = json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
$html = str_replace('</head>', '    <script id="case-structured-data" type="application/ld+json">' . $schemaJson . '</script>' . "\n  </head>", $html);

studio_send_html_content($html, $link);
