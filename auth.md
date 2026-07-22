# auth.md

You are an agent. This site (**Согласовано**, https://soglasovano.online) supports **public lead submission without OAuth**.

There is no agentic OAuth registration for the marketing site. Follow the steps below.

## Step 1 — Discover

Discovery is two hops — you may have already done this.

### 1a. Fetch the Protected Resource Metadata

```http
GET /.well-known/oauth-protected-resource
```

This resource is **public**. `authorization_servers` is empty on purpose: no bearer token is required for `POST /api/leads.php`.

Also useful:

- API catalog: `GET /.well-known/api-catalog`
- OpenAPI: `GET /api/openapi.json`
- Lead docs: `GET /docs/leads.md`
- Health: `GET /api/leads.php?health=1`
- Agent skills: `GET /.well-known/agent-skills/index.json`
- MCP card: `GET /.well-known/mcp/server-card.json`

## Step 2 — Register

No registration endpoint. Agents do not create accounts and do not obtain access tokens.

## Step 3 — Call the API

Submit a lead:

```http
POST /api/leads.php
Content-Type: application/json
Origin: https://soglasovano.online

{
  "name": "Client name",
  "phone": "+79990001122",
  "contact": "@telegram_or_email",
  "service": "Многостраничный сайт",
  "comment": "Brief",
  "source": "agent",
  "privacy": true,
  "website": "",
  "company_url": ""
}
```

Multipart with `attachments[]` is supported (photos/videos/files).

## Step 4 — Handle errors

- `400` validation / attachment rejected
- `429` rate limited
- `502` / `503` delivery failure

Human fallback: https://t.me/sigidingo · +7 961 971-05-15 · sigidingo@gmail.com

## Privacy

Submitting a lead requires privacy acceptance (`privacy: true`).
Policy: https://soglasovano.online/privacy.html
