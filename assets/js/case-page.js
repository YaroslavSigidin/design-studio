const loadJson = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

const getSlug = () => new URLSearchParams(window.location.search).get("slug")?.trim() || "";

const getTagLabel = category => (category === "uxui" ? "UX/UI" : "Site");

const isAbsoluteUrl = value => /^https?:\/\//i.test(value || "");

const resolveWithinBase = (value, basePath) => {
  const normalizedBase = String(basePath || "/").replace(/\/?$/, "/");
  const raw = String(value || "").trim().replace(/^\/+/, "");
  return new URL(raw, `${window.location.origin}${normalizedBase}`).toString();
};

const normalizeStudioUrl = (url, cfg) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (isAbsoluteUrl(raw)) return raw;

  const basePath = cfg?.basePath || "/";
  if (raw.startsWith("/local/studio/")) {
    return resolveWithinBase(raw.slice("/local/studio/".length), basePath);
  }

  if (raw.startsWith("/")) {
    return resolveWithinBase(raw, basePath);
  }

  return new URL(raw, window.location.href).toString();
};

const normalizeAssetUrl = (url, cfg) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (isAbsoluteUrl(raw) || raw.startsWith("data:")) return raw;

  const assetBasePath = cfg?.assetBasePath || cfg?.basePath || "/";
  return raw.startsWith("/")
    ? resolveWithinBase(raw, assetBasePath)
    : new URL(raw, window.location.href).toString();
};

const normalizeCaseHref = (project, cfg) => {
  if (project?.studioCaseUrl) return normalizeStudioUrl(project.studioCaseUrl, cfg);
  const slug = project?.id || project?.caseKey || "";
  if (!slug) return cfg?.studioCases || "./#cases";
  const caseBase = cfg?.casePageBase || "./case.html";
  return `${caseBase}?slug=${encodeURIComponent(slug)}`;
};

const renderList = items =>
  items.length
    ? `<ul class="case-list">${items.map(item => `<li>${window.__studioEscapeHtml(item)}</li>`).join("")}</ul>`
    : "";

const renderTags = tags =>
  tags.length
    ? `<div class="case-tags">${tags.map(tag => `<span class="case-tag">${window.__studioEscapeHtml(tag)}</span>`).join("")}</div>`
    : "";

const normalizeStoryChapters = project => {
  const raw = project?.study?.storyChapters?.length
    ? project.study.storyChapters
    : project?.storyChapters || [];

  return raw.map(chapter => ({
    label: chapter?.label || chapter?.title || "",
    title: chapter?.title || "",
    text: chapter?.text || chapter?.body || ""
  }));
};

const renderChapters = chapters =>
  chapters.length
    ? `<div class="case-chapters">${chapters
        .map(
          chapter => `
        <article class="case-chapter">
          <p class="case-chapter-label">${window.__studioEscapeHtml(chapter.label)}</p>
          <h3 class="case-chapter-title">${window.__studioEscapeHtml(chapter.title)}</h3>
          <p class="case-chapter-text">${window.__studioEscapeHtml(chapter.text)}</p>
        </article>`
        )
        .join("")}</div>`
    : "";

const renderMediaSkeleton = attrs => window.STUDIO_MEDIA?.renderSkeletonImage(attrs) || "";

const renderGallery = images =>
  images.length
    ? `<section class="case-block case-block--gallery">
        <p class="case-eyebrow">Галерея</p>
        <h2 class="case-block-title">Визуальные материалы</h2>
        <div class="case-gallery">${images
          .map(
            (src, index) => `
          <figure class="case-gallery-item">
            ${renderMediaSkeleton({
              src,
              className: "media-skeleton--cover",
              eager: index < 2
            })}
          </figure>`
          )
          .join("")}</div>
      </section>`
    : "";

const renderGalleryChunk = (images, startIndex = 0) =>
  images.length
    ? `<section class="case-block case-block--gallery case-block--inline-gallery">
        <div class="case-gallery">${images
          .map(
            (src, index) => `
          <figure class="case-gallery-item">
            ${renderMediaSkeleton({
              src,
              className: "media-skeleton--cover",
              eager: startIndex + index < 2
            })}
          </figure>`
          )
          .join("")}</div>
      </section>`
    : "";

const interleaveBlocksWithGallery = (blocks, images) => {
  const contentBlocks = blocks.filter(Boolean);
  const gallery = images.filter(Boolean);

  if (!contentBlocks.length) return renderGallery(gallery);
  if (!gallery.length) return contentBlocks.join("");

  const slots = contentBlocks.length;
  const perSlotBase = Math.floor(gallery.length / slots);
  let remainder = gallery.length % slots;
  let cursor = 0;
  const html = [];

  contentBlocks.forEach(block => {
    html.push(block);
    const take = perSlotBase + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    if (take <= 0) return;

    const chunk = gallery.slice(cursor, cursor + take);
    html.push(renderGalleryChunk(chunk, cursor));
    cursor += take;
  });

  if (cursor < gallery.length) {
    html.push(renderGalleryChunk(gallery.slice(cursor), cursor));
  }

  return html.join("");
};

const renderLiveLinks = links =>
  links.length
    ? `<div class="case-live-links">${links
        .map(
          link =>
            `<a href="${window.__studioEscapeHtml(link.url)}" target="_blank" rel="noreferrer noopener">${window.__studioEscapeHtml(link.label || "Сайт")}</a>`
        )
        .join("")}</div>`
    : "";

const renderCaseNavigationArrows = (projects, currentIndex, cfg) => {
  if (!projects.length || currentIndex < 0) return "";

  const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
  const nextIndex = (currentIndex + 1) % projects.length;
  const prevProject = projects[prevIndex];
  const nextProject = projects[nextIndex];

  return `
    <nav class="case-side-nav" aria-label="Навигация по кейсам">
      <a class="case-side-arrow case-side-arrow--left" href="${window.__studioEscapeHtml(normalizeCaseHref(prevProject, cfg))}" aria-label="Предыдущий кейс">
        <span aria-hidden="true">‹</span>
      </a>
      <a class="case-side-arrow case-side-arrow--right" href="${window.__studioEscapeHtml(normalizeCaseHref(nextProject, cfg))}" aria-label="Следующий кейс">
        <span aria-hidden="true">›</span>
      </a>
    </nav>
  `;
};

const renderRelatedCases = (projects, currentProject, cfg) => {
  const related = projects
    .filter(item => (item.id || item.caseKey) !== (currentProject.id || currentProject.caseKey))
    .slice(0, 6);

  if (!related.length) return "";

  return `
    <section class="case-related">
      <p class="case-eyebrow">Другие проекты</p>
      <h2 class="case-block-title">Смотрите другие кейсы</h2>
      <div class="case-related-grid">
        ${related
          .map(
            item => `
          <a class="case-related-card" href="${window.__studioEscapeHtml(normalizeCaseHref(item, cfg))}">
            ${renderMediaSkeleton({
              src: normalizeAssetUrl(item.image || "", cfg),
              alt: item.title || "Кейс",
              className: "media-skeleton--cover"
            })}
            <div class="case-related-content">
              <span class="case-related-tag">${window.__studioEscapeHtml(getTagLabel(item.category))}</span>
              <h3>${window.__studioEscapeHtml(item.title || "")}</h3>
              <p>${window.__studioEscapeHtml(item.subtitle || "")}</p>
            </div>
          </a>`
          )
          .join("")}
      </div>
    </section>
  `;
};

const mountCaseFooter = () => {
  const footerRoot = document.getElementById("case-footer-root");
  if (!footerRoot || !window.renderStudioFooter) return;

  footerRoot.innerHTML = window.renderStudioFooter({ home: "./" });
  window.initHeroRequest?.(footerRoot);
};

const renderCase = (project, projects, currentIndex, cfg) => {
  const study = project.study || {};
  const tags = study.tags?.length ? study.tags : project.tags || [];
  const whatDone = study.whatDone?.length ? study.whatDone : [];
  const metrics = study.metrics?.length ? study.metrics : [];
  const chapters = normalizeStoryChapters(project);
  const gallery = Array.isArray(project.gallery)
    ? project.gallery.map(image => normalizeAssetUrl(image, cfg)).filter(Boolean)
    : [];
  const heroImage = normalizeAssetUrl(project.image || gallery[0] || "", cfg);
  const title = study.title || project.title;
  const subtitle = study.subtitle || project.subtitle || project.description || "";
  const slug = project.id || project.caseKey || "";
  const introBlock = study.task
    ? `<section class="case-block">
        <p class="case-eyebrow">Задача</p>
        <h2 class="case-block-title">Цель проекта</h2>
        <p class="case-text">${window.__studioEscapeHtml(study.task)}</p>
      </section>`
    : project.description
      ? `<section class="case-block">
          <p class="case-eyebrow">О проекте</p>
          <h2 class="case-block-title">Контекст</h2>
          <p class="case-text">${window.__studioEscapeHtml(project.description)}</p>
        </section>`
      : "";

  const solutionBlock = whatDone.length
    ? `<section class="case-block">
        <p class="case-eyebrow">Что сделано</p>
        <h2 class="case-block-title">Решение</h2>
        ${renderList(whatDone)}
      </section>`
    : "";

  const metricsBlock = metrics.length
    ? `<section class="case-block">
        <p class="case-eyebrow">Результаты</p>
        <h2 class="case-block-title">Метрики</h2>
        <div class="case-metrics">${metrics
          .map(metric => `<div class="case-metric">${window.__studioEscapeHtml(metric)}</div>`)
          .join("")}</div>
      </section>`
    : "";

  const processBlock = chapters.length
    ? `<section class="case-block">
        <p class="case-eyebrow">Процесс</p>
        <h2 class="case-block-title">Как работали над проектом</h2>
        ${renderChapters(chapters)}
      </section>`
    : "";

  const bodyContent = interleaveBlocksWithGallery(
    [introBlock, solutionBlock, metricsBlock, processBlock],
    gallery
  );

  document.title = `${title} — Согласовано`;
  window.__studioSeo?.applyCaseSeo({
    title,
    description: subtitle || project.description || "",
    image: heroImage,
    slug,
    tags,
    category: getTagLabel(project.category)
  });

  return `
    <nav class="case-breadcrumbs" aria-label="Хлебные крошки">
      <a href="${window.__studioEscapeHtml(cfg.studioHome || "./")}">Согласовано</a>
      <span aria-hidden="true">/</span>
      <a href="${window.__studioEscapeHtml(cfg.studioCases || "./#cases")}">Кейсы</a>
      <span aria-hidden="true">/</span>
      <span>${window.__studioEscapeHtml(title)}</span>
    </nav>

    ${renderCaseNavigationArrows(projects, currentIndex, cfg)}

    <article class="case-article">
      <header class="case-hero">
        <div class="case-hero-copy">
          <span class="case-category">${window.__studioEscapeHtml(getTagLabel(project.category))}</span>
          <h1 class="case-title">${window.__studioEscapeHtml(title)}</h1>
          <p class="case-lead">${window.__studioEscapeHtml(subtitle)}</p>
          ${renderTags(tags)}
          ${renderLiveLinks(project.liveLinks || [])}
        </div>
        <div class="case-hero-media">
          ${
            heroImage
              ? renderMediaSkeleton({
                  src: heroImage,
                  alt: title,
                  width: "1200",
                  height: "630",
                  eager: true,
                  className: "media-skeleton--cover"
                })
              : ""
          }
        </div>
      </header>

      <div class="case-body">
        ${bodyContent}
      </div>

      <footer class="case-footer">
        <a class="case-back" href="${window.__studioEscapeHtml(cfg.studioCases || "./#cases")}">← Все кейсы</a>
        <a class="case-brief" href="#contacts" data-open-brief-modal>Оставить бриф</a>
      </footer>
    </article>

    ${renderRelatedCases(projects, project, cfg)}
  `;
};

const renderNotFound = (slug, cfg) => {
  document.title = "Кейс не найден — Согласовано";
  window.__studioSeo?.applySeo({
    title: "Кейс не найден — Согласовано",
    description: `Кейс «${slug}» не найден или ещё не опубликован.`,
    pathname: `case.html?slug=${encodeURIComponent(slug)}`,
    robots: "noindex,nofollow"
  });
  return `
    <div class="case-empty">
      <h1>Кейс не найден</h1>
      <p>Страница «${window.__studioEscapeHtml(slug)}» недоступна или ещё не подключена.</p>
      <a class="case-back" href="${window.__studioEscapeHtml(cfg.studioCases || "./#cases")}">← Все кейсы</a>
    </div>
  `;
};

const CASE_LOADING_FADE_MS = 340;

const dismissCaseLoading = loading =>
  new Promise(resolve => {
    if (!loading) {
      resolve();
      return;
    }

    loading.classList.add("is-dismissing");
    loading.setAttribute("aria-busy", "false");
    window.setTimeout(() => {
      loading.remove();
      resolve();
    }, CASE_LOADING_FADE_MS);
  });

const revealCaseMain = root => {
  if (!root) return;
  root.classList.remove("is-revealed");
  requestAnimationFrame(() => root.classList.add("is-revealed"));
};

const initCasePage = async () => {
  const root = document.getElementById("case-main");
  const loading = document.querySelector("[data-case-loading]");
  const cfg = window.STUDIO_CONFIG || {};
  const slug = getSlug();

  if (!root) return;

  if (!slug) {
    await dismissCaseLoading(loading);
    root.innerHTML = renderNotFound("", cfg);
    revealCaseMain(root);
    mountCaseFooter();
    return;
  }

  try {
    const manifest = await loadJson(cfg.manifest || "./data/cases.manifest.json");
    const projects = manifest.projects || [];
    const project = projects.find(
      item => item.id === slug || item.caseKey === slug
    );
    const currentIndex = projects.findIndex(item => item.id === slug || item.caseKey === slug);

    if (!project) {
      await dismissCaseLoading(loading);
      root.innerHTML = renderNotFound(slug, cfg);
      revealCaseMain(root);
      mountCaseFooter();
      return;
    }

    const markup = renderCase(project, projects, currentIndex, cfg);
    await dismissCaseLoading(loading);
    root.innerHTML = markup;
    revealCaseMain(root);
    mountCaseFooter();
    window.STUDIO_MEDIA?.initImageSkeletons(root);
    window.dispatchEvent(new CustomEvent("studio:case-rendered"));
  } catch (err) {
    await dismissCaseLoading(loading);
    root.innerHTML = `
      <div class="case-empty">
        <h1>Не удалось загрузить кейс</h1>
        <p>${window.__studioEscapeHtml(err.message || err)}</p>
        <a class="case-back" href="${window.__studioEscapeHtml(cfg.studioCases || "./#cases")}">← Все кейсы</a>
      </div>
    `;
    mountCaseFooter();
    console.error("[studio case]", err);
    revealCaseMain(root);
  }
};

const bindCaseBackLinks = () => {
  document.addEventListener("click", event => {
    const link = event.target.closest("[data-case-back]");
    if (!link) return;
    if (window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    bindCaseBackLinks();
    initCasePage();
  });
} else {
  bindCaseBackLinks();
  initCasePage();
}
