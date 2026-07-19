/** Пути к ресурсам студии с поддержкой локального сервера и GitHub Pages. */
const detectStudioBasePath = () => {
  const pathname = window.location.pathname || "/";

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

  return joinPath(studioBasePath, "api/leads.php");
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
  siteUrl: "https://yaroslavsigidin.github.io/design-studio",
  manifest: joinPath(studioBasePath, "data/cases.manifest.json") + "?v=20260718-roadmap-all",
  studioHome: studioBasePath,
  studioCases: `${studioBasePath}#cases`,
  casePageBase: joinPath(studioBasePath, "case.html"),
  seo: {
    siteName: "Согласовано",
    title: "Согласовано — дизайн-студия полного цикла",
    description:
      "Согласовано — дизайн-студия полного цикла. UX/UI, сайты, брендинг и продуктовый дизайн под задачи вашего бизнеса.",
    image: "assets/images/brand/og-cover.png"
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
    timeoutMs: 15000,
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
    metrikaId: ""
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
