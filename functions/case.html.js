const SITE_URL = "https://soglasovano.online";

const clean = (value, max = 500) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const absoluteUrl = value => {
  const path = clean(value, 1000);
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
};

const replaceMeta = (html, attribute, key, value) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `<meta\\s+${attribute}=["']${escapedKey}["']\\s+content=["'][^"']*["']\\s*\\/?>`,
    "i"
  );
  return html.replace(
    expression,
    `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`
  );
};

const getStaticText = async (env, request, pathname) => {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  const response = await env.ASSETS.fetch(new Request(url, request));
  if (!response.ok) throw new Error(`Static asset ${pathname} returned ${response.status}`);
  return response.text();
};

export async function onRequestGet({ request, env }) {
  try {
    const requestUrl = new URL(request.url);
    const slug = clean(requestUrl.searchParams.get("slug"), 160);
    const [template, manifestText] = await Promise.all([
      getStaticText(env, request, "/case.html"),
      getStaticText(env, request, "/data/cases.manifest.json")
    ]);
    const manifest = JSON.parse(manifestText);
    const projects = Array.isArray(manifest?.projects) ? manifest.projects : [];
    const project = projects.find(item => slug && (item?.id === slug || item?.caseKey === slug));

    if (!project) {
      let notFound = template
        .replace('<meta name="robots" content="index,follow" />', '<meta name="robots" content="noindex,nofollow" />')
        .replace("<title>Кейс — Согласовано</title>", "<title>Кейс не найден — Согласовано</title>");
      notFound = replaceMeta(notFound, "name", "description", "Запрошенный кейс не найден.");
      return new Response(notFound, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=60"
        }
      });
    }

    const title = clean(project.title, 140) || "Кейс";
    const pageTitle = `${title} — кейс UX/UI и дизайна | Согласовано`;
    let description = clean(project.description, 220) || `Кейс «${title}» дизайн-студии Согласовано.`;
    if (description.length > 160) description = `${description.slice(0, 157).trim()}…`;
    const canonical = `${SITE_URL}/case.html?slug=${encodeURIComponent(slug)}`;
    const image = absoluteUrl(project.image || "assets/images/brand/og-cover-logo-20261006.jpg");

    let html = template.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(pageTitle)}</title>`);
    html = replaceMeta(html, "name", "description", description);
    html = html.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`
    );
    html = replaceMeta(html, "property", "og:title", pageTitle);
    html = replaceMeta(html, "property", "og:description", description);
    html = replaceMeta(html, "property", "og:url", canonical);
    html = replaceMeta(html, "property", "og:image", image);
    html = replaceMeta(html, "property", "og:image:alt", title);
    html = replaceMeta(html, "name", "twitter:title", pageTitle);
    html = replaceMeta(html, "name", "twitter:description", description);
    html = replaceMeta(html, "name", "twitter:image", image);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          "@id": `${canonical}#case`,
          name: title,
          headline: pageTitle,
          description,
          url: canonical,
          image,
          inLanguage: "ru-RU",
          creator: { "@id": `${SITE_URL}/#organization` },
          keywords: [...(project.tags || []), project.category].filter(Boolean)
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Кейсы", item: `${SITE_URL}/#cases` },
            { "@type": "ListItem", position: 3, name: title, item: canonical }
          ]
        }
      ]
    };
    const schemaJson = JSON.stringify(schema).replace(/</g, "\\u003c");
    html = html.replace(
      "</head>",
      `    <script id="case-structured-data" type="application/ld+json">${schemaJson}</script>\n  </head>`
    );

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=3600",
        "x-robots-tag": "index, follow"
      }
    });
  } catch (error) {
    return new Response("Case rendering failed", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}
