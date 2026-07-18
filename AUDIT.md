# Production audit — Согласовано

**Baseline commit:** `1879c687f2d1faedecbfb84074aa60278343e59b`  
**Baseline date:** 2026-07-18  
**Baseline message:** Make motion butter-smooth with a shared perf gate across devices.  
**Scope:** local only (no GitHub Pages deploy until acceptance).  
**Live reference:** https://yaroslavsigidin.github.io/design-studio/

Status legend: `open` · `in_progress` · `done` · `blocked` · `wontfix`

| ID | Проблема | Приоритет | Файл | Способ воспроизведения | Исправление | Статус |
| --- | --- | --- | --- | --- | --- | --- |
| A01 | Вложения кодируются в base64 на клиенте, backend игнорирует `attachments` и шлёт в Telegram только текст | P0 | `assets/js/contact.js`, `amocrm-proxy/server.mjs`, `studio.css` | Отправить бриф с PNG/PDF → в Telegram только текст, файла нет | **Временно:** UI вложений скрыт, base64 upload отключён. Далее: multipart + `sendPhoto`/`sendDocument` | done |
| A02 | Нет жёсткого body limit: `parseBody` буферит весь запрос | P0 | `amocrm-proxy/server.mjs` | POST большого body на `/api/leads` | Stream limit + reject по Content-Length; без base64 JSON | done |
| A03 | Нет rate limit / honeypot / Turnstile на публичном `/api/leads` | P0 | `amocrm-proxy/server.mjs` | Повторяющиеся curl POST с валидными полями | Rate limit + honeypot + Turnstile + idempotency | done |
| A04 | Fallback Telegram/mailto считается успешной заявкой (`ok: true`, `studio:lead-sent`) | P0 | `assets/js/contact.js`, `assets/js/hero.js`, `assets/js/analytics.js` | Заблокировать proxy, отправить форму, не жать Send в Telegram | Fallback ≠ success; отдельное событие; форма не очищается | done |
| A05 | Brief modal скрывает форму и очищает данные при ошибке | P0 | `assets/js/brief-modal.js` | Offline submit → через ~2.2s данные пропадают | Оставить форму, ошибка + Повторить / Копировать / Telegram + requestId | done |
| A06 | CORS: `*.github.io`, localhost, path в ALLOWED_ORIGINS; preflight `*` для чужих Origin; POST без Origin проходит | P0 | `amocrm-proxy/server.mjs`, `render.yaml` | curl без Origin; Origin с path | Точные production origins; `Vary: Origin`; reject чужих | done |
| A07 | Слабая server validation (нет schema, consent, лимитов полей) | P0 | `amocrm-proxy/server.mjs` | POST `{name:"x",contact:"@"}` без privacy | Zod/Ajv + лимиты + privacy === true | done |
| A08 | `/health` раскрывает конфигурацию Telegram/amoCRM; warmup с каждого визита | P0 | `amocrm-proxy/server.mjs`, `assets/js/contact.js` | GET `/health` | Ответ только `{ok:true}`; убрать auto-warmup | done |
| A09 | Сырые ошибки Telegram/amoCRM уходят клиенту | P0 | `amocrm-proxy/server.mjs` | Сломать токен → смотреть body 502 | Коды `VALIDATION_ERROR` / `RATE_LIMITED` / `DELIVERY_FAILED` / `ATTACHMENT_REJECTED` + requestId | done |
| A10 | amoCRM может вернуть «успех» без leadId | P0 | `amocrm-proxy/server.mjs` | Неожиданный ответ unsorted API | Требовать leadId; иначе DELIVERY_FAILED | done |
| A11 | Нет timeout/retry policy для внешних API | P0 | `amocrm-proxy/server.mjs` | Зависший upstream | AbortSignal.timeout + ограниченный retry | done |
| A12 | Success UI / analytics не согласованы между hero / brief / footer | P0 | `contact.js`, `hero.js`, `brief-modal.js` | Сравнить три формы при fallback/error | Единые состояния confirmed / failed / fallback_opened | done |
| A13 | Кейсы и услуги зависят от JS; без JS — скелетоны | P1 | `index.html`, `cases.js`, `services.js` | Disable JS | Build-time static HTML + noscript + fallback | open |
| A14 | `case.html?slug=` — один HTML skeleton, SEO/OG одинаковые | P1 | `case.html`, `case-page.js`, `sitemap.xml` | View-source любого кейса | `/cases/<slug>/` + static `index.html` на кейс | open |
| A15 | Sitemap содержит голый `case.html` | P1 | `sitemap.xml` | Открыть URL из sitemap | Удалить; только канонические published URL + lastmod | open |
| A16 | Неподтверждённые proofs: 50+, топ‑10, 2000 студентов, SBER/VTB и т.д. | P1 | `index.html`, `cases.manifest.json` | Hero stats / partners / metrics | `content/proofs.json`; убрать или квалифицировать | open |
| A17 | Карточки кейсов: `article tabindex="0"` + `aria-hidden` на свёрнутых | P1 | `cases.js` | Tab по сетке кейсов | Ссылки внутри карточек; inert/hidden | done |
| A18 | Brief modal: нет focus trap / inert / видимой кнопки закрытия | P1 | `brief-modal.js`, `index.html` | Tab за пределы модалки | dialog / trap / Escape / restore focus | done |
| A19 | Дубль загрузки кейсов: `cases.js` + inline fallback + `cache: no-store` (частично уже `force-cache`) | P1 | `index.html`, `cases.js` | Network на cold load | Один loader; hashed cache | open |
| A20 | Hero позиционирование не соответствует брифу | P2 | `index.html` | Первый экран | Новый надзаголовок / H1 / подзаголовок / CTA | open |
| A21 | Подзаголовок услуг «Закроем любой вопрос» | P2 | `index.html`, `services.js` | Секция услуг | «Подключаемся на нужном этапе…» | open |
| A22 | Структура главной не соответствует целевой (нет process/testimonials/proofs) | P2 | `index.html` | Скролл всей главной | Новая структура 1–12 | open |
| A23 | Нет skip-link / один main landmark | P2 | `index.html` | Tab с начала страницы | Skip-link + `<main>` | done |
| A24 | Tabs кейсов без tabpanel / arrow keys | P2 | `index.html`, `cases.js` | Стрелки на фильтрах | Полный ARIA tabs или обычные buttons | done |
| A25 | MAX = `tel:` без настоящей MAX-ссылки | P2 | `config.js`, `index.html` | Клик MAX | Показать MAX только при реальном URL; иначе телефон | done |
| A26 | Аналитика: пустой metrikaId; мало событий воронки | P2 | `analytics.js`, `config.js` | Submit / CTA | События из брифа + consent | open |
| A27 | Нет `content/` data layer; монолит `cases.manifest.json` | P2 | repo root | Поиск `content/` | site/services/team/testimonials/proofs/cases | open |
| A28 | Нет Vite build, hashed assets, page-specific JS | P2 | repo | Production deploy = raw files | Vite + ESM + split CSS | open |
| A29 | Шрифты Google (частично урезаны); нет self-host subset | P2 | `index.html` | Network fonts | Self-host / subset WOFF2 | open |
| A30 | Privacy/terms заявляют доставку вложений/автомаршрутизацию неточно | P2 | `privacy.html`, `terms.html` | Сравнить с фактом доставки | Синхронизировать с реальной схемой | open |
| A31 | Нет ESLint/Prettier/Stylelint/Playwright/Lighthouse CI | P3 | `.github/workflows` | CI каталог | Добавить toolchain + Actions | open |
| A32 | FAQ без `aria-controls` | P3 | `index.html`, `faq.js` | Accordion SR | Связать trigger↔panel | done |
| A33 | Mobile menu без полного a11y (aria-controls, focus) | P3 | `header.js` | Открыть меню с клавиатуры | Полный disclosure pattern | done |
| A34 | Client attachment limits silent skip | P3 | `contact.js`, `hero.js` | Добавить >8 файлов | Validate on select + UI errors | open |
| A35 | Горизонтальный скролл / overlap — нужна device matrix QA | P3 | CSS | 320–1920 widths | Fix per breakpoint | open |

## Baseline checks (initial)

| Check | Result | Notes |
| --- | --- | --- |
| Baseline commit recorded | yes | `1879c687…` |
| Local broken refs (static HTML) | 1 false-positive template string in inline JS | `${escapeHtml(src)}` |
| Sitemap URLs | 34 | includes bare `case.html` (A15) |
| Attachment UI present | yes | Photo + File buttons (A01) |
| Forbidden copy «Закроем любой вопрос» | present | A21 |
| `content/` directory | missing | A27 |
| Lighthouse desktop (local :8765) | Perf 0* / A11y 93 / BP 100 / SEO 100 | *Lantern NO_LCP on headless local; re-run after static LCP image |
| Lighthouse mobile | failed interstitial | Chrome/local server flake; re-run in CI |
| axe | blocked | ChromeDriver 151 vs Chrome 150 mismatch |
| Live form e2e against Render | not run in this baseline pass | requires secrets / redeploy |

## Owner-dependent inputs (blocked without data)

| Item | Needed from owner |
| --- | --- |
| Cloudflare Turnstile | site key + secret |
| Yandex Metrika ID | counter ID |
| MAX profile URL | `https://max.ru/u/...` or remove |
| Proof evidence | sources for stats/logos/metrics |
| Production domain | if not github.io — for CORS/canonical |
| Legal status | самозанятый / ИП реквизиты |
| Telegram delivery confirmation | bot token already on Render; verify group |

## Recommended commit sequence

```text
chore: document production baseline and audit
fix: make lead delivery truthful and resilient
fix: implement secure attachment upload   # or remove upload UI temporarily
security: harden lead endpoint and cors
fix: correct contact links and fallback states
a11y: repair modal menu tabs and forms
refactor: introduce structured content data
feat: pre-render services and cases
content: rewrite positioning and proof blocks
feat: add process testimonials and trust
seo: generate canonical case pages and sitemap
perf: optimize media css and data loading
analytics: add consent-aware conversion events
test: add playwright axe and lighthouse checks
docs: update readme audit and deployment guide
```

## Progress log

| Date | Commit | Stage | Notes |
| --- | --- | --- | --- |
| 2026-07-18 | `25bd965` | baseline audit | Local only; Pages not updated |
| 2026-07-18 | `1f42c0b` | truthful leads | Attachments hidden; fallback ≠ success; no /health warmup |
| 2026-07-18 | `b628d47` | security harden | Zod, CORS exact, rate limit, honeypot, Turnstile hook, safe errors |
| 2026-07-18 | `d8ed593` | contacts + fallback UX | Phone dial vs copy; hide MAX; recovery actions |
| 2026-07-18 | `f645f09` | a11y | Skip-link, modal traps, case links, toolbar filters, field errors |
| 2026-07-18 | `8b15c00` | content + prerender | `content/*`, hero rewrite, honest proofs, static services/cases |
| 2026-07-18 |  | revert homepage copy | User request: restore pre-content texts/structure; keep backend/perf/a11y |
