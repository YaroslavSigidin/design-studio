#!/bin/bash
# Двойной клик: локальный превью сайта студии (порт 8766, не деплоится).
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PORT=8766
URL="http://127.0.0.1:${PORT}/"

if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  open "$URL"
  exit 0
fi

(sleep 0.8 && open "$URL") &
cd "$ROOT" || exit 1
exec python3 -m http.server "$PORT" --bind 127.0.0.1
