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

const joinBasePath = (basePath, suffix = "") => {
  const base = String(basePath || "/").replace(/\/?$/, "/");
  return `${base}${String(suffix || "").replace(/^\/+/, "")}`;
};

const buildAbsoluteUrl = pathOrUrl => {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return window.location.href;
  if (/^https?:\/\//i.test(raw)) return raw;
  return new URL(raw, window.location.origin).toString();
};

const applySeo = options => {
  const title = String(options?.title || document.title || "").trim();
  const description = String(options?.description || "").trim();
  const robots = String(options?.robots || "index,follow,max-image-preview:large").trim();
  const pathname = String(options?.pathname || window.location.pathname).trim();
  const image = String(options?.image || "").trim();
  const url = buildAbsoluteUrl(pathname);

  if (title) document.title = title;

  const descriptionMeta = ensureMetaTag('meta[name="description"]', { name: "description" });
  if (description) descriptionMeta.setAttribute("content", description);

  const robotsMeta = ensureMetaTag('meta[name="robots"]', { name: "robots" });
  robotsMeta.setAttribute("content", robots);

  const canonicalLink = ensureLinkTag('link[rel="canonical"]', { rel: "canonical" });
  canonicalLink.setAttribute("href", url);

  const ogTitle = ensureMetaTag('meta[property="og:title"]', { property: "og:title" });
  const ogDescription = ensureMetaTag('meta[property="og:description"]', { property: "og:description" });
  const ogUrl = ensureMetaTag('meta[property="og:url"]', { property: "og:url" });
  const twitterTitle = ensureMetaTag('meta[name="twitter:title"]', { name: "twitter:title" });
  const twitterDescription = ensureMetaTag('meta[name="twitter:description"]', { name: "twitter:description" });

  if (title) {
    ogTitle.setAttribute("content", title);
    twitterTitle.setAttribute("content", title);
  }

  if (description) {
    ogDescription.setAttribute("content", description);
    twitterDescription.setAttribute("content", description);
  }

  ogUrl.setAttribute("content", url);

  if (image) {
    const absoluteImage = buildAbsoluteUrl(image);
    const ogImage = ensureMetaTag('meta[property="og:image"]', { property: "og:image" });
    const twitterImage = ensureMetaTag('meta[name="twitter:image"]', { name: "twitter:image" });
    ogImage.setAttribute("content", absoluteImage);
    twitterImage.setAttribute("content", absoluteImage);
  }
};

const applyHomeSeo = () => {
  const cfg = window.STUDIO_CONFIG || {};
  applySeo({
    title: "Согласовано — дизайн-студия полного цикла",
    description:
      "Сайты, интерфейсы, брендинг и продуктовый дизайн под реальные бизнес-задачи. От структуры и смыслов до handoff в разработку.",
    pathname: joinBasePath(cfg.basePath || "/"),
    image: joinBasePath(cfg.basePath || "/", "assets/images/favicon.svg")
  });
};

const applyCaseSeo = payload => {
  const cfg = window.STUDIO_CONFIG || {};
  const slug = String(payload?.slug || "").trim();
  const title = `${String(payload?.title || "Кейс").trim()} — Согласовано`;
  const description = String(payload?.description || "Кейс дизайн-студии Согласовано").trim();
  const queryPath = slug
    ? joinBasePath(cfg.basePath || "/", `case.html?slug=${encodeURIComponent(slug)}`)
    : joinBasePath(cfg.basePath || "/", "case.html");

  applySeo({
    title,
    description,
    pathname: queryPath,
    image: payload?.image || joinBasePath(cfg.basePath || "/", "assets/images/favicon.svg")
  });
};

window.__studioSeo = {
  applySeo,
  applyHomeSeo,
  applyCaseSeo
};

const initSeoDefaults = () => {
  if (/case\.html/i.test(window.location.pathname)) return;
  applyHomeSeo();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSeoDefaults, { once: true });
} else {
  initSeoDefaults();
}
