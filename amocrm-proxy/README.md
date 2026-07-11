# Lead proxy для сайта "Согласовано"

GitHub Pages не может безопасно хранить токены Telegram или amoCRM в браузере, поэтому заявки отправляются через этот backend.

Сейчас прокси умеет:

1. отправлять заявки в Telegram-группу через бота;
2. опционально дублировать заявки в amoCRM.

## Telegram

В `.env` нужны:

```env
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=-5360826750
ALLOWED_ORIGINS=https://yaroslavsigidin.github.io,https://yaroslavsigidin.github.io/design-studio,http://127.0.0.1:8766,http://localhost:8766
```

Бот должен быть добавлен в группу и иметь право писать сообщения.

## Локальный запуск

```bash
cd amocrm-proxy
cp .env.example .env
node --env-file=.env server.mjs
```

Проверка:

```bash
curl http://127.0.0.1:8787/health
```

## Endpoint

`POST /api/leads`

Пример payload:

```json
{
  "source": "Модальное окно брифа",
  "service": "Редизайн сайта",
  "name": "Ярослав",
  "phone": "+7 961 971-05-15",
  "contact": "@sigidingo",
  "budget": "145 000 ₽",
  "deadline": "2.3 мес",
  "comment": "Нужен быстрый редизайн лендинга",
  "page": "https://yaroslavsigidin.github.io/design-studio/"
}
```

## Деплой на Render

1. Создайте Web Service из репозитория на [Render](https://render.com).
2. Render подхватит `render.yaml` из корня репозитория.
3. В Environment добавьте `TELEGRAM_BOT_TOKEN`.
4. После деплоя URL сервиса должен быть `https://soglasovano-leads.onrender.com`.

Фронт уже настроен на этот endpoint в `assets/js/config.js`.

## amoCRM (опционально)

Если нужен amoCRM, дополнительно заполните:

```env
AMO_BASE_URL=https://sigidingo.amocrm.ru
AMO_ACCESS_TOKEN=<долгосрочный токен>
AMO_SOURCE_NAME=Сайт Согласовано
AMO_SOURCE_UID=design-studio-site
AMO_PIPELINE_ID=
```

Если amoCRM настроен, заявка может уходить и в CRM, и в Telegram.

## Безопасность

- Никогда не коммитьте `.env` и не публикуйте токен бота в репозиторий.
- Если токен когда-либо попал в чат или git, перевыпустите его через `@BotFather`.
