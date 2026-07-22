<?php
declare(strict_types=1);

/**
 * Same-origin lead endpoint for Timeweb (PHP 7.4+).
 * JSON or multipart → Telegram (sendMessage / sendPhoto / sendVideo / sendDocument).
 */

const ERROR_VALIDATION = 'VALIDATION_ERROR';
const ERROR_RATE = 'RATE_LIMITED';
const ERROR_DELIVERY = 'DELIVERY_FAILED';
const ERROR_ATTACHMENT = 'ATTACHMENT_REJECTED';

/**
 * @param mixed $value
 */
function studio_str($value, $max = 500)
{
    $text = trim((string) $value);
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, (int) $max);
    }
    return substr($text, 0, (int) $max);
}

function studio_request_id()
{
    try {
        return bin2hex(random_bytes(8));
    } catch (Exception $e) {
        return uniqid('lead_', true);
    }
}

function studio_send($status, array $payload, $origin = '', $requestId = '')
{
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    if (!isset($payload['requestId']) && $requestId !== '') {
        $payload['requestId'] = $requestId;
    }
    http_response_code((int) $status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('Vary: Origin');
    if ((int) $status !== 204) {
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    exit;
}

function studio_normalize_origin($raw)
{
    $raw = trim((string) $raw);
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
}

function studio_self_origin()
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    $host = (string) (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : ''));
    if ($host === '') {
        return '';
    }
    return studio_normalize_origin(($https ? 'https' : 'http') . '://' . $host);
}

function studio_load_config()
{
    // Prefer config inside api/ (within open_basedir). Parent path is fallback.
    $candidates = array(
        __DIR__ . '/leads.config.php',
        dirname(__DIR__) . '/../leads.config.php',
        dirname(dirname(__DIR__)) . '/leads.config.php',
    );

    foreach ($candidates as $path) {
        if (!is_file($path) || !is_readable($path)) {
            continue;
        }
        $config = include $path;
        if (is_array($config)) {
            return $config;
        }
    }

    return array();
}

function studio_telegram($token, $method, array $postFields)
{
    if (!function_exists('curl_init')) {
        return array('ok' => false, 'error' => 'curl_missing');
    }

    $url = 'https://api.telegram.org/bot' . $token . '/' . $method;
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 60,
    ));
    $raw = curl_exec($ch);
    $errno = curl_errno($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno !== 0 || !is_string($raw)) {
        return array('ok' => false, 'status' => $status, 'error' => 'curl');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return array('ok' => false, 'status' => $status, 'error' => 'json');
    }
    return $data;
}

function studio_mail_fallback($to, $requestId, $text)
{
    $to = trim((string) $to);
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL) || !function_exists('mail')) {
        return false;
    }

    $subjectText = 'Новая заявка с сайта Согласовано — ' . $requestId;
    $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
    $headers = array(
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: Soglasovano Website <no-reply@soglasovano.online>',
        'X-Auto-Response-Suppress: All',
    );

    return @mail($to, $subject, (string) $text, implode("\r\n", $headers));
}

$requestId = studio_request_id();

try {
    $config = studio_load_config();
    $token = trim((string) (isset($config['telegram_bot_token']) ? $config['telegram_bot_token'] : ''));
    $chatId = trim((string) (isset($config['telegram_chat_id']) ? $config['telegram_chat_id'] : ''));
    $notificationEmail = trim((string) (isset($config['notification_email']) ? $config['notification_email'] : 'sigidingo@gmail.com'));
    $maxFiles = (int) (isset($config['max_files']) ? $config['max_files'] : 8);
    $maxFileBytes = (int) (isset($config['max_file_bytes']) ? $config['max_file_bytes'] : (20 * 1024 * 1024));
    $rateMax = (int) (isset($config['rate_limit_max']) ? $config['rate_limit_max'] : 12);
    $rateWindow = (int) (isset($config['rate_limit_window_seconds']) ? $config['rate_limit_window_seconds'] : 900);

    $allowedOrigins = array();
    if (!empty($config['allowed_origins']) && is_array($config['allowed_origins'])) {
        foreach ($config['allowed_origins'] as $value) {
            $normalized = studio_normalize_origin($value);
            if ($normalized !== '') {
                $allowedOrigins[] = $normalized;
            }
        }
    }

    $originHeader = studio_normalize_origin(isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '');
    $self = studio_self_origin();
    $originAllowed = $originHeader === ''
        || $originHeader === $self
        || in_array($originHeader, $allowedOrigins, true);
    $corsOrigin = ($originHeader !== '' && $originAllowed) ? $originHeader : '';

    $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';

    if ($method === 'OPTIONS') {
        if ($originHeader !== '' && !$originAllowed) {
            studio_send(403, array('ok' => false, 'code' => ERROR_VALIDATION, 'error' => 'Origin not allowed'), '', $requestId);
        }
        studio_send(204, array('ok' => true), $corsOrigin, $requestId);
    }

    // Simple health probe: GET /api/leads.php?health=1
    if ($method === 'GET' && isset($_GET['health'])) {
        studio_send(200, array(
            'ok' => true,
            'configured' => ($token !== '' && $chatId !== ''),
            'curl' => function_exists('curl_init'),
        ), $corsOrigin, $requestId);
    }

    if ($method !== 'POST') {
        studio_send(405, array('ok' => false, 'code' => ERROR_VALIDATION, 'error' => 'Method not allowed'), $corsOrigin, $requestId);
    }

    if ($originHeader !== '' && !$originAllowed) {
        studio_send(403, array('ok' => false, 'code' => ERROR_VALIDATION, 'error' => 'Origin not allowed'), '', $requestId);
    }

    if ($token === '' || $chatId === '') {
        studio_send(503, array(
            'ok' => false,
            'code' => ERROR_DELIVERY,
            'error' => 'Lead delivery is not configured on the server.',
        ), $corsOrigin, $requestId);
    }

    $clientIp = (string) (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0'));
    $clientIp = trim(explode(',', $clientIp)[0]);

    $rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'soglasovano-leads-rate.json';
    $now = time();
    $rateData = array();
    if (is_readable($rateFile)) {
        $decoded = json_decode((string) file_get_contents($rateFile), true);
        if (is_array($decoded)) {
            $rateData = $decoded;
        }
    }
    $bucket = array();
    $existing = isset($rateData[$clientIp]) && is_array($rateData[$clientIp]) ? $rateData[$clientIp] : array();
    foreach ($existing as $ts) {
        if (is_int($ts) && $ts > $now - $rateWindow) {
            $bucket[] = $ts;
        }
    }
    if (count($bucket) >= $rateMax) {
        header('Retry-After: ' . max(1, $rateWindow - ($now - (isset($bucket[0]) ? $bucket[0] : $now))));
        studio_send(429, array(
            'ok' => false,
            'code' => ERROR_RATE,
            'error' => 'Слишком много запросов. Попробуйте позже.',
        ), $corsOrigin, $requestId);
    }
    $bucket[] = $now;
    $rateData[$clientIp] = $bucket;
    @file_put_contents($rateFile, json_encode($rateData), LOCK_EX);

    $contentType = strtolower((string) (isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : (isset($_SERVER['HTTP_CONTENT_TYPE']) ? $_SERVER['HTTP_CONTENT_TYPE'] : '')));
    $fields = array();
    $files = array();

    if (strpos($contentType, 'multipart/form-data') !== false || !empty($_FILES)) {
        $fields = $_POST;
        $rawFiles = null;
        if (isset($_FILES['attachments'])) {
            $rawFiles = $_FILES['attachments'];
        } elseif (isset($_FILES['attachments[]'])) {
            $rawFiles = $_FILES['attachments[]'];
        }

        if (is_array($rawFiles) && isset($rawFiles['name']) && is_array($rawFiles['name'])) {
            $count = count($rawFiles['name']);
            for ($i = 0; $i < $count; $i += 1) {
                $files[] = array(
                    'name' => (string) $rawFiles['name'][$i],
                    'type' => (string) (isset($rawFiles['type'][$i]) ? $rawFiles['type'][$i] : ''),
                    'tmp_name' => (string) $rawFiles['tmp_name'][$i],
                    'error' => (int) (isset($rawFiles['error'][$i]) ? $rawFiles['error'][$i] : UPLOAD_ERR_NO_FILE),
                    'size' => (int) (isset($rawFiles['size'][$i]) ? $rawFiles['size'][$i] : 0),
                );
            }
        } elseif (is_array($rawFiles) && isset($rawFiles['tmp_name']) && is_string($rawFiles['tmp_name'])) {
            $files[] = array(
                'name' => (string) $rawFiles['name'],
                'type' => (string) (isset($rawFiles['type']) ? $rawFiles['type'] : ''),
                'tmp_name' => (string) $rawFiles['tmp_name'],
                'error' => (int) (isset($rawFiles['error']) ? $rawFiles['error'] : UPLOAD_ERR_NO_FILE),
                'size' => (int) (isset($rawFiles['size']) ? $rawFiles['size'] : 0),
            );
        }
    } else {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw ? $raw : '{}', true);
        if (!is_array($decoded)) {
            studio_send(400, array(
                'ok' => false,
                'code' => ERROR_VALIDATION,
                'error' => 'Некорректный JSON body',
            ), $corsOrigin, $requestId);
        }
        $fields = $decoded;
    }

    $name = studio_str(isset($fields['name']) ? $fields['name'] : '', 120);
    $phone = studio_str(isset($fields['phone']) ? $fields['phone'] : '', 64);
    $contact = studio_str(isset($fields['contact']) ? $fields['contact'] : '', 255);
    $service = studio_str(isset($fields['service']) ? $fields['service'] : '', 160);
    $source = studio_str(isset($fields['source']) ? $fields['source'] : '', 160);
    $budget = studio_str(isset($fields['budget']) ? $fields['budget'] : '', 120);
    $deadline = studio_str(isset($fields['deadline']) ? $fields['deadline'] : '', 120);
    $comment = studio_str(isset($fields['comment']) ? $fields['comment'] : '', 4000);
    $page = studio_str(isset($fields['page']) ? $fields['page'] : '', 500);
    $attribution = studio_str(isset($fields['attribution']) ? $fields['attribution'] : '', 500);
    $website = studio_str(isset($fields['website']) ? $fields['website'] : '', 200);
    $companyUrl = studio_str(isset($fields['company_url']) ? $fields['company_url'] : '', 200);
    $privacy = isset($fields['privacy']) ? $fields['privacy'] : false;
    $privacyOk = $privacy === true || $privacy === 1 || $privacy === '1' || $privacy === 'true';

    if ($website !== '' || $companyUrl !== '') {
        studio_send(200, array('ok' => true, 'mode' => 'accepted'), $corsOrigin, $requestId);
    }

    if ($name === '' || ($phone === '' && $contact === '') || !$privacyOk) {
        studio_send(400, array(
            'ok' => false,
            'code' => ERROR_VALIDATION,
            'error' => 'Проверьте заполнение формы.',
        ), $corsOrigin, $requestId);
    }

    if (count($files) > $maxFiles) {
        studio_send(400, array(
            'ok' => false,
            'code' => ERROR_ATTACHMENT,
            'error' => 'Слишком много файлов. Максимум ' . $maxFiles . '.',
        ), $corsOrigin, $requestId);
    }

    $acceptedFiles = array();
    $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : false;

    foreach ($files as $file) {
        $error = isset($file['error']) ? (int) $file['error'] : UPLOAD_ERR_NO_FILE;
        if ($error === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($error !== UPLOAD_ERR_OK) {
            studio_send(400, array(
                'ok' => false,
                'code' => ERROR_ATTACHMENT,
                'error' => 'Не удалось загрузить вложение.',
            ), $corsOrigin, $requestId);
        }
        $size = isset($file['size']) ? (int) $file['size'] : 0;
        if ($size <= 0 || $size > $maxFileBytes) {
            studio_send(400, array(
                'ok' => false,
                'code' => ERROR_ATTACHMENT,
                'error' => 'Файл слишком большой или пустой (лимит 20 МБ).',
            ), $corsOrigin, $requestId);
        }
        if (!is_uploaded_file($file['tmp_name'])) {
            studio_send(400, array(
                'ok' => false,
                'code' => ERROR_ATTACHMENT,
                'error' => 'Вложение отклонено.',
            ), $corsOrigin, $requestId);
        }

        $mime = !empty($file['type']) ? $file['type'] : 'application/octet-stream';
        if ($finfo) {
            $detected = finfo_file($finfo, $file['tmp_name']);
            if (is_string($detected) && $detected !== '') {
                $mime = $detected;
            }
        }

        $acceptedFiles[] = array(
            'path' => $file['tmp_name'],
            'name' => $file['name'] !== '' ? $file['name'] : 'file',
            'mime' => $mime,
            'size' => $size,
        );
    }

    if ($finfo) {
        finfo_close($finfo);
    }

    $lines = array(
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
        $attribution !== '' ? 'Атрибуция: ' . $attribution : '',
    );
    if ($acceptedFiles) {
        $lines[] = '';
        $lines[] = 'Вложений: ' . count($acceptedFiles);
        foreach ($acceptedFiles as $index => $file) {
            $lines[] = ($index + 1) . '. ' . $file['name'] . ' (' . $file['mime'] . ')';
        }
    }
    $filtered = array();
    foreach ($lines as $line) {
        if ($line !== null && $line !== false) {
            $filtered[] = $line;
        }
    }
    $text = studio_str(implode("\n", $filtered), 3900);

    $message = studio_telegram($token, 'sendMessage', array(
        'chat_id' => $chatId,
        'text' => $text,
        'disable_web_page_preview' => 'true',
    ));

    if (empty($message['ok'])) {
        $emailSent = studio_mail_fallback($notificationEmail, $requestId, $text);
        if ($emailSent) {
            studio_send(200, array(
                'ok' => true,
                'mode' => 'email',
                'fallbackFrom' => 'telegram',
            ), $corsOrigin, $requestId);
        }

        studio_send(502, array(
            'ok' => false,
            'code' => ERROR_DELIVERY,
            'error' => 'Не удалось отправить заявку. Попробуйте ещё раз.',
        ), $corsOrigin, $requestId);
    }

    $sentAttachments = 0;
    $failedAttachments = 0;

    foreach ($acceptedFiles as $file) {
        $mime = strtolower($file['mime']);
        $isImage = (strpos($mime, 'image/') === 0) && $mime !== 'image/svg+xml';
        $isVideo = (strpos($mime, 'video/') === 0);
        $usePhoto = $isImage && $file['size'] <= 10 * 1024 * 1024;
        $useVideo = $isVideo && $file['size'] <= 50 * 1024 * 1024;

        if ($usePhoto) {
            $tgMethod = 'sendPhoto';
            $field = 'photo';
        } elseif ($useVideo) {
            $tgMethod = 'sendVideo';
            $field = 'video';
        } else {
            $tgMethod = 'sendDocument';
            $field = 'document';
        }

        if (!class_exists('CURLFile')) {
            $failedAttachments += 1;
            continue;
        }

        $curlFile = new CURLFile($file['path'], $file['mime'], $file['name']);
        $result = studio_telegram($token, $tgMethod, array(
            'chat_id' => $chatId,
            $field => $curlFile,
            'caption' => studio_str($file['name'], 200),
        ));

        if (!empty($result['ok'])) {
            $sentAttachments += 1;
        } else {
            $failedAttachments += 1;
        }
    }

    studio_send(200, array(
        'ok' => true,
        'mode' => 'telegram',
        'attachmentsSent' => $sentAttachments,
        'attachmentsFailed' => $failedAttachments,
    ), $corsOrigin, $requestId);
} catch (Throwable $error) {
    studio_send(500, array(
        'ok' => false,
        'code' => ERROR_DELIVERY,
        'error' => 'Серверная ошибка при обработке заявки.',
    ), '', $requestId);
}
