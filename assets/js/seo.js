const ensureMetaTag = (selector, attributes = {}) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  return node;
};

const ensureLinkTag = (selector, attributes = {}) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("link");
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  return node;
};

const ensureJsonLdTag = key => {
  let node = document.head.querySelector(`script[type="application/ld+json"][data-seo-id="${key}"]`);
  if (!node) {
    node = document.createElement("script");
    node.type = "application/ld+json";
    node.dataset.seoId = key;
    document.head.appendChild(node);
  }
  return node;
};

const joinBasePath = (basePath, suffix = "") => {
  const base = String(basePath || "/").replace(/\/?$/, "/");
  return `${base}${String(suffix || "").replace(/^\/+/, "")}`;
};

const getConfig = () => window.STUDIO_CONFIG || {};

const getSiteUrl = cfg => String(cfg?.siteUrl || window.location.origin || "").replace(/\/+$/, "");

const truncateText = (value, maxLength = 190) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
};

const buildAbsoluteUrl = (pathOrUrl, cfg = getConfig()) => {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return `${getSiteUrl(cfg)}/`;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = `${getSiteUrl(cfg)}/`;
  return new URL(raw.replace(/^\.\//, ""), base).toString();
};

const setJsonLd = (key, payload) => {
  const node = ensureJsonLdTag(key);
  node.textContent = JSON.stringify(payload);
};

const getFaqItems = () => [
  {
    question: "С чего начинается работа?",
    answer:
      "С короткого брифа и созвона: уточняем задачу, объем, сроки, ограничения и желаемый результат."
  },
  {
    question: "Можно прийти без четкого ТЗ?",
    answer:
      "Да. Если у вас есть только идея, продукт или набор материалов, поможем собрать рамку проекта и приоритеты."
  },
  {
    question: "Передаете ли материалы разработчикам?",
    answer:
      "Да. Подготавливаем адаптив, состояния, комментарии и логику экранов так, чтобы handoff был предсказуемым."
  },
  {
    question: "Берете только сайты?",
    answer:
      "Нет. Работаем с сайтами, кабинетами, B2B-сервисами, брендингом, презентациями и дизайн-системами."
  }
];

const buildOrganizationSchema = cfg => {
  const siteUrl = getSiteUrl(cfg);
  const contact = cfg.contacts || {};
  const seo = cfg.seo || {};

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#organization`,
    name: contact.organizationName || cfg.siteName || "Согласовано",
    alternateName: cfg.siteName || "Согласовано",
    url: `${siteUrl}/`,
    image: buildAbsoluteUrl(cfg.shareImage || "/assets/images/og-cover.png", cfg),
    logo: buildAbsoluteUrl("/assets/images/icon-512.png", cfg),
    description: cfg.defaultDescription || "",
    telephone: String(contact.phoneHref || "").replace(/^tel:/, ""),
    email: contact.email || "",
    sameAs: cfg.socialProfiles || [],
    priceRange: seo.priceRange || "$$",
    areaServed: seo.areaServed || ["RU"],
    founder: contact.name
      ? {
          "@type": "Person",
          name: contact.name
        }
      : undefined,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: String(contact.phoneHref || "").replace(/^tel:/, ""),
        email: contact.email || "",
        availableLanguage: ["ru"]
      }
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Услуги студии",
      itemListElement: (seo.serviceTypes || []).map((service, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service
        }
      }))
    }
  };
};

const buildWebsiteSchema = cfg => {
  const siteUrl = getSiteUrl(cfg);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: cfg.siteName || "Согласовано",
    inLanguage: "ru-RU",
    publisher: {
      "@id": `${siteUrl}/#organization`
    }
  };
};

const buildFaqSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: getFaqItems().map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
});

const buildBreadcrumbSchema = items => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item
  }))
});

const applySeo = options => {
  const cfg = getConfig();
  const title = String(options?.title || document.title || cfg.defaultTitle || "").trim();
  const description = truncateText(options?.description || cfg.defaultDescription || "", 190);
  const robots = String(options?.robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1").trim();
  const pathname = String(options?.pathname || `${window.location.pathname}${window.location.search}`).trim();
  const image = String(options?.image || cfg.shareImage || "").trim();
  const imageAlt = String(options?.imageAlt || title || cfg.siteName || "").trim();
  const url = buildAbsoluteUrl(pathname, cfg);
  const absoluteImage = image ? buildAbsoluteUrl(image, cfg) : "";
  const ogType = String(options?.ogType || "website").trim();

  if (title) document.title = title;

  ensureMetaTag('meta[name="description"]', { name: "description" }).setAttribute("content", description);
  ensureMetaTag('meta[name="robots"]', { name: "robots" }).setAttribute("content", robots);
  ensureMetaTag('meta[name="author"]', { name: "author" }).setAttribute("content", cfg?.contacts?.name || cfg.siteName || "Согласовано");
  ensureMetaTag('meta[name="referrer"]', { name: "referrer" }).setAttribute("content", "strict-origin-when-cross-origin");
  ensureMetaTag('meta[name="format-detection"]', { name: "format-detection" }).setAttribute("content", "telephone=no");

  ensureLinkTag('link[rel="canonical"]', { rel: "canonical" }).setAttribute("href", url);
  ensureLinkTag('link[rel="alternate"][hreflang="ru-RU"]', {
    rel: "alternate",
    hreflang: "ru-RU"
  }).setAttribute("href", url);
  ensureLinkTag('link[rel="alternate"][hreflang="x-default"]', {
    rel: "alternate",
    hreflang: "x-default"
  }).setAttribute("href", url);

  ensureMetaTag('meta[property="og:type"]', { property: "og:type" }).setAttribute("content", ogType);
  ensureMetaTag('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", title);
  ensureMetaTag('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", description);
  ensureMetaTag('meta[property="og:url"]', { property: "og:url" }).setAttribute("content", url);
  ensureMetaTag('meta[property="og:site_name"]', { property: "og:site_name" }).setAttribute("content", cfg.siteName || "Согласовано");
  ensureMetaTag('meta[property="og:locale"]', { property: "og:locale" }).setAttribute("content", cfg.locale || "ru_RU");

  ensureMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }).setAttribute("content", "summary_large_image");
  ensureMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }).setAttribute("content", title);
  ensureMetaTag('meta[name="twitter:description"]', { name: "twitter:description" }).setAttribute("content", description);

  if (absoluteImage) {
    ensureMetaTag('meta[property="og:image"]', { property: "og:image" }).setAttribute("content", absoluteImage);
    ensureMetaTag('meta[property="og:image:alt"]', { property: "og:image:alt" }).setAttribute("content", imageAlt);
    ensureMetaTag('meta[property="og:image:width"]', { property: "og:image:width" }).setAttribute("content", "1200");
    ensureMetaTag('meta[property="og:image:height"]', { property: "og:image:height" }).setAttribute("content", "630");
    ensureMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }).setAttribute("content", absoluteImage);
    ensureMetaTag('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }).setAttribute("content", imageAlt);
  }
};

const applyHomeSeo = () => {
  const cfg = getConfig();
  applySeo({
    title: cfg.defaultTitle || "Согласовано — дизайн-студия полного цикла",
    description:
      "UX/UI, сайты, брендинг и продуктовый дизайн для бизнеса. Проектируем понятные интерфейсы, сильные лендинги и дизайн-системы под запуск.",
    pathname: "/",
    image: cfg.shareImage || "/assets/images/og-cover.png",
    imageAlt: "Согласовано — дизайн-студия полного цикла",
    ogType: "website"
  });

  setJsonLd("website", buildWebsiteSchema(cfg));
  setJsonLd("organization", buildOrganizationSchema(cfg));
  setJsonLd("faq", buildFaqSchema());
};

const applyCaseSeo = payload => {
  const cfg = getConfig();
  const slug = String(payload?.slug || "").trim();
  const rawTitle = String(payload?.title || "Кейс").trim();
  const title = `${rawTitle} — кейс студии Согласовано`;
  const description = truncateText(
    payload?.description || payload?.summary || "Кейс дизайн-студии Согласовано",
    190
  );
  const image = payload?.image || cfg.shareImage || "/assets/images/og-cover.png";
  const category = String(payload?.category || "Кейс").trim();
  const tags = Array.isArray(payload?.tags) ? payload.tags.filter(Boolean) : [];
  const casePath = slug ? `/case.html?slug=${encodeURIComponent(slug)}` : "/case.html";
  const caseUrl = buildAbsoluteUrl(casePath, cfg);

  applySeo({
    title,
    description,
    pathname: casePath,
    image,
    imageAlt: rawTitle,
    ogType: "article"
  });

  setJsonLd(
    "case-breadcrumbs",
    buildBreadcrumbSchema([
      {
        name: "Согласовано",
        item: `${getSiteUrl(cfg)}/`
      },
      {
        name: "Кейсы",
        item: `${getSiteUrl(cfg)}/#cases`
      },
      {
        name: rawTitle,
        item: caseUrl
      }
    ])
  );

  setJsonLd("case-work", {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${caseUrl}#case`,
    url: caseUrl,
    name: rawTitle,
    headline: rawTitle,
    description,
    image: [buildAbsoluteUrl(image, cfg)],
    inLanguage: "ru-RU",
    genre: category,
    keywords: tags.join(", "),
    author: {
      "@id": `${getSiteUrl(cfg)}/#organization`
    },
    publisher: {
      "@id": `${getSiteUrl(cfg)}/#organization`
    },
    isPartOf: {
      "@id": `${getSiteUrl(cfg)}/#website`
    },
    mainEntityOfPage: caseUrl,
    about: tags.map(tag => ({
      "@type": "Thing",
      name: tag
    }))
  });
};

window.__studioSeo = {
  applySeo,
  applyHomeSeo,
  applyCaseSeo
};

const detectPageType = () => {
  const htmlType = document.documentElement?.dataset?.seoPage;
  if (htmlType) return htmlType;

  const pathname = window.location.pathname || "/";
  if (pathname === "/" || pathname.endsWith("/index.html") || pathname.endsWith("/")) return "home";
  if (/case\.html$/i.test(pathname)) return "case";
  if (/privacy\.html$/i.test(pathname)) return "privacy";
  if (/terms\.html$/i.test(pathname)) return "terms";
  return "generic";
};

const initSeoDefaults = () => {
  const pageType = detectPageType();
  if (pageType === "home") {
    applyHomeSeo();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSeoDefaults, { once: true });
} else {
  initSeoDefaults();
}
