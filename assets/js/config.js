/** Пути к ресурсам студии с поддержкой локального сервера и GitHub Pages. */
const detectStudioBasePath = () => {
  const pathname = window.location.pathname || "/";

  if (pathname.endsWith("/")) return pathname;

  const slashIndex = pathname.lastIndexOf("/");
  return slashIndex >= 0 ? pathname.slice(0, slashIndex + 1) : "/";
};

const joinPath = (base, suffix) => `${base.replace(/\/+$/, "")}/${suffix.replace(/^\/+/, "")}`;

const studioBasePath = detectStudioBasePath();

window.STUDIO_CONFIG = {
  siteUrl: "https://soglasovano.online",
  siteName: "Согласовано",
  locale: "ru_RU",
  defaultTitle: "Согласовано — дизайн-студия полного цикла",
  defaultDescription:
    "UX/UI, сайты, брендинг и продуктовый дизайн для бизнеса. Проектируем понятные интерфейсы, сильные лендинги и дизайн-системы под запуск.",
  shareImage: "/assets/images/og-cover.png",
  basePath: studioBasePath,
  assetBasePath: studioBasePath,
  manifest: joinPath(studioBasePath, "data/cases.manifest.json"),
  studioHome: studioBasePath,
  studioCases: `${studioBasePath}#cases`,
  casePageBase: joinPath(studioBasePath, "case.html"),
  contacts: {
    organizationName: "Согласовано",
    name: "Ярослав Сигидин",
    telegramHandle: "sigidingo",
    telegramUrl: "https://t.me/sigidingo",
    phoneDisplay: "+7 961 971-05-15",
    phoneHref: "tel:+79619710515",
    email: "sigidingo@gmail.com",
    emailHref: "mailto:sigidingo@gmail.com"
  },
  socialProfiles: ["https://t.me/sigidingo"],
  seo: {
    serviceTypes: [
      "UX/UI дизайн",
      "Дизайн лендингов",
      "Дизайн многостраничных сайтов",
      "Продуктовый дизайн",
      "Брендинг и айдентика",
      "Дизайн-системы",
      "Презентации для бизнеса"
    ],
    areaServed: ["RU", "CIS", "Worldwide"],
    priceRange: "$$"
  },
  crm: {
    provider: "telegram-bot",
    endpoint: joinPath(studioBasePath, "telegram-lead.php"),
    timeoutMs: 12000,
    allowFallback: false
  },
  leadChannel: {
    type: "telegram"
  }
};
