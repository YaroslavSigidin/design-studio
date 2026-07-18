import http from "node:http";
import { randomUUID } from "node:crypto";

const env = process.env;

const config = {
  port: Number(env.PORT || 8787),
  amoBaseUrl: String(env.AMO_BASE_URL || "").replace(/\/+$/, ""),
  amoAccessToken: String(env.AMO_ACCESS_TOKEN || "").trim(),
  amoSourceName: String(env.AMO_SOURCE_NAME || "Сайт Согласовано").trim(),
  amoSourceUid: String(env.AMO_SOURCE_UID || "design-studio-site").trim(),
  amoPipelineId: env.AMO_PIPELINE_ID ? Number(env.AMO_PIPELINE_ID) : null,
  telegramBotToken: String(env.TELEGRAM_BOT_TOKEN || "").trim(),
  telegramChatId: String(env.TELEGRAM_CHAT_ID || "").trim(),
  allowedOrigins: String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
};

const hasRealAmoToken = () =>
  Boolean(config.amoAccessToken) && config.amoAccessToken !== "put-long-lived-token-here";

const hasAmo = () => Boolean(config.amoBaseUrl && hasRealAmoToken());

const hasTelegram = () => Boolean(config.telegramBotToken && config.telegramChatId);

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const parseBody = request =>
  new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Некорректный JSON body"));
      }
    });
    request.on("error", reject);
  });

const isAllowedOrigin = origin => {
  if (!origin) return true;
  if (!config.allowedOrigins.length) return true;
  if (config.allowedOrigins.includes(origin)) return true;
  if (config.allowedOrigins.includes("*")) return true;

  try {
    const url = new URL(origin);
    const host = url.hostname;
    // Локальная разработка и типичные деплои студии.
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".github.io")) return true;
    if (host === "92.53.96.132") return true;
  } catch {
    return false;
  }

  return false;
};

const getCorsOrigin = origin => {
  if (!origin) return "*";
  return isAllowedOrigin(origin) ? origin : "";
};

const sendJson = (response, statusCode, payload, origin) => {
  const corsOrigin = getCorsOrigin(origin);
  const headers = { ...jsonHeaders };

  if (corsOrigin) {
    headers["Access-Control-Allow-Origin"] = corsOrigin;
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
  }

  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(payload));
};

const handleOptions = (response, origin) => {
  const corsOrigin = getCorsOrigin(origin);
  const headers = {
    "Access-Control-Allow-Origin": corsOrigin || "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400"
  };

  response.writeHead(204, headers);
  response.end();
};

const sanitizeText = (value, maxLength = 1200) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const extractDigits = value => String(value || "").replace(/\D/g, "");

const parseBudget = value => {
  const digits = extractDigits(value);
  return digits ? Number(digits) : undefined;
};

const detectEmail = value => {
  const normalized = sanitizeText(value, 255);
  return normalized.includes("@") ? normalized : "";
};

const buildNoteText = payload => {
  const lines = [
    "Новая заявка с сайта «Согласовано»",
    "",
    payload.source ? `Источник: ${payload.source}` : "",
    payload.service ? `Услуга: ${payload.service}` : "",
    payload.name ? `Имя: ${payload.name}` : "",
    payload.phone ? `Телефон: ${payload.phone}` : "",
    payload.contact ? `Контакт: ${payload.contact}` : "",
    payload.budget ? `Бюджет: ${payload.budget}` : "",
    payload.deadline ? `Срок: ${payload.deadline}` : "",
    payload.comment ? `Комментарий: ${payload.comment}` : "",
    payload.page ? `Страница: ${payload.page}` : ""
  ].filter(Boolean);

  return lines.join("\n");
};

const buildLeadName = payload => {
  const service = sanitizeText(payload.service, 120);
  const name = sanitizeText(payload.name, 120);

  if (service && name) return `${service} — ${name}`;
  if (service) return `Заявка: ${service}`;
  if (name) return `Заявка: ${name}`;
  return "Новая заявка с сайта";
};

const buildSourceUid = payload => {
  const source = sanitizeText(payload.source, 80)
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return [config.amoSourceUid, source].filter(Boolean).join("-");
};

const amoRequest = async (path, method, body) => {
  const response = await fetch(`${config.amoBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.amoAccessToken}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.detail || data?.title || text || `HTTP ${response.status}`;
    throw new Error(`amoCRM ${response.status}: ${detail}`);
  }

  return data;
};

const createUnsortedLead = async (payload, request) => {
  const email = detectEmail(payload.contact);
  const phone = sanitizeText(payload.phone, 64);
  const comment = sanitizeText(payload.comment, 4000);
  const sourceUid = buildSourceUid(payload);
  const leadName = buildLeadName(payload);
  const price = parseBudget(payload.budget);
  const nowTs = Math.floor(Date.now() / 1000);
  const noteText = buildNoteText(payload);
  const tags = [payload.service, payload.source, "Сайт Согласовано"]
    .map(value => sanitizeText(value, 80))
    .filter(Boolean)
    .map(name => ({ name }));

  const contacts = [
    {
      name: sanitizeText(payload.name, 120) || "Новый контакт",
      custom_fields_values: [
        phone
          ? {
              field_code: "PHONE",
              values: [{ value: phone }]
            }
          : null,
        email
          ? {
              field_code: "EMAIL",
              values: [{ value: email }]
            }
          : null
      ].filter(Boolean)
    }
  ];

  const unsortedPayload = [
    {
      request_id: randomUUID(),
      source_uid: sourceUid,
      source_name: config.amoSourceName,
      pipeline_id: config.amoPipelineId || undefined,
      created_at: nowTs,
      metadata: {
        ip: request.socket.remoteAddress || "",
        form_id: sourceUid,
        form_sent_at: nowTs,
        form_name: sanitizeText(payload.source || "Форма сайта", 120),
        form_page: sanitizeText(payload.page || payload.referer || "", 500),
        referer: sanitizeText(request.headers.referer || payload.referer || "", 500)
      },
      _embedded: {
        leads: [
          {
            name: leadName,
            price,
            _embedded: tags.length ? { tags } : undefined
          }
        ],
        contacts
      }
    }
  ];

  const unsortedResponse = await amoRequest("/api/v4/leads/unsorted/forms", "POST", unsortedPayload);
  const leadId = unsortedResponse?._embedded?.unsorted?.[0]?._embedded?.leads?.[0]?.id;

  let noteAttached = false;
  let noteError = "";

  if (leadId && noteText) {
    try {
      await amoRequest("/api/v4/leads/notes", "POST", [
        {
          entity_id: leadId,
          note_type: "common",
          params: {
            text: comment ? `${noteText}\n\nТекст задачи:\n${comment}` : noteText
          }
        }
      ]);
      noteAttached = true;
    } catch (error) {
      noteError = error instanceof Error ? error.message : "Не удалось сохранить note";
    }
  }

  return {
    leadId: leadId || null,
    noteAttached,
    noteError
  };
};

const sendTelegramMessage = async text => {
  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: config.telegramChatId,
      text,
      disable_web_page_preview: true
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    const detail = data?.description || `HTTP ${response.status}`;
    throw new Error(`Telegram: ${detail}`);
  }

  return {
    messageId: data?.result?.message_id || null
  };
};

const validateLead = payload => {
  const name = sanitizeText(payload.name, 120);
  const phone = sanitizeText(payload.phone, 64);
  const contact = sanitizeText(payload.contact, 255);

  if (!name) return "Имя обязательно";
  if (!phone && !contact) return "Нужен телефон или контакт";
  return "";
};

const submitLead = async (payload, request) => {
  const errors = [];
  const result = {
    telegram: null,
    amocrm: null
  };

  if (hasTelegram()) {
    try {
      result.telegram = await sendTelegramMessage(buildNoteText(payload));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Telegram error");
    }
  }

  if (hasAmo()) {
    try {
      result.amocrm = await createUnsortedLead(payload, request);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "amoCRM error");
    }
  }

  if (result.telegram) {
    return {
      ok: true,
      mode: "telegram",
      result
    };
  }

  if (result.amocrm) {
    return {
      ok: true,
      mode: "crm",
      result
    };
  }

  throw new Error(errors.join("; ") || "Lead delivery is not configured");
};

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin || "";

  if (request.method === "OPTIONS") {
    handleOptions(response, origin);
    return;
  }

  if (request.url === "/health" && request.method === "GET") {
    sendJson(
      response,
      200,
      {
        ok: true,
        telegramConfigured: hasTelegram(),
        amoConfigured: hasAmo(),
        source: config.amoSourceName
      },
      origin
    );
    return;
  }

  if (request.url !== "/api/leads" || request.method !== "POST") {
    sendJson(response, 404, { ok: false, error: "Not found" }, origin);
    return;
  }

  if (!hasTelegram() && !hasAmo()) {
    sendJson(response, 500, { ok: false, error: "Lead delivery env is not configured" }, origin);
    return;
  }

  try {
    const body = await parseBody(request);
    const error = validateLead(body);

    if (error) {
      sendJson(response, 400, { ok: false, error }, origin);
      return;
    }

    const delivery = await submitLead(body, request);

    sendJson(
      response,
      200,
      {
        ok: true,
        mode: delivery.mode,
        source: config.amoSourceName,
        result: delivery.result
      },
      origin
    );
  } catch (error) {
    sendJson(
      response,
      502,
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось отправить заявку"
      },
      origin
    );
  }
});

server.listen(config.port, () => {
  process.stdout.write(
    `Lead proxy listening on http://127.0.0.1:${config.port} (telegram: ${hasTelegram()}, amo: ${hasAmo()})\n`
  );
});
