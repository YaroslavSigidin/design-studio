<?php
declare(strict_types=1);

/**
 * Same-origin lead endpoint for Timeweb (PHP).
 * Accepts JSON or multipart/form-data with attachments[] (photo / video / files).
 * Delivers to Telegram via Bot API.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Vary: Origin');

const ERROR_VALIDATION = 'VALIDATION_ERROR';
const ERROR_RATE = 'RATE_LIMITED';
const ERROR_DELIVERY = 'DELIVERY_FAILED';
const ERROR_ATTACHMENT = 'ATTACHMENT_REJECTED';

$requestId = bin2hex(random_bytes(8));

$send = static function (int $status, array $payload, string $origin = '') use ($requestId): void {
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    http_response_code($status);
    if (!isset($payload['requestId'])) {
        $payload['requestId'] = $requestId;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
};

$loadConfig = static function (): array {
    $candidates = [
        dirname(__DIR__, 2) . '/leads.config.php', // /home/c/.../leads.config.php
        dirname(__DIR__) . '/../leads.config.php',
        __DIR__ . '/leads.config.php',
    ];
    foreach ($candidates as $path) {
        $real = realpath($path);
        if ($real && is_readable($real)) {
            $config = require $real;
            if (is_array($config)) {
                return $config;
            }
        }
    }
    return [];
};

$normalizeOrigin = static function (string $raw): string {
    $raw = trim($raw);
    if ($raw === '' || $raw === '*') {
        return '';
    }
    $parts = parse_url($raw);
    if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
        return '';
    }
    $origin = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
    if (!empty($parts['port'])) {
        $origin .= ':' . $parts['port'];
    }
    return $origin;
};

$selfOrigin = static function () use ($normalizeOrigin): string {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    $host = (string) ($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '');
    if ($host === '') {
        return '';
    }
    return $normalizeOrigin(($https ? 'https' : 'http') . '://' . $host);
};

$config = $loadConfig();
$token = trim((string) ($config['telegram_bot_token'] ?? ''));
$chatId = trim((string) ($config['telegram_chat_id'] ?? ''));
$maxFiles = (int) ($config['max_files'] ?? 8);
$maxFileBytes = (int) ($config['max_file_bytes'] ?? (20 * 1024 * 1024));
$rateMax = (int) ($config['rate_limit_max'] ?? 12);
$rateWindow = (int) ($config['rate_limit_window_seconds'] ?? 900);
$allowedOrigins = array_values(array_filter(array_map(
    static fn ($value) => $normalizeOrigin((string) $value),
    (array) ($config['allowed_origins'] ?? [])
)));

$originHeader = $normalizeOrigin((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
$self = $selfOrigin();
$originAllowed = $originHeader === ''
    || $originHeader === $self
    || in_array($originHeader, $allowedOrigins, true);
$corsOrigin = ($originHeader !== '' && $originAllowed) ? $originHeader : '';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($originHeader !== '' && !$originAllowed) {
        $send(403, ['ok' => false, 'code' => ERROR_VALIDATION, 'error' => 'Origin not allowed']);
    }
    $send(204, ['ok' => true], $corsOrigin);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $send(405, ['ok' => false, 'code' => ERROR_VALIDATION, 'error' => 'Method not allowed'], $corsOrigin);
}

if ($originHeader !== '' && !$originAllowed) {
    $send(403, ['ok' => false, 'code' => ERROR_VALIDATION, 'error' => 'Origin not allowed']);
}

if ($token === '' || $chatId === '') {
    $send(503, [
        'ok' => false,
        'code' => ERROR_DELIVERY,
        'error' => 'Lead delivery is not configured on the server.',
    ], $corsOrigin);
}

$clientIp = (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
$clientIp = trim(explode(',', $clientIp)[0]);

$rateFile = sys_get_temp_dir() . '/soglasovano-leads-rate.json';
$now = time();
$rateData = [];
if (is_readable($rateFile)) {
    $decoded = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        $rateData = $decoded;
    }
}
$bucket = [];
foreach ((array) ($rateData[$clientIp] ?? []) as $ts) {
    if (is_int($ts) && $ts > $now - $rateWindow) {
        $bucket[] = $ts;
    }
}
if (count($bucket) >= $rateMax) {
    header('Retry-After: ' . max(1, $rateWindow - ($now - ($bucket[0] ?? $now))));
    $send(429, [
        'ok' => false,
        'code' => ERROR_RATE,
        'error' => 'Слишком много запросов. Попробуйте позже.',
    ], $corsOrigin);
}
$bucket[] = $now;
$rateData[$clientIp] = $bucket;
@file_put_contents($rateFile, json_encode($rateData), LOCK_EX);

$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? ''));
$fields = [];
$files = [];

if (str_contains($contentType, 'multipart/form-data') || !empty($_FILES)) {
    $fields = $_POST;
    $rawFiles = $_FILES['attachments'] ?? $_FILES['attachments[]'] ?? null;
    if (is_array($rawFiles) && isset($rawFiles['name']) && is_array($rawFiles['name'])) {
        $count = count($rawFiles['name']);
        for ($i = 0; $i < $count; $i += 1) {
            $files[] = [
                'name' => (string) $rawFiles['name'][$i],
                'type' => (string) ($rawFiles['type'][$i] ?? ''),
                'tmp_name' => (string) $rawFiles['tmp_name'][$i],
                'error' => (int) ($rawFiles['error'][$i] ?? UPLOAD_ERR_NO_FILE),
                'size' => (int) ($rawFiles['size'][$i] ?? 0),
            ];
        }
    } elseif (is_array($rawFiles) && isset($rawFiles['tmp_name']) && is_string($rawFiles['tmp_name'])) {
        $files[] = [
            'name' => (string) $rawFiles['name'],
            'type' => (string) ($rawFiles['type'] ?? ''),
            'tmp_name' => (string) $rawFiles['tmp_name'],
            'error' => (int) ($rawFiles['error'] ?? UPLOAD_ERR_NO_FILE),
            'size' => (int) ($rawFiles['size'] ?? 0),
        ];
    }
} else {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw ?: '{}', true);
    if (!is_array($decoded)) {
        $send(400, [
            'ok' => false,
            'code' => ERROR_VALIDATION,
            'error' => 'Некорректный JSON body',
        ], $corsOrigin);
    }
    $fields = $decoded;
}

$trim = static fn ($value, int $max = 500): string => mb_substr(trim((string) ($value ?? '')), 0, $max);

$name = $trim($fields['name'] ?? '', 120);
$phone = $trim($fields['phone'] ?? '', 64);
$contact = $trim($fields['contact'] ?? '', 255);
$service = $trim($fields['service'] ?? '', 160);
$source = $trim($fields['source'] ?? '', 160);
$budget = $trim($fields['budget'] ?? '', 120);
$deadline = $trim($fields['deadline'] ?? '', 120);
$comment = $trim($fields['comment'] ?? '', 4000);
$page = $trim($fields['page'] ?? '', 500);
$website = $trim($fields['website'] ?? '', 200);
$companyUrl = $trim($fields['company_url'] ?? '', 200);
$privacy = $fields['privacy'] ?? false;
$privacyOk = $privacy === true || $privacy === 1 || $privacy === '1' || $privacy === 'true';

if ($website !== '' || $companyUrl !== '') {
    // Honeypot: pretend success.
    $send(200, ['ok' => true, 'mode' => 'accepted'], $corsOrigin);
}

if ($name === '' || (!$phone && !$contact) || !$privacyOk) {
    $send(400, [
        'ok' => false,
        'code' => ERROR_VALIDATION,
        'error' => 'Проверьте заполнение формы.',
    ], $corsOrigin);
}

if (count($files) > $maxFiles) {
    $send(400, [
        'ok' => false,
        'code' => ERROR_ATTACHMENT,
        'error' => 'Слишком много файлов. Максимум ' . $maxFiles . '.',
    ], $corsOrigin);
}

$acceptedFiles = [];
$finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : false;

foreach ($files as $file) {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        continue;
    }
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        $send(400, [
            'ok' => false,
            'code' => ERROR_ATTACHMENT,
            'error' => 'Не удалось загрузить вложение.',
        ], $corsOrigin);
    }
    if (($file['size'] ?? 0) <= 0 || ($file['size'] ?? 0) > $maxFileBytes) {
        $send(400, [
            'ok' => false,
            'code' => ERROR_ATTACHMENT,
            'error' => 'Файл слишком большой или пустой (лимит 20 МБ).',
        ], $corsOrigin);
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        $send(400, [
            'ok' => false,
            'code' => ERROR_ATTACHMENT,
            'error' => 'Вложение отклонено.',
        ], $corsOrigin);
    }

    $mime = $file['type'] ?: 'application/octet-stream';
    if ($finfo) {
        $detected = finfo_file($finfo, $file['tmp_name']);
        if (is_string($detected) && $detected !== '') {
            $mime = $detected;
        }
    }

    $acceptedFiles[] = [
        'path' => $file['tmp_name'],
        'name' => $file['name'] !== '' ? $file['name'] : 'file',
        'mime' => $mime,
        'size' => (int) $file['size'],
    ];
}

if ($finfo) {
    finfo_close($finfo);
}

$lines = [
    'Новая заявка с сайта «Согласовано»',
    'ID: ' . $requestId,
    '',
    $source !== '' ? 'Источник: ' . $source : '',
    $service !== '' ? 'Услуга: ' . $service : '',
    $name !== '' ? 'Имя: ' . $name : '',
    $phone !== '' ? 'Телефон: ' . $phone : '',
    $contact !== '' ? 'Контакт: ' . $contact : '',
    $budget !== '' ? 'Бюджет: ' . $budget : '',
    $deadline !== '' ? 'Срок: ' . $deadline : '',
    $comment !== '' ? 'Комментарий: ' . $comment : '',
    $page !== '' ? 'Страница: ' . $page : '',
];
if ($acceptedFiles) {
    $lines[] = '';
    $lines[] = 'Вложений: ' . count($acceptedFiles);
    foreach ($acceptedFiles as $index => $file) {
        $lines[] = ($index + 1) . '. ' . $file['name'] . ' (' . $file['mime'] . ')';
    }
}
$text = implode("\n", array_values(array_filter($lines, static fn ($line) => $line !== null)));
$text = mb_substr($text, 0, 3900);

$telegramCall = static function (string $method, array $postFields) use ($token): array {
    $url = 'https://api.telegram.org/bot' . $token . '/' . $method;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 60,
    ]);
    $raw = curl_exec($ch);
    $errno = curl_errno($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno !== 0 || !is_string($raw)) {
        return ['ok' => false, 'status' => $status, 'error' => 'curl'];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['ok' => false, 'status' => $status, 'error' => 'json'];
    }
    return $data;
};

$message = $telegramCall('sendMessage', [
    'chat_id' => $chatId,
    'text' => $text,
    'disable_web_page_preview' => 'true',
]);

if (($message['ok'] ?? false) !== true) {
    $send(502, [
        'ok' => false,
        'code' => ERROR_DELIVERY,
        'error' => 'Не удалось отправить заявку. Попробуйте ещё раз.',
    ], $corsOrigin);
}

$sentAttachments = 0;
$failedAttachments = 0;

foreach ($acceptedFiles as $file) {
    $mime = strtolower($file['mime']);
    $isImage = str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml';
    $isVideo = str_starts_with($mime, 'video/');
    $usePhoto = $isImage && $file['size'] <= 10 * 1024 * 1024;
    $useVideo = $isVideo && $file['size'] <= 50 * 1024 * 1024;

    if ($usePhoto) {
        $method = 'sendPhoto';
        $field = 'photo';
    } elseif ($useVideo) {
        $method = 'sendVideo';
        $field = 'video';
    } else {
        $method = 'sendDocument';
        $field = 'document';
    }

    $curlFile = new CURLFile($file['path'], $file['mime'], $file['name']);
    $result = $telegramCall($method, [
        'chat_id' => $chatId,
        $field => $curlFile,
        'caption' => mb_substr($file['name'], 0, 200),
    ]);

    if (($result['ok'] ?? false) === true) {
        $sentAttachments += 1;
    } else {
        $failedAttachments += 1;
    }
}

$send(200, [
    'ok' => true,
    'mode' => 'telegram',
    'attachmentsSent' => $sentAttachments,
    'attachmentsFailed' => $failedAttachments,
], $corsOrigin);
