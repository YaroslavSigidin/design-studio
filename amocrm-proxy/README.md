# Lead proxy (Telegram / optional amoCRM)

Hardened Node HTTP service for `/api/leads`.

## Security controls

- Exact-origin CORS (`ALLOWED_ORIGINS`, no paths, no `*.github.io` wildcards)
- `Vary: Origin`
- Body size limit (`MAX_BODY_BYTES`, default 64 KB)
- Zod schema validation (strict object)
- In-memory rate limit per IP
- Honeypot fields `website` / `company_url`
- Optional Cloudflare Turnstile (`TURNSTILE_SECRET`)
- Public `/health` returns only `{ "ok": true }`
- Upstream timeout + limited retry
- Safe client error codes: `VALIDATION_ERROR`, `RATE_LIMITED`, `DELIVERY_FAILED`, `ATTACHMENT_REJECTED`
- Internal errors logged with `requestId` only

## Local run

```bash
cd amocrm-proxy
cp .env.example .env   # fill TELEGRAM_* 
npm install
npm start
```

## Env

See `.env.example`. On Render, set `ALLOWED_ORIGINS` to exact production origins only, e.g.:

`https://yaroslavsigidin.github.io`

Do **not** include a path like `/design-studio` — browser `Origin` never has a path.

## Owner follow-ups

- Redeploy Render after this change (`npm install` in build)
- Provide `TURNSTILE_SECRET` (+ site key in frontend config) to enable Turnstile
- Confirm Telegram bot can post to `TELEGRAM_CHAT_ID`
