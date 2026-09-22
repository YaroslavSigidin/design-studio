/** Пути к ресурсам студии с поддержкой локального сервера и GitHub Pages. */
const detectStudioBasePath = () => {
  const pathname = window.location.pathname || "/";

  // The personal profile reuses the studio assets and data from the parent
  // directory instead of maintaining a second copy of the site bundle.
  if (pathname.endsWith("/sigidingo/")) {
    return pathname.slice(0, -"sigidingo/".length);
  }

  if (pathname.endsWith("/")) return pathname;

  const slashIndex = pathname.lastIndexOf("/");
  return slashIndex >= 0 ? pathname.slice(0, slashIndex + 1) : "/";
};

const joinPath = (base, suffix) => `${base.replace(/\/+$/, "")}/${suffix.replace(/^\/+/, "")}`;

const studioBasePath = detectStudioBasePath();

const resolveLeadEndpoint = () => {
  const host = window.location.hostname;

  // Local Node proxy (optional). Production / Timeweb uses same-origin PHP.
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://127.0.0.1:8787/api/leads";
  }

  // The public site can also be opened from the GitHub Pages mirror. Always
  // send leads to the configured PHP origin instead of a static /api path on
  // the mirror, which otherwise returns 404 and looks like a server outage.
  return "https://soglasovano.online/api/leads.php";
};

window.__studioEscapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

window.STUDIO_CONFIG = {
  basePath: studioBasePath,
  assetBasePath: studioBasePath,
  siteUrl: "https://soglasovano.online",
  manifest: joinPath(studioBasePath, "data/cases.manifest.json") + "?v=20260718-roadmap-all",
  studioHome: studioBasePath,
  studioCases: `${studioBasePath}#cases`,
  casePageBase: joinPath(studioBasePath, "case.html"),
  seo: {
    siteName: "Согласовано",
    title: "Дизайн-студия сайтов и интерфейсов — Согласовано",
    description:
      "Разрабатываем сайты, UX/UI-интерфейсы, брендинг и дизайн цифровых продуктов. Кейсы с результатами, прозрачные этапы и стоимость до начала работ.",
    image: "assets/images/brand/og-cover-signature-2026.jpg"
  },
  contacts: {
    name: "Ярослав Сигидин",
    telegramHandle: "sigidingo",
    telegramUrl: "https://t.me/sigidingo",
    vkUrl: "https://vk.com/sigidingo",
    // Показывать MAX только при настоящей ссылке max.ru/u/... (не tel:).
    maxUrl: "",
    phoneDisplay: "+7 961 971-05-15",
    phoneHref: "tel:+79619710515",
    email: "sigidingo@gmail.com",
    emailHref: "mailto:sigidingo@gmail.com"
  },
  crm: {
    provider: "telegram",
    endpoint: resolveLeadEndpoint(),
    // Telegram delivery can take longer than 15 seconds through the origin;
    // keep the browser request alive long enough for the PHP handler to reply.
    timeoutMs: 75000,
    uploadTimeoutMs: 90000,
    // Fallback открывает Telegram/mailto, но НЕ считается подтверждённой заявкой.
    allowFallback: true,
    // Не греем /health на каждом визите — это лишний запрос и утечка конфигурации.
    warmup: false,
    maxAttachments: 8,
    maxAttachmentBytes: 20 * 1024 * 1024
  },
  leadChannel: {
    type: "telegram"
  },
  // analytics.metrikaId — ID счётчика Яндекс.Метрики. Пустая строка отключает счётчик и reachGoal().
  // Цели lead_sent* отправляются через событие studio:lead-sent после успешной заявки.
  analytics: {
    metrikaId: "110947439"
  },
  // Optional Cloudflare Turnstile site key. Leave empty until owner provides keys.
  turnstileSiteKey: "",
  turnstileToken: "",
  promo: {
    // endsAt — ISO-дата окончания акции (с часовым поясом). После дедлайна promo-strip скрывается навсегда.
    endsAt: "2026-07-27T23:59:59+03:00",
    title: "Акция: скидка 10% на лендинг",
    source: "Акция: скидка 10% на лендинг",
    comment: "Запрос по акции: скидка 10% на лендинг.",
    service: "Одностраничный сайт"
  }
};
