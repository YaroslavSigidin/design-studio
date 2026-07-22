(() => {
  const cfg = () => window.STUDIO_CONFIG || {};

  const absoluteUrl = (path = "") => {
    const siteUrl = String(cfg().siteUrl || "").replace(/\/+$/, "");
    const raw = String(path || "").trim();
    if (!raw) return siteUrl || window.location.origin;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("//")) return `${window.location.protocol}${raw}`;
    if (!siteUrl) return new URL(raw, window.location.href).toString();
    return `${siteUrl}/${raw.replace(/^\/+/, "")}`;
  };

  const ensureMeta = (attr, key, content) => {
    if (!content) return;
    let node = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attr, key);
      document.head.appendChild(node);
    }
    node.setAttribute("content", content);
  };

  const ensureLink = (rel, href) => {
    if (!href) return;
    let node = document.head.querySelector(`link[rel="${rel}"]`);
    if (!node) {
      node = document.createElement("link");
      node.setAttribute("rel", rel);
      document.head.appendChild(node);
    }
    node.setAttribute("href", href);
  };

  const ensureJsonLd = (id, value) => {
    if (!value) return;
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement("script");
      node.id = id;
      node.type = "application/ld+json";
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(value);
  };

  const applySeo = ({
    title,
    description,
    pathname,
    image,
    robots = "index,follow",
    type = "website"
  } = {}) => {
    const defaults = cfg().seo || {};
    const nextTitle = title || document.title || defaults.title || "Согласовано";
    const nextDescription =
      description ||
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      defaults.description ||
      "";
    const nextImage = absoluteUrl(image || defaults.image || "assets/images/brand/og-cover.png");
    const nextUrl = absoluteUrl(pathname || window.location.pathname + window.location.search);

    document.title = nextTitle;
    ensureMeta("name", "description", nextDescription);
    ensureMeta("name", "robots", robots);
    ensureLink("canonical", nextUrl);

    ensureMeta("property", "og:type", type);
    ensureMeta("property", "og:locale", "ru_RU");
    ensureMeta("property", "og:site_name", defaults.siteName || "Согласовано");
    ensureMeta("property", "og:title", nextTitle);
    ensureMeta("property", "og:description", nextDescription);
    ensureMeta("property", "og:url", nextUrl);
    ensureMeta("property", "og:image", nextImage);

    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", nextTitle);
    ensureMeta("name", "twitter:description", nextDescription);
    ensureMeta("name", "twitter:image", nextImage);
  };

  const applyCaseSeo = ({ title, description, image, slug, tags = [], category } = {}) => {
    const caseTitle = title
      ? `${title} — кейс UX/UI и дизайна | Согласовано`
      : "Кейс — Согласовано";
    const tagLine = [...(Array.isArray(tags) ? tags : []), category].filter(Boolean).join(", ");
    const rawCaseDescription =
      description ||
      (tagLine
        ? `Кейс «${title}»: ${tagLine}. Дизайн-студия Согласовано.`
        : `Кейс дизайн-студии Согласовано${title ? `: ${title}` : ""}.`);
    const normalizedDescription = String(rawCaseDescription).replace(/\s+/g, " ").trim();
    const caseDescription =
      normalizedDescription.length > 160
        ? `${normalizedDescription.slice(0, 157)}…`
        : normalizedDescription;

    applySeo({
      title: caseTitle,
      description: caseDescription,
      pathname: slug ? `case.html?slug=${encodeURIComponent(slug)}` : "case.html",
      image,
      robots: "index,follow",
      type: "article"
    });

    if (slug) {
      const siteRoot = absoluteUrl("").replace(/\/$/, "");
      const url = absoluteUrl(`case.html?slug=${encodeURIComponent(slug)}`);
      ensureJsonLd("case-structured-data", {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CreativeWork",
            "@id": `${url}#case`,
            name: title,
            headline: caseTitle,
            description: caseDescription,
            url,
            image: absoluteUrl(image || "assets/images/brand/og-cover.png"),
            inLanguage: "ru-RU",
            creator: { "@id": `${siteRoot}/#organization` },
            keywords: [...(Array.isArray(tags) ? tags : []), category].filter(Boolean)
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: `${siteRoot}/` },
              { "@type": "ListItem", position: 2, name: "Кейсы", item: `${siteRoot}/#cases` },
              { "@type": "ListItem", position: 3, name: title, item: url }
            ]
          }
        ]
      });
    }
  };

  window.__studioSeo = { applySeo, applyCaseSeo, absoluteUrl };

  const boot = () => {
    const page = document.body?.dataset?.seoPage;
    if (page === "home") {
      applySeo({
        title: cfg().seo?.title,
        description: cfg().seo?.description,
        pathname: "",
        image: cfg().seo?.image
      });
    } else if (page === "legal") {
      applySeo({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || cfg().seo?.description,
        pathname: window.location.pathname.split("/").pop() || "",
        robots: "index,follow"
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
