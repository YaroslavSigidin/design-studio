<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'Method not allowed',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$configPath = __DIR__ . '/telegram-lead.config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Не найден файл конфигурации Telegram-бота.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$config = require $configPath;
$botToken = trim((string) ($config['bot_token'] ?? ''));
$chatId = trim((string) ($config['chat_id'] ?? ''));

if ($botToken === '' || $chatId === '') {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Не заполнены bot_token или chat_id для Telegram-бота.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '[]', true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Неверный формат данных заявки.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function leadValue(mixed $value, int $maxLength = 1200): string
{
    $clean = trim((string) $value);
    $clean = preg_replace('/\s+/u', ' ', $clean) ?? $clean;
    if (function_exists('mb_substr')) {
        return mb_substr($clean, 0, $maxLength);
    }
    return substr($clean, 0, $maxLength);
}

function leadHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$fields = [
    'Источник' => leadValue($payload['source'] ?? ''),
    'Услуга' => leadValue($payload['service'] ?? ''),
    'Имя' => leadValue($payload['name'] ?? ''),
    'Телефон' => leadValue($payload['phone'] ?? ''),
    'Контакт' => leadValue($payload['contact'] ?? ''),
    'Бюджет' => leadValue($payload['budget'] ?? ''),
    'Срок' => leadValue($payload['deadline'] ?? ''),
    'Комментарий' => leadValue($payload['comment'] ?? '', 2000),
    'Страница' => leadValue($payload['page'] ?? '', 500),
    'Отправлено' => leadValue($payload['submittedAt'] ?? '', 100),
];

$lines = ['<b>Новая заявка с сайта «Согласовано»</b>'];
foreach ($fields as $label => $value) {
    if ($value === '') {
        continue;
    }
    $lines[] = '<b>' . leadHtml($label) . ':</b> ' . leadHtml($value);
}

$telegramPayload = [
    'chat_id' => $chatId,
    'text' => implode("\n", $lines),
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true,
];

$requestBody = json_encode($telegramPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($requestBody === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Не удалось подготовить сообщение для Telegram.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$telegramUrl = 'https://api.telegram.org/bot' . $botToken . '/sendMessage';
$responseBody = '';
$httpStatus = 0;

if (function_exists('curl_init')) {
    $ch = curl_init($telegramUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $requestBody,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
    ]);

    $responseBody = (string) curl_exec($ch);
    $httpStatus = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($responseBody === '' && $curlError !== '') {
        http_response_code(502);
        echo json_encode([
            'ok' => false,
            'error' => 'Не удалось подключиться к Telegram API: ' . $curlError,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
} else {
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $requestBody,
            'timeout' => 10,
            'ignore_errors' => true,
        ],
    ]);
    $responseBody = (string) @file_get_contents($telegramUrl, false, $context);
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $match)) {
        $httpStatus = (int) $match[1];
    }
}

$telegramResponse = json_decode($responseBody ?: '[]', true);
$telegramOk = is_array($telegramResponse) && ($telegramResponse['ok'] ?? false) === true;

if ($httpStatus >= 400 || !$telegramOk) {
    http_response_code(502);
    $description = is_array($telegramResponse) ? (string) ($telegramResponse['description'] ?? '') : '';
    echo json_encode([
        'ok' => false,
        'error' => $description !== ''
            ? 'Telegram не принял заявку: ' . $description
            : 'Telegram не принял заявку. Проверьте токен бота, chat_id и права бота в беседе.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode([
    'ok' => true,
    'mode' => 'telegram',
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
