import http from "node:http";
import { randomUUID } from "node:crypto";
import Busboy from "busboy";
import { z } from "zod";

const env = process.env;

const DEFAULT_ORIGINS = [
  "https://yaroslavsigidin.github.io",
  "http://127.0.0.1:8765",
  "http://127.0.0.1:8766",
  "http://localhost:8765",
  "http://localhost:8766"
];

const normalizeOrigin = value => {
  const raw = String(value || "").trim();
  if (!raw || raw === "*") return "";
  try {
    const url = new URL(raw);
    // Origins never include a path — strip accidental path entries from env.
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
};

const config = {
  port: Number(env.PORT || 8787),
  amoBaseUrl: String(env.AMO_BASE_URL || "").replace(/\/+$/, ""),
  amoAccessToken: String(env.AMO_ACCESS_TOKEN || "").trim(),
  amoSourceName: String(env.AMO_SOURCE_NAME || "Сайт Согласовано").trim(),
  amoSourceUid: String(env.AMO_SOURCE_UID || "design-studio-site").trim(),
  amoPipelineId: env.AMO_PIPELINE_ID ? Number(env.AMO_PIPELINE_ID) : null,
  telegramBotToken: String(env.TELEGRAM_BOT_TOKEN || "").trim(),
  telegramChatId: String(env.TELEGRAM_CHAT_ID || "").trim(),
  turnstileSecret: String(env.TURNSTILE_SECRET || "").trim(),
  allowedOrigins: String(env.ALLOWED_ORIGINS || DEFAULT_ORIGINS.join(","))
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean),
  maxBodyBytes: Number(env.MAX_BODY_BYTES || 64 * 1024),
  maxUploadBytes: Number(env.MAX_UPLOAD_BYTES || 40 * 1024 * 1024),
  maxAttachments: Number(env.MAX_ATTACHMENTS || 8),
  maxAttachmentBytes: Number(env.MAX_ATTACHMENT_BYTES || 20 * 1024 * 1024),
  rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(env.RATE_LIMIT_MAX || 12),
  rateLimitMaxNoOrigin: Number(env.RATE_LIMIT_MAX_NO_ORIGIN || 4),
  upstreamTimeoutMs: Number(env.UPSTREAM_TIMEOUT_MS || 10000),
  upstreamRetries: Number(env.UPSTREAM_RETRIES || 1)
};

const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  ATTACHMENT_REJECTED: "ATTACHMENT_REJECTED"
};

const leadSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().max(64).optional().default(""),
    contact: z.string().trim().max(255).optional().default(""),
    service: z.string().trim().max(160).optional().default(""),
    source: z.string().trim().max(160).optional().default(""),
    budget: z.string().trim().max(120).optional().default(""),
    deadline: z.string().trim().max(120).optional().default(""),
    comment: z.string().trim().max(4000).optional().default(""),
    page: z.string().trim().max(500).optional().default(""),
    referer: z.string().trim().max(500).optional().default(""),
    submittedAt: z.string().trim().max(64).optional().default(""),
    privacy: z.union([z.literal(true), z.literal("true"), z.literal(1), z.literal("1")]).optional(),
    // Honeypot — must stay empty.
    website: z.string().max(0).optional().default(""),
    company_url: z.string().max(0).optional().default(""),
    turnstileToken: z.string().trim().max(2048).optional().default("")
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.phone && !value.contact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Нужен телефон или контакт",
        path: ["contact"]
      });
    }
  });

const hasRealAmoToken = () =>
  Boolean(config.amoAccessToken) && config.amoAccessToken !== "put-long-lived-token-here";

const hasAmo = () => Boolean(config.amoBaseUrl && hasRealAmoToken());

const hasTelegram = () => Boolean(config.telegramBotToken && config.telegramChatId);

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  Vary: "Origin"
};

const rateBucket = new Map();

const getClientIp = request => {
  const forwarded = String(request.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwarded || request.socket.remoteAddress || "unknown";
};

const pruneRateBucket = now => {
  for (const [key, entry] of rateBucket.entries()) {
    if (now - entry.start >= config.rateLimitWindowMs) rateBucket.delete(key);
  }
};

const consumeRateLimit = (ip, hasOrigin) => {
  const now = Date.now();
  pruneRateBucket(now);
  const max = hasOrigin ? config.rateLimitMax : config.rateLimitMaxNoOrigin;
  const key = `${ip}:${hasOrigin ? "o" : "n"}`;
  const current = rateBucket.get(key);

  if (!current || now - current.start >= config.rateLimitWindowMs) {
    rateBucket.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: max - 1 };
  }

  current.count += 1;
  if (current.count > max) {
    return { allowed: false, remaining: 0, retryAfterMs: config.rateLimitWindowMs - (now - current.start) };
  }

  return { allowed: true, remaining: Math.max(0, max - current.count) };
};

const isAllowedOrigin = origin => {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  return Boolean(normalized && config.allowedOrigins.includes(normalized));
};

const sendJson = (response, statusCode, payload, origin, extraHeaders = {}) => {
  const headers = { ...jsonHeaders, ...extraHeaders };
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = normalizeOrigin(origin);
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
  }
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(payload));
};

const handleOptions = (response, origin) => {
  if (!origin || !isAllowedOrigin(origin)) {
    response.writeHead(403, { ...jsonHeaders, "Cache-Control": "no-store" });
    response.end();
    return;
  }

  response.writeHead(204, {
    ...jsonHeaders,
    "Access-Control-Allow-Origin": normalizeOrigin(origin),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400"
  });
  response.end();
};

const parseBodyLimited = (request, maxBytes) =>
  new Promise((resolve, reject) => {
    const contentLength = Number(request.headers["content-length"] || 0);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      const error = new Error("Payload too large");
      error.code = ERROR_CODES.VALIDATION_ERROR;
      error.statusCode = 413;
      reject(error);
      return;
    }

    const chunks = [];
    let total = 0;
    let settled = false;

    const fail = (message, statusCode = 413) => {
      if (settled) return;
      settled = true;
      request.destroy();
      const error = new Error(message);
      error.code = ERROR_CODES.VALIDATION_ERROR;
      error.statusCode = statusCode;
      reject(error);
    };

    request.on("data", chunk => {
      total += chunk.length;
      if (total > maxBytes) {
        fail("Payload too large", 413);
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      if (settled) return;
      settled = true;
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        const error = new Error("Некорректный JSON body");
        error.code = ERROR_CODES.VALIDATION_ERROR;
        error.statusCode = 400;
        reject(error);
      }
    });

    request.on("error", error => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });

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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : "";
};

const buildNoteText = (payload, requestId) => {
  const lines = [
    "Новая заявка с сайта «Согласовано»",
    `ID: ${requestId}`,
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

  return lines.join("\n").slice(0, 3900);
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

const fetchWithTimeout = async (url, options = {}, timeoutMs = config.upstreamTimeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const withRetry = async (fn, retries = config.upstreamRetries) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const retryable =
        error?.name === "AbortError" ||
        /timeout|network|ECONNRESET|503|502|429/i.test(String(error?.message || ""));
      if (!retryable || attempt === retries) break;
      await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
};

const logError = (requestId, scope, error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[lead-proxy] ${requestId} ${scope}: ${message}\n`);
};

const verifyTurnstile = async (token, ip) => {
  if (!config.turnstileSecret) return true;
  if (!token) return false;

  const body = new URLSearchParams({
    secret: config.turnstileSecret,
    response: token,
    remoteip: ip
  });

  const response = await fetchWithTimeout("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json().catch(() => ({}));
  return Boolean(data?.success);
};

const amoRequest = async (path, method, body) =>
  withRetry(async () => {
    const response = await fetchWithTimeout(`${config.amoBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.amoAccessToken}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(`amoCRM HTTP ${response.status}`);
    }

    return data;
  });

const createUnsortedLead = async (payload, request, requestId) => {
  const email = detectEmail(payload.contact);
  const phone = sanitizeText(payload.phone, 64);
  const comment = sanitizeText(payload.comment, 4000);
  const sourceUid = buildSourceUid(payload);
  const leadName = buildLeadName(payload);
  const price = parseBudget(payload.budget);
  const nowTs = Math.floor(Date.now() / 1000);
  const noteText = buildNoteText(payload, requestId);
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
      request_id: requestId,
      source_uid: sourceUid,
      source_name: config.amoSourceName,
      pipeline_id: config.amoPipelineId || undefined,
      created_at: nowTs,
      metadata: {
        ip: getClientIp(request),
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
  if (!leadId) {
    throw new Error("amoCRM returned no leadId");
  }

  await amoRequest("/api/v4/leads/notes", "POST", [
    {
      entity_id: leadId,
      note_type: "common",
      params: {
        text: comment ? `${noteText}\n\nТекст задачи:\n${comment}` : noteText
      }
    }
  ]);

  return { leadId };
};

const sendTelegramMessage = async text =>
  withRetry(async () => {
    const response = await fetchWithTimeout(
      `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text,
          disable_web_page_preview: true
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
      throw new Error(`Telegram HTTP ${response.status}`);
    }

    return { messageId: data?.result?.message_id || null };
  });

const sendTelegramFile = async (file, requestId) => {
  const mime = String(file.mime || "application/octet-stream").toLowerCase();
  const isImage = mime.startsWith("image/") && mime !== "image/svg+xml";
  const isVideo = mime.startsWith("video/");
  const usePhoto = isImage && file.buffer.length <= 10 * 1024 * 1024;
  const useVideo = isVideo && file.buffer.length <= 50 * 1024 * 1024;
  const method = usePhoto ? "sendPhoto" : useVideo ? "sendVideo" : "sendDocument";
  const field = usePhoto ? "photo" : useVideo ? "video" : "document";

  const form = new FormData();
  form.append("chat_id", config.telegramChatId);
  form.append(field, new Blob([file.buffer], { type: mime }), file.filename || "file");
  form.append("caption", String(file.filename || "file").slice(0, 200));

  const response = await fetchWithTimeout(
    `https://api.telegram.org/bot${config.telegramBotToken}/${method}`,
    { method: "POST", body: form },
    60000
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(`Telegram ${method} failed for ${requestId}`);
  }
  return true;
};

const parseMultipart = (request, maxBytes) =>
  new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    let total = 0;
    let settled = false;

    const fail = (message, code = ERROR_CODES.VALIDATION_ERROR, statusCode = 400) => {
      if (settled) return;
      settled = true;
      const error = new Error(message);
      error.code = code;
      error.statusCode = statusCode;
      reject(error);
    };

    let busboy;
    try {
      busboy = Busboy({
        headers: request.headers,
        limits: {
          files: config.maxAttachments,
          fileSize: config.maxAttachmentBytes,
          fieldSize: 32 * 1024
        }
      });
    } catch (error) {
      fail("Некорректный multipart body");
      return;
    }

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", (name, stream, info) => {
      if (!String(name).startsWith("attachments")) {
        stream.resume();
        return;
      }
      const chunks = [];
      stream.on("data", chunk => {
        total += chunk.length;
        if (total > maxBytes) {
          stream.destroy();
          fail("Payload too large", ERROR_CODES.VALIDATION_ERROR, 413);
          return;
        }
        chunks.push(chunk);
      });
      stream.on("limit", () => {
        fail("Файл слишком большой (лимит 20 МБ).", ERROR_CODES.ATTACHMENT_REJECTED, 400);
      });
      stream.on("end", () => {
        if (settled) return;
        const buffer = Buffer.concat(chunks);
        if (!buffer.length) return;
        files.push({
          filename: info?.filename || "file",
          mime: info?.mimeType || "application/octet-stream",
          buffer
        });
      });
    });

    busboy.on("error", () => fail("Некорректный multipart body"));
    busboy.on("finish", () => {
      if (settled) return;
      settled = true;
      resolve({ fields, files });
    });

    request.pipe(busboy);
  });

const parseLeadRequest = async request => {
  const contentType = String(request.headers["content-type"] || "");
  if (contentType.includes("multipart/form-data")) {
    const parsed = await parseMultipart(request, config.maxUploadBytes);
    return {
      body: {
        ...parsed.fields,
        privacy:
          parsed.fields.privacy === true ||
          parsed.fields.privacy === "true" ||
          parsed.fields.privacy === "1" ||
          parsed.fields.privacy === 1
      },
      files: parsed.files
    };
  }

  const rawBody = await parseBodyLimited(request, config.maxBodyBytes);
  return { body: rawBody, files: [] };
};

const submitLead = async (payload, request, requestId, files = []) => {
  const errors = [];
  let telegram = null;
  let amocrm = null;
  let attachmentsSent = 0;
  let attachmentsFailed = 0;

  if (hasTelegram()) {
    try {
      const note = buildNoteText(payload, requestId);
      const withFiles =
        files.length > 0
          ? `${note}\n\nВложений: ${files.length}\n${files
              .map((file, index) => `${index + 1}. ${file.filename} (${file.mime})`)
              .join("\n")}`
          : note;
      telegram = await sendTelegramMessage(withFiles.slice(0, 3900));
      for (const file of files) {
        try {
          await sendTelegramFile(file, requestId);
          attachmentsSent += 1;
        } catch (error) {
          logError(requestId, "telegram-file", error);
          attachmentsFailed += 1;
        }
      }
    } catch (error) {
      logError(requestId, "telegram", error);
      errors.push("telegram");
    }
  }

  if (hasAmo()) {
    try {
      amocrm = await createUnsortedLead(payload, request, requestId);
    } catch (error) {
      logError(requestId, "amocrm", error);
      errors.push("amocrm");
    }
  }

  if (telegram?.messageId) {
    return { ok: true, mode: "telegram", telegram, amocrm, attachmentsSent, attachmentsFailed };
  }

  if (amocrm?.leadId) {
    return { ok: true, mode: "crm", telegram, amocrm, attachmentsSent, attachmentsFailed };
  }

  const error = new Error(errors.join(",") || "Lead delivery is not configured");
  error.code = ERROR_CODES.DELIVERY_FAILED;
  throw error;
};

const publicError = (code, requestId, statusCode = 400) => ({
  statusCode,
  body: {
    ok: false,
    code,
    requestId,
    error:
      code === ERROR_CODES.RATE_LIMITED
        ? "Слишком много запросов. Попробуйте позже."
        : code === ERROR_CODES.VALIDATION_ERROR
          ? "Проверьте заполнение формы."
          : code === ERROR_CODES.ATTACHMENT_REJECTED
            ? "Вложение отклонено."
            : "Не удалось отправить заявку. Попробуйте ещё раз."
  }
});

const server = http.createServer(async (request, response) => {
  const origin = String(request.headers.origin || "");
  const requestId = randomUUID();

  if (request.method === "OPTIONS") {
    handleOptions(response, origin);
    return;
  }

  if ((request.url === "/health" || request.url?.startsWith("/health?")) && request.method === "GET") {
    // Public health: no CORS reflection of secrets, no config leak.
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (request.url !== "/api/leads" || request.method !== "POST") {
    sendJson(response, 404, { ok: false, code: "VALIDATION_ERROR", requestId, error: "Not found" }, origin);
    return;
  }

  if (origin && !isAllowedOrigin(origin)) {
    sendJson(response, 403, publicError(ERROR_CODES.VALIDATION_ERROR, requestId, 403).body, "");
    return;
  }

  const rate = consumeRateLimit(getClientIp(request), Boolean(origin));
  if (!rate.allowed) {
    const payload = publicError(ERROR_CODES.RATE_LIMITED, requestId, 429);
    sendJson(response, payload.statusCode, payload.body, origin, {
      "Retry-After": String(Math.ceil((rate.retryAfterMs || config.rateLimitWindowMs) / 1000))
    });
    return;
  }

  try {
    const { body: rawBody, files } = await parseLeadRequest(request);

    if (rawBody?.website || rawBody?.company_url) {
      // Honeypot trip: pretend success to bots, do not deliver.
      sendJson(response, 200, { ok: true, mode: "accepted", requestId }, origin);
      return;
    }

    if (Array.isArray(rawBody?.attachments) && rawBody.attachments.length) {
      // Reject base64 JSON attachments — only multipart files are accepted.
      const payload = publicError(ERROR_CODES.ATTACHMENT_REJECTED, requestId, 400);
      sendJson(response, payload.statusCode, payload.body, origin);
      return;
    }

    if (files.length > config.maxAttachments) {
      const payload = publicError(ERROR_CODES.ATTACHMENT_REJECTED, requestId, 400);
      sendJson(response, payload.statusCode, payload.body, origin);
      return;
    }

    const parsed = leadSchema.safeParse(rawBody);
    if (!parsed.success) {
      const payload = publicError(ERROR_CODES.VALIDATION_ERROR, requestId, 400);
      sendJson(response, payload.statusCode, payload.body, origin);
      return;
    }

    const body = parsed.data;

    if (config.turnstileSecret) {
      const turnstileOk = await verifyTurnstile(body.turnstileToken, getClientIp(request));
      if (!turnstileOk) {
        const payload = publicError(ERROR_CODES.VALIDATION_ERROR, requestId, 400);
        sendJson(response, payload.statusCode, payload.body, origin);
        return;
      }
    }

    if (!hasTelegram() && !hasAmo()) {
      logError(requestId, "config", new Error("Lead delivery env is not configured"));
      const payload = publicError(ERROR_CODES.DELIVERY_FAILED, requestId, 503);
      sendJson(response, payload.statusCode, payload.body, origin);
      return;
    }

    const delivery = await submitLead(body, request, requestId, files);

    sendJson(
      response,
      200,
      {
        ok: true,
        mode: delivery.mode,
        requestId,
        attachmentsSent: delivery.attachmentsSent || 0,
        attachmentsFailed: delivery.attachmentsFailed || 0
      },
      origin
    );
  } catch (error) {
    logError(requestId, "request", error);
    const code = error?.code || ERROR_CODES.DELIVERY_FAILED;
    const statusCode = Number(error?.statusCode) || (code === ERROR_CODES.VALIDATION_ERROR ? 400 : 502);
    const payload = publicError(code, requestId, statusCode);
    sendJson(response, payload.statusCode, payload.body, origin);
  }
});

server.listen(config.port, () => {
  process.stdout.write(
    `Lead proxy listening on http://127.0.0.1:${config.port} (origins: ${config.allowedOrigins.length}, turnstile: ${Boolean(config.turnstileSecret)})\n`
  );
});
