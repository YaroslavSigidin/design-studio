const MAX_FILES = 8;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const TELEGRAM_TEXT_LIMIT = 3900;

const ALLOWED_ORIGINS = new Set([
  "https://soglasovano.online",
  "https://www.soglasovano.online",
  "https://yaroslavsigidin.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);

const requestId = () => {
  try {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  } catch (_) {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
};

const corsHeaders = origin => {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};

const json = (status, payload, origin = "", id = "") => {
  const body = id && !payload.requestId ? { ...payload, requestId: id } : payload;
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

const telegramRequest = async (token, method, body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      body,
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok && data?.ok === true, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: {}, error };
  } finally {
    clearTimeout(timeout);
  }
};

const parseLead = async request => {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const fields = Object.fromEntries(
      [...form.entries()].filter(([, value]) => typeof value === "string")
    );
    const files = form
      .getAll("attachments[]")
      .filter(value => typeof value !== "string" && value.size > 0);
    return { fields, files };
  }

  if (!contentType.includes("application/json")) {
    throw Object.assign(new Error("Unsupported content type"), { code: "VALIDATION_ERROR" });
  }

  const fields = await request.json();
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    throw Object.assign(new Error("Invalid JSON"), { code: "VALIDATION_ERROR" });
  }
  return { fields, files: [] };
};

const buildMessage = (fields, id, files) => {
  const lines = [
    "Новая заявка с сайта «Согласовано»",
    `ID: ${id}`,
    "",
    fields.source ? `Источник: ${clean(fields.source, 160)}` : "",
    fields.service ? `Услуга: ${clean(fields.service, 160)}` : "",
    fields.name ? `Имя: ${clean(fields.name, 120)}` : "",
    fields.phone ? `Телефон: ${clean(fields.phone, 64)}` : "",
    fields.contact ? `Контакт: ${clean(fields.contact, 255)}` : "",
    fields.budget ? `Бюджет: ${clean(fields.budget, 120)}` : "",
    fields.deadline ? `Срок: ${clean(fields.deadline, 120)}` : "",
    fields.comment ? `Комментарий: ${clean(fields.comment, 2000)}` : "",
    fields.page ? `Страница: ${clean(fields.page, 500)}` : "",
    fields.attribution ? `Атрибуция: ${clean(fields.attribution, 500)}` : "",
    files.length ? `Вложений: ${files.length}` : ""
  ];
  return lines.filter(Boolean).join("\n").slice(0, TELEGRAM_TEXT_LIMIT);
};

const sendAttachment = async (token, chatId, file) => {
  const mime = String(file.type || "application/octet-stream").toLowerCase();
  const isPhoto = mime.startsWith("image/") && mime !== "image/svg+xml" && file.size <= 10 * 1024 * 1024;
  const isVideo = mime.startsWith("video/") && file.size <= 20 * 1024 * 1024;
  const method = isPhoto ? "sendPhoto" : isVideo ? "sendVideo" : "sendDocument";
  const field = isPhoto ? "photo" : isVideo ? "video" : "document";
  const body = new FormData();
  body.set("chat_id", chatId);
  body.set(field, file, clean(file.name, 200) || "attachment");
  body.set("caption", clean(file.name, 200) || "Вложение к заявке");
  return telegramRequest(token, method, body);
};

export async function onRequest(context) {
  const { request, env } = context;
  const id = requestId();
  const url = new URL(request.url);
  const origin = request.headers.get("origin") || "";
  const originAllowed = !origin || origin === url.origin || ALLOWED_ORIGINS.has(origin);

  if (request.method === "OPTIONS") {
    if (!originAllowed) return json(403, { ok: false, code: "VALIDATION_ERROR", error: "Origin not allowed" }, "", id);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method === "GET" && url.searchParams.has("health")) {
    return json(200, {
      ok: true,
      configured: Boolean(clean(env.TELEGRAM_BOT_TOKEN) && clean(env.TELEGRAM_CHAT_ID)),
      runtime: "cloudflare-pages"
    }, originAllowed ? origin : "", id);
  }

  if (request.method !== "POST") {
    return json(405, { ok: false, code: "VALIDATION_ERROR", error: "Method not allowed" }, originAllowed ? origin : "", id);
  }
  if (!originAllowed) {
    return json(403, { ok: false, code: "VALIDATION_ERROR", error: "Origin not allowed" }, "", id);
  }

  const token = clean(env.TELEGRAM_BOT_TOKEN, 256);
  const chatId = clean(env.TELEGRAM_CHAT_ID, 128);
  if (!token || !chatId) {
    return json(503, {
      ok: false,
      code: "DELIVERY_FAILED",
      error: "Lead delivery is not configured in Cloudflare."
    }, origin, id);
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_FILES * MAX_FILE_BYTES + 1024 * 1024) {
      return json(413, { ok: false, code: "ATTACHMENT_REJECTED", error: "Вложения слишком большие." }, origin, id);
    }

    const { fields, files } = await parseLead(request);
    if (clean(fields.website, 200) || clean(fields.company_url, 200)) {
      return json(200, { ok: true, mode: "accepted" }, origin, id);
    }

    const privacy = fields.privacy === true || ["1", "true", "on"].includes(String(fields.privacy).toLowerCase());
    if (!clean(fields.name, 120) || (!clean(fields.phone, 64) && !clean(fields.contact, 255)) || !privacy) {
      return json(400, { ok: false, code: "VALIDATION_ERROR", error: "Проверьте заполнение формы." }, origin, id);
    }
    if (files.length > MAX_FILES || files.some(file => file.size > MAX_FILE_BYTES)) {
      return json(400, {
        ok: false,
        code: "ATTACHMENT_REJECTED",
        error: "Можно приложить до 8 файлов размером не более 20 МБ каждый."
      }, origin, id);
    }

    const messageBody = new FormData();
    messageBody.set("chat_id", chatId);
    messageBody.set("text", buildMessage(fields, id, files));
    messageBody.set("disable_web_page_preview", "true");
    const message = await telegramRequest(token, "sendMessage", messageBody);

    if (!message.ok) {
      console.error("Telegram sendMessage failed", {
        requestId: id,
        status: message.status,
        description: clean(message.data?.description, 300)
      });
      return json(502, {
        ok: false,
        code: "DELIVERY_FAILED",
        error: "Telegram не подтвердил доставку заявки."
      }, origin, id);
    }

    let attachmentsSent = 0;
    let attachmentsFailed = 0;
    for (const file of files) {
      const result = await sendAttachment(token, chatId, file);
      if (result.ok) attachmentsSent += 1;
      else attachmentsFailed += 1;
    }

    return json(200, {
      ok: true,
      mode: "telegram",
      attachmentsSent,
      attachmentsFailed
    }, origin, id);
  } catch (error) {
    console.error("Lead handler failed", { requestId: id, error: clean(error?.message, 300) });
    const validation = error?.code === "VALIDATION_ERROR";
    return json(validation ? 400 : 500, {
      ok: false,
      code: validation ? "VALIDATION_ERROR" : "DELIVERY_FAILED",
      error: validation ? "Некорректные данные формы." : "Серверная ошибка при обработке заявки."
    }, origin, id);
  }
}
