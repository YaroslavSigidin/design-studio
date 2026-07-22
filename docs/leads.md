# Lead API — Согласовано

Public endpoint for project briefs from [soglasovano.online](https://soglasovano.online/).

## Endpoint
- `POST /api/leads.php`
- Health: `GET /api/leads.php?health=1`
- OpenAPI: [/api/openapi.json](/api/openapi.json)
- Catalog: [/.well-known/api-catalog](/.well-known/api-catalog)

## Auth
None. Do not send OAuth tokens. See [/auth.md](/auth.md).

## JSON example

```http
POST /api/leads.php HTTP/1.1
Host: soglasovano.online
Content-Type: application/json
Origin: https://soglasovano.online

{
  "name": "Имя клиента",
  "phone": "+79990001122",
  "contact": "@telegram_or_email",
  "service": "Многостраничный сайт",
  "budget": "235 000 ₽",
  "deadline": "4 недели",
  "comment": "Кратко о задаче",
  "source": "agent",
  "privacy": true,
  "website": "",
  "company_url": ""
}
```

## Attachments
Send `multipart/form-data` with the same fields plus one or more `attachments[]` files (max 8, 20 MB each). Images → Telegram photo, videos → video, other → document.

## Responses
- `200` `{ "ok": true, "mode": "telegram", "requestId": "..." }`
- `400` validation / attachment rejected
- `429` rate limited
- `502` / `503` delivery or configuration failure

Honeypot fields `website` and `company_url` must stay empty.
