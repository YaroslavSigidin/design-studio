# Auth for agents — Согласовано

This site does **not** use OAuth / OpenID Connect for public lead submission.

## Access model
- Public marketing site + public lead endpoint
- No agent registration portal
- No bearer tokens required for `POST /api/leads.php`

## How to submit a lead
1. Read https://soglasovano.online/docs/leads.md
2. Optionally inspect https://soglasovano.online/api/openapi.json
3. `POST` to https://soglasovano.online/api/leads.php
4. Check health first: https://soglasovano.online/api/leads.php?health=1

## Human contact fallback
- Telegram: https://t.me/sigidingo
- Phone: +7 961 971-05-15
- Email: sigidingo@gmail.com

## Privacy
Submitting a lead requires accepting the privacy policy:
https://soglasovano.online/privacy.html
