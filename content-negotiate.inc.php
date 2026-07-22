<?php
declare(strict_types=1);

/**
 * Shared helpers for Accept: text/markdown negotiation.
 */

function studio_accepts_markdown()
{
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? (string) $_SERVER['HTTP_ACCEPT'] : '';
    if ($accept === '' || stripos($accept, 'text/markdown') === false) {
        return false;
    }

    // If client ranks HTML clearly higher, keep HTML.
    if (preg_match('/text\/html\s*;\s*q=([0-9.]+)/i', $accept, $htmlQ)) {
        $hq = (float) $htmlQ[1];
    } elseif (stripos($accept, 'text/html') !== false) {
        $hq = 1.0;
    } else {
        $hq = 0.0;
    }

    if (preg_match('/text\/markdown\s*;\s*q=([0-9.]+)/i', $accept, $mdQ)) {
        $mq = (float) $mdQ[1];
    } else {
        $mq = 1.0;
    }

    return $mq >= $hq;
}

function studio_estimate_tokens($text)
{
    $len = function_exists('mb_strlen') ? mb_strlen($text) : strlen($text);
    return (int) max(1, ceil($len / 4));
}

function studio_send_markdown($path, $linkHeader = '')
{
    if (!is_readable($path)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Markdown mirror not found';
        exit;
    }

    $body = file_get_contents($path);
    if ($linkHeader !== '') {
        header('Link: ' . $linkHeader);
    }
    header('Content-Type: text/markdown; charset=utf-8');
    header('Vary: Accept');
    header('Cache-Control: public, max-age=120');
    header('x-markdown-tokens: ' . studio_estimate_tokens($body));
    echo $body;
    exit;
}

function studio_send_html($path, $linkHeader = '')
{
    if (!is_readable($path)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'HTML page not found';
        exit;
    }

    if ($linkHeader !== '') {
        header('Link: ' . $linkHeader);
    }
    header('Content-Type: text/html; charset=utf-8');
    header('Vary: Accept');
    header('Cache-Control: public, max-age=60');
    readfile($path);
    exit;
}

function studio_send_html_content($body, $linkHeader = '', $status = 200)
{
    http_response_code($status);
    if ($linkHeader !== '') {
        header('Link: ' . $linkHeader);
    }
    header('Content-Type: text/html; charset=utf-8');
    header('Vary: Accept');
    header('Cache-Control: public, max-age=60');
    echo $body;
    exit;
}
