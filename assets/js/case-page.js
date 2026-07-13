const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
    ? `<ul class="case-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

const renderTags = tags =>
  tags.length
    ? `<div class="case-tags">${tags.map(tag => `<span class="case-tag">${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";

const renderChapters = chapters =>
  chapters.length
    ? `<div class="case-chapters">${chapters
        .map(
          chapter => `
        <article class="case-chapter">
          <p class="case-chapter-label">${escapeHtml(chapter.label)}</p>
          <h3 class="case-chapter-title">${escapeHtml(chapter.title)}</h3>
          <p class="case-chapter-text">${escapeHtml(chapter.text)}</p>
        </article>`
        )
        .join("")}</div>`
    : "";

const renderSkeletonImage = attrs => window.STUDIO_MEDIA?.renderSkeletonImage(attrs) || "";

const renderGallery = images =>
  images.length
    ? `<section class="case-block case-block--gallery">
        <p class="case-eyebrow">Галерея</p>
        <h2 class="case-block-title">Визуальные материалы</h2>
        <div class="case-gallery">${images
          .map(
            (src, index) => `
          <figure class="case-gallery-item">
            ${renderSkeletonImage({
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
            ${renderSkeletonImage({
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
            `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(link.label || "Сайт")}</a>`
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
      <a class="case-side-arrow case-side-arrow--left" href="${escapeHtml(normalizeCaseHref(prevProject, cfg))}" aria-label="Предыдущий кейс">
        <span aria-hidden="true">‹</span>
      </a>
      <a class="case-side-arrow case-side-arrow--right" href="${escapeHtml(normalizeCaseHref(nextProject, cfg))}" aria-label="Следующий кейс">
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
          <a class="case-related-card" href="${escapeHtml(normalizeCaseHref(item, cfg))}">
            ${renderSkeletonImage({
              src: normalizeAssetUrl(item.image || "", cfg),
              alt: item.title || "Кейс",
              className: "media-skeleton--cover"
            })}
            <div class="case-related-content">
              <span class="case-related-tag">${escapeHtml(getTagLabel(item.category))}</span>
              <h3>${escapeHtml(item.title || "")}</h3>
              <p>${escapeHtml(item.subtitle || "")}</p>
            </div>
          </a>`
          )
          .join("")}
      </div>
    </section>
  `;
};

const BRAND_WORDMARK = `
  <img
    class="brand-wordmark brand-wordmark--footer"
    src="./assets/images/brand/soglasovano-wordmark.svg"
    alt="Согласовано"
    width="993"
    height="242"
    decoding="async"
  />
`;

const renderBottomLeadForm = () => `
  <section class="case-lead-form">
    <div class="case-lead-form__inner">
      <h2>Обсудить проект</h2>
      <form class="case-lead-form__form" data-case-title="${escapeHtml(document.title.replace(" — Согласовано", ""))}">
        <input type="text" name="name" placeholder="Имя" autocomplete="name" required />
        <input type="tel" name="phone" placeholder="Телефон" autocomplete="tel" inputmode="tel" />
        <input type="text" name="contact" placeholder="Telegram / email" autocomplete="email" required />
        <button type="submit">Отправить</button>
      </form>
    </div>
  </section>
`;

const renderCaseFooter = () => `
  <footer class="case-page-footer">
    <div class="case-page-footer__inner">
      <div class="case-page-footer__brand">
        <a href="./" aria-label="Согласовано">${BRAND_WORDMARK}</a>
        <p>Дизайн-студия полного цикла: интерфейсы, сайты, брендинг и сопровождение запуска.</p>
        <div class="case-page-footer__contacts">
          <a data-contact-link="telegram" href="https://t.me/sigidingo" target="_blank" rel="noreferrer">Telegram</a>
          <a data-contact-link="phone" href="tel:+79619710515">Позвонить</a>
          <a data-contact-link="email" href="mailto:sigidingo@gmail.com">Email</a>
        </div>
      </div>
      <div class="case-page-footer__links">
        <a href="./#cases">Кейсы</a>
        <a href="./#services">Услуги</a>
        <a href="./#contacts">Контакты</a>
      </div>
    </div>
    <div class="case-page-footer__bottom">© 2026 Согласовано. Все права защищены.</div>
  </footer>
`;

const renderCase = (project, projects, currentIndex, cfg) => {
  const study = project.study || {};
  const tags = study.tags?.length ? study.tags : project.tags || [];
  const whatDone = study.whatDone?.length ? study.whatDone : [];
  const metrics = study.metrics?.length ? study.metrics : [];
  const chapters = study.storyChapters || [];
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
        <p class="case-text">${escapeHtml(study.task)}</p>
      </section>`
    : project.description
      ? `<section class="case-block">
          <p class="case-eyebrow">О проекте</p>
          <h2 class="case-block-title">Контекст</h2>
          <p class="case-text">${escapeHtml(project.description)}</p>
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
          .map(metric => `<div class="case-metric">${escapeHtml(metric)}</div>`)
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
    description: subtitle,
    image: heroImage,
    slug,
    tags,
    category: getTagLabel(project.category)
  });

  return `
    <nav class="case-breadcrumbs" aria-label="Хлебные крошки">
      <a href="${escapeHtml(cfg.studioHome || "./")}">Согласовано</a>
      <span aria-hidden="true">/</span>
      <a href="${escapeHtml(cfg.studioCases || "./#cases")}">Кейсы</a>
      <span aria-hidden="true">/</span>
      <span>${escapeHtml(title)}</span>
    </nav>

    ${renderCaseNavigationArrows(projects, currentIndex, cfg)}

    <article class="case-article">
      <header class="case-hero">
        <div class="case-hero-copy">
          <span class="case-category">${escapeHtml(getTagLabel(project.category))}</span>
          <h1 class="case-title">${escapeHtml(title)}</h1>
          <p class="case-lead">${escapeHtml(subtitle)}</p>
          ${renderTags(tags)}
          ${renderLiveLinks(project.liveLinks || [])}
        </div>
        <div class="case-hero-media">
          ${
            heroImage
              ? renderSkeletonImage({
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
        <a class="case-back" href="${escapeHtml(cfg.studioCases || "./#cases")}">← Все кейсы</a>
        <a class="case-brief" href="${escapeHtml(cfg.studioHome || "./")}">Оставить бриф</a>
      </footer>
    </article>

    ${renderRelatedCases(projects, project, cfg)}
    ${renderBottomLeadForm()}
    ${renderCaseFooter()}
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
      <p>Страница «${escapeHtml(slug)}» недоступна или ещё не подключена.</p>
      <a class="case-back" href="${escapeHtml(cfg.studioCases || "./#cases")}">← Все кейсы</a>
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
      return;
    }

    const markup = renderCase(project, projects, currentIndex, cfg);
    await dismissCaseLoading(loading);
    root.innerHTML = markup;
    revealCaseMain(root);
    window.STUDIO_MEDIA?.initImageSkeletons(root);
  } catch (err) {
    await dismissCaseLoading(loading);
    root.innerHTML = `
      <div class="case-empty">
        <h1>Не удалось загрузить кейс</h1>
        <p>${escapeHtml(err.message || err)}</p>
        <a class="case-back" href="${escapeHtml(cfg.studioCases || "./#cases")}">← Все кейсы</a>
      </div>
    `;
    console.error("[studio case]", err);
    revealCaseMain(root);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCasePage);
} else {
  initCasePage();
}
