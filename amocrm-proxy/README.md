# amoCRM proxy для сайта "Согласовано"

Этот слой нужен потому, что основной сайт живёт на GitHub Pages и не может безопасно хранить `access token` amoCRM в браузере.

Прокси принимает заявки с сайта и отправляет их в amoCRM через API.

## Что требуется в amoCRM

1. В аккаунте `sigidingo.amocrm.ru` создать приватную интеграцию в `амоМаркет`.
2. На вкладке `Ключи` сгенерировать **долгосрочный токен**.
3. Скопировать:
   - `AMO_BASE_URL=https://sigidingo.amocrm.ru`
   - `AMO_ACCESS_TOKEN=<долгосрочный токен>`
4. При необходимости узнать `pipeline_id`, если заявки должны идти не в дефолтную воронку.

Почему именно долгосрочный токен:
- он не требует `refresh_token`;
- он подходит для небольших интеграций под один аккаунт;
- это самая простая и устойчивая схема для статического сайта.

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

## Что делает прокси

1. Создаёт заявку через `POST /api/v4/leads/unsorted/forms`
2. Добавляет к созданной сделке note с текстом заявки
3. Возвращает `200 OK`, если amoCRM принял заявку

## Подключение фронта

После деплоя прокси укажи его URL в:

`assets/js/config.js`

Поле:

```js
crm: {
  endpoint: "https://your-backend.example.com/api/leads"
}
```
