import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const write = (path, text) => writeFile(new URL(path, root), text.replace(/[\t ]+$/gm, ""));
const origin = "https://soglasovano.online";
const escape = value => String(value ?? "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const manifest = JSON.parse(await read("data/cases.manifest.json"));
for (const project of manifest.projects) {
  if (!/^[a-z0-9-]+$/.test(project.id)) throw new Error(`Invalid case id: ${project.id}`);
  project.studioCaseUrl = `./case-${project.id}`;
}
await write("data/cases.manifest.json", JSON.stringify(manifest, null, 2) + "\n");

// Reuse the site's actual renderer so generated and interactive layouts agree.
const context = vm.createContext({
  URL, URLSearchParams,
  window: { location: { origin, href: `${origin}/case.html`, search: "" }, __studioEscapeHtml: escape },
  document: { readyState: "loading", addEventListener() {} }
});
vm.runInContext(await read("assets/js/image-skeleton.js"), context);
vm.runInContext(await read("assets/js/case-page.js"), context);
const template = await read("case.html");
const cfg = { basePath: "/", assetBasePath: "/", studioCases: "./#cases", studioHome: "./" };
for (const [index, project] of manifest.projects.entries()) {
  const url = `${origin}/case-${project.id}`;
  const title = `${project.title} — кейс UX/UI и дизайна | Согласовано`;
  const description = String(project.description || project.subtitle || `Кейс ${project.title} дизайн-студии Согласовано.`).replace(/\s+/g, " ").trim();
  const summary = description.length > 160 ? description.slice(0, 157) + "…" : description;
  const image = new URL(project.image || "/assets/images/brand/og-cover-logo-20261006.jpg", origin).href;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "CreativeWork", "@id": `${url}#case`, name: project.title, description, url, image, inLanguage: "ru-RU", creator: { "@id": `${origin}/#organization` } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: project.title, item: url }
    ] }
  ] };
  let html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]+/, `$1${url}`)
    .replace('<body class="studio-case-page"', `<body data-case-slug="${project.id}" class="studio-case-page"`);
  for (const [attr, key, value] of [
    ["name", "description", summary], ["property", "og:title", title], ["property", "og:description", summary],
    ["property", "og:url", url], ["property", "og:image", image], ["property", "og:image:alt", `Дизайн проекта ${project.title}`],
    ["name", "twitter:title", title], ["name", "twitter:description", summary], ["name", "twitter:image", image]
  ]) html = html.replace(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`), () => `<meta ${attr}="${key}" content="${escape(value)}" />`);
  // Case covers have varying dimensions; omit incorrect fixed OG dimensions.
  html = html.replace(/\s*<meta property="og:image:(width|height)"[^>]+>/g, "");
  context.project = project; context.projects = manifest.projects; context.caseIndex = index; context.cfg = cfg;
  let markup = vm.runInContext("renderCase(project, projects, caseIndex, cfg)", context);
  let galleryIndex = 0;
  markup = markup.replace(/<img\s+([^>]*?)alt=""/g, (_, attrs) => `<img ${attrs}alt="${escape(project.title)} — экран проекта ${++galleryIndex}"`);
  // Skeleton styling is only for client-side loading. Static content stays visible
  // even when scripts are disabled or fail to download.
  markup = markup.replace(/class="media-skeleton(?=[\s"])/g, 'class="media-skeleton is-loaded');
  html = html.replace(/<main class="case-main" id="case-main">[\s\S]*?<\/main>/, () => `<main class="case-main" id="case-main" data-prerendered="true">${markup}</main>`)
    .replace("</head>", `<script id="case-structured-data" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>\n</head>`);
  await write(`case-${project.id}.html`, html);
}

let sitemap = await read("sitemap.xml");
sitemap = sitemap.replace(/case\.html\?slug=([a-z0-9-]+)/g, "case-$1");
await write("sitemap.xml", sitemap);

const cardContext = vm.createContext({
  URL, window: context.window,
  document: { readyState: "loading", addEventListener() {} }
});
vm.runInContext(await read("assets/js/cases.js"), cardContext);
cardContext.projects = manifest.projects; cardContext.cfg = cfg;
const cards = vm.runInContext("projects.map((project, i) => renderProjectCard(project, cfg, i)).join('')", cardContext)
  .replace(/class="media-skeleton(?=[\s"])/g, 'class="media-skeleton is-loaded');
for (const path of ["index.html", "home.html"]) {
  let home = await read(path);
  home = home.replace(/<div class="projects-grid[^\"]*" id="projects-grid"[^>]*>[\s\S]*?<\/div>\s*(?=<div class="studio-cases-more__veil")/,
    () => `<div class="projects-grid" id="projects-grid" data-prerendered="true">${cards}</div>\n`);
  home = home.replace(/case\.html\?slug=([a-z0-9-]+)/g, "case-$1");
  await write(path, home);
}
console.log(`Generated ${manifest.projects.length} complete static case pages.`);
