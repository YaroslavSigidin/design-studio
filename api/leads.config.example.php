<?php
declare(strict_types=1);

/**
 * Copy to one of these paths (prefer outside the web root so `git clean` cannot delete it):
 *   /home/c/ca568679/leads.config.php
 *   api/leads.config.php  (local only; gitignored)
 */
return [
    'telegram_bot_token' => 'PUT_YOUR_BOT_TOKEN_HERE',
    'telegram_chat_id' => '-5360826750',
    // Optional extras. Same-host Origin is always allowed automatically.
    'allowed_origins' => [
        'https://soglasovano.online',
        'https://www.soglasovano.online',
        'https://yaroslavsigidin.github.io',
        'http://127.0.0.1:8765',
        'http://localhost:8765',
    ],
    'max_files' => 8,
    'max_file_bytes' => 20 * 1024 * 1024,
    'rate_limit_max' => 12,
    'rate_limit_window_seconds' => 900,
];
