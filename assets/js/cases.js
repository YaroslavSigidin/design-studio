const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];

const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const loadJson = async (url, timeoutMs = 2500) => {
  const timeoutPromise = new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error(`${url} → timeout (${timeoutMs}ms)`)), timeoutMs);
  });
  const responsePromise = fetch(url, { cache: "no-store" });
  const res = await Promise.race([responsePromise, timeoutPromise]);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

const getTagLabel = category => (category === "uxui" ? "UX/UI" : "Site");

const buildProjectSearchText = project =>
  [
    project?.title,
    project?.subtitle,
    project?.description,
    ...(project?.tags || []),
    ...(project?.study?.tags || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const matchesProjectFilter = (card, filter) => {
  const category = card.dataset.category || "";
  const search = String(card.dataset.search || "").toLowerCase();
  const tags = String(card.dataset.filterTags || search).toLowerCase();

  if (filter === "all") return true;
  if (filter === "uxui") return category === "uxui";
  if (filter === "web") return category === "web";
  if (filter === "logo") return /логотип|logo/.test(search) || /логотип|logo/.test(tags);
  if (filter === "identity") return /айдентик|identity|фирменн/.test(search) || /айдентик|identity|фирменн/.test(tags);
  if (filter === "branding") return /брендинг|бренд|branding/.test(search) || /брендинг|бренд|branding/.test(tags);
  if (filter === "presentation") return /презентац|presentation/.test(search) || /презентац|presentation/.test(tags);
  return false;
};

const isAbsoluteUrl = value => /^https?:\/\//i.test(value || "");

const resolveWithinBase = (value, basePath) => {
  const normalizedBase = String(basePath || "/").replace(/\/?$/, "/");
  const raw = String(value || "").trim().replace(/^\/+/, "");
  return new URL(raw, `${window.location.origin}${normalizedBase}`).toString();
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

const getCaseHref = (project, cfg) => {
  if (project?.studioCaseUrl) return normalizeStudioUrl(project.studioCaseUrl, cfg);
  const casePageBase = normalizeStudioUrl(cfg?.casePageBase || "./case.html", cfg);
  const slug = project?.id || project?.caseKey || "";
  if (!slug) return "";
  return `${casePageBase}?slug=${encodeURIComponent(slug)}`;
};

const pickProjects = manifest => {
  if (Array.isArray(manifest?.projects)) return manifest.projects;
  if (Array.isArray(manifest?.items)) return manifest.items;
  if (Array.isArray(manifest)) return manifest;
  return [];
};

const SKELETON_CARDS_COUNT = 6;
const CASES_VISIBLE_LIMIT = 9;
const EXTRA_PLACEHOLDER_CASE = {
  id: "placeholder-case",
  category: "web",
  title: "Ваш проект может быть здесь",
  subtitle: "Запустим дизайн под вашу задачу",
  tags: ["placeholder"],
  isPlaceholder: true
};

const renderSkeletonImage = attrs => window.STUDIO_MEDIA?.renderSkeletonImage(attrs) || "";

const renderCasesSkeleton = (grid, count = SKELETON_CARDS_COUNT) => {
  if (!grid) return;
  grid.classList.add("is-loading");
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = Array.from({ length: count })
    .map(
      () => `
      <article class="project-card case-skeleton" aria-hidden="true">
        <div class="case-skeleton-media"></div>
        <div class="content">
          <span class="tag"> </span>
          <h3> </h3>
          <p> </p>
        </div>
      </article>
    `
    )
    .join("");
};

const loadManifestWithFallback = async cfg => {
  const basePath = cfg?.basePath || "/";
  const candidates = [...new Set([
    cfg?.manifest,
    "./data/cases.manifest.json",
    `${basePath}data/cases.manifest.json`,
    "./data/cases.manifest.json",
    "data/cases.manifest.json"
  ].filter(Boolean))];

  const attempts = candidates.map(url =>
    loadJson(url).then(manifest => ({ manifest, sourceUrl: url }))
  );

  try {
    return await Promise.any(attempts);
  } catch {
    const settled = await Promise.allSettled(
      candidates.map(url => loadJson(url).then(() => url))
    );
    const errors = settled
      .filter(item => item.status === "rejected")
      .map(item => item.reason?.message || String(item.reason));
    throw new Error(errors.join(" | "));
  }
};

const renderProjectCard = (project, cfg) => {
  const tagLabel = getTagLabel(project.category);
  const caseHref = getCaseHref(project, cfg);
  const image = normalizeAssetUrl(project.image || project.cover || "", cfg);
  const isPlaceholder = Boolean(project.isPlaceholder);
  const filterTags = [...(project.tags || []), ...(project.study?.tags || [])].join(" ").toLowerCase();
  const imageMarkup = isPlaceholder
    ? `<div class="project-placeholder-media" aria-hidden="true"></div>`
    : renderSkeletonImage({
        src: image,
        alt: project.title,
        width: "1200",
        height: "630",
        className: "media-skeleton--cover"
      });

  return `
    <article
      class="project-card${isPlaceholder ? " project-card--placeholder" : ""}"
      data-project-id="${escapeHtml(project.id)}"
      data-category="${escapeHtml(project.category || "web")}"
      data-search="${escapeHtml(buildProjectSearchText(project))}"
      data-filter-tags="${escapeHtml(filterTags)}"
      ${caseHref ? `data-case-url="${escapeHtml(caseHref)}" tabindex="0"` : ""}
    >
      ${imageMarkup}
      <div class="content">
        <span class="tag">${isPlaceholder ? "NEW" : tagLabel}</span>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.subtitle || "")}</p>
      </div>
    </article>
  `;
};

const bindCardNavigation = grid => {
  if (!grid || grid.dataset.navBound === "true") return;

  grid.addEventListener("click", event => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    const href = card.dataset.caseUrl;
    if (!href) return;
    window.location.href = href;
  });

  grid.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".project-card");
    if (!card) return;
    event.preventDefault();
    const href = card.dataset.caseUrl;
    if (href) window.location.href = href;
  });

  grid.dataset.navBound = "true";
};

const updateCasesStackClip = (grid, stack, collapsed) => {
  if (!stack) return;

  const clip = qs("[data-cases-clip]", stack) || qs(".studio-cases-clip", stack);

  if (!collapsed) {
    stack.classList.remove("is-collapsed");
    if (clip) clip.style.maxHeight = "";
    return;
  }

  stack.classList.add("is-collapsed");

  const visibleCards = [...qsa(".project-card", grid)].filter(
    card => !card.hidden && !card.classList.contains("project-card--beyond-limit")
  );
  const firstBeyond = qs(".project-card--beyond-limit", grid);
  const lastVisible = visibleCards[visibleCards.length - 1];

  if (!clip || !lastVisible || !firstBeyond) {
    if (clip) clip.style.maxHeight = "";
    return;
  }

  const clipTop = clip.getBoundingClientRect().top;
  const lastVisibleBottom = lastVisible.getBoundingClientRect().bottom - clipTop;
  const beyondHeight = firstBeyond.getBoundingClientRect().height;
  const peek = Math.min(Math.max(beyondHeight * 0.52, 96), 220);

  clip.style.maxHeight = `${lastVisibleBottom + peek}px`;
};

const scheduleCasesStackClip = (grid, stack, collapsed) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      updateCasesStackClip(grid, stack, collapsed);
    });
  });
};

const TAB_SWITCH_OUT_MS = 220;
const TAB_SWITCH_IN_MS = 480;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateTabsIndicator = (tabsRoot, activeTab) => {
  const indicator = qs("[data-tabs-indicator]", tabsRoot);
  if (!indicator || !activeTab) return;

  const tabsRect = tabsRoot.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();
  const x = tabRect.left - tabsRect.left + tabsRoot.scrollLeft;
  const y = tabRect.top - tabsRect.top + tabsRoot.scrollTop;

  indicator.style.width = `${tabRect.width}px`;
  indicator.style.height = `${tabRect.height}px`;
  indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  tabsRoot.classList.add("is-ready");
};

const initTabsIndicator = tabsRoot => {
  if (!tabsRoot || tabsRoot.dataset.indicatorBound === "true") return;

  const sync = () => {
    const activeTab = qs(".tab-button.active", tabsRoot) || qs(".tab-button", tabsRoot);
    updateTabsIndicator(tabsRoot, activeTab);
  };

  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("load", sync, { passive: true });
  tabsRoot.addEventListener("scroll", sync, { passive: true });
  window.setTimeout(sync, 80);
  window.setTimeout(sync, 320);
  if (document.fonts?.ready) {
    document.fonts.ready.then(sync).catch(() => {});
  }
  tabsRoot.dataset.indicatorBound = "true";
};

const setActiveTab = (tabsRoot, tab) => {
  qsa(".tab-button", tabsRoot).forEach(item => {
    const isActive = item === tab;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  updateTabsIndicator(tabsRoot, tab);
};

const revealFilteredCards = grid => {
  if (!grid) return;

  qsa(".project-card", grid).forEach(card => card.classList.remove("is-filter-reveal"));

  if (prefersReducedMotion()) return;

  const visibleCards = qsa(".project-card", grid).filter(
    card => !card.hidden && !card.classList.contains("project-card--beyond-limit")
  );

  visibleCards.forEach((card, index) => {
    card.style.setProperty("--case-reveal-delay", `${Math.min(index * 42, 360)}ms`);
    card.classList.add("is-filter-reveal");
  });

  window.setTimeout(() => {
    qsa(".project-card.is-filter-reveal", grid).forEach(card => {
      card.classList.remove("is-filter-reveal");
      card.style.removeProperty("--case-reveal-delay");
    });
  }, TAB_SWITCH_IN_MS + 420);
};

const initCasesFilter = (grid, tabsRoot) => {
  if (!grid || !tabsRoot || tabsRoot.dataset.filterBound === "true") return;

  let activeFilter = "all";
  let expanded = false;
  let switching = false;
  const stack = qs("#studioCasesStack");
  const moreWrap = qs("#studioCasesMore");
  const moreButton = qs("#studioCasesMoreButton");

  initTabsIndicator(tabsRoot);

  const applyFilter = ({ animate = false } = {}) => {
    let visibleCount = 0;
    const limit = CASES_VISIBLE_LIMIT;

    qsa(".project-card", grid).forEach(card => {
      const matches = matchesProjectFilter(card, activeFilter);
      if (!matches) {
        card.hidden = true;
        card.classList.remove("project-card--beyond-limit");
        card.removeAttribute("aria-hidden");
        return;
      }

      visibleCount += 1;
      const isBeyond = !expanded && visibleCount > limit;
      card.hidden = false;
      card.classList.toggle("project-card--beyond-limit", isBeyond);
      if (isBeyond) {
        card.setAttribute("aria-hidden", "true");
      } else {
        card.removeAttribute("aria-hidden");
      }
    });

    const shouldShowMore = visibleCount > limit && !expanded;
    if (moreWrap) moreWrap.hidden = !shouldShowMore;
    scheduleCasesStackClip(grid, stack, shouldShowMore);

    if (animate) revealFilteredCards(grid);
  };

  const switchFilter = (tab, nextFilter) => {
    if (switching || nextFilter === activeFilter) return;

    switching = true;
    setActiveTab(tabsRoot, tab);
    expanded = false;

    if (prefersReducedMotion()) {
      activeFilter = nextFilter;
      applyFilter();
      switching = false;
      return;
    }

    grid.classList.add("is-tab-switching");

    window.setTimeout(() => {
      activeFilter = nextFilter;
      applyFilter({ animate: true });
      grid.classList.remove("is-tab-switching");
      switching = false;
    }, TAB_SWITCH_OUT_MS);
  };

  qsa(".tab-button", tabsRoot).forEach(tab => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", tab.classList.contains("active") ? "true" : "false");
    tab.addEventListener("click", () => {
      switchFilter(tab, tab.dataset.filter || "all");
    });
  });

  moreButton?.addEventListener("click", () => {
    expanded = true;
    applyFilter({ animate: true });
  });

  grid.addEventListener("load", () => scheduleCasesStackClip(grid, stack, stack?.classList.contains("is-collapsed")), true);

  window.addEventListener("resize", () => {
    expanded = false;
    applyFilter();
    updateTabsIndicator(tabsRoot, qs(".tab-button.active", tabsRoot));
  });

  applyFilter();
  tabsRoot.dataset.filterBound = "true";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      updateTabsIndicator(tabsRoot, qs(".tab-button.active", tabsRoot));
    });
  });
};

const renderCasesGrid = (grid, projects, cfg) =>
  new Promise(resolve => {
    if (!grid) {
      resolve();
      return;
    }

    grid.classList.add("is-swapping");
    window.setTimeout(() => {
      grid.classList.remove("is-loading", "is-swapping");
      grid.removeAttribute("aria-busy");
      const items = [...projects, EXTRA_PLACEHOLDER_CASE];
      grid.innerHTML = items.map(project => renderProjectCard(project, cfg)).join("");
      bindCardNavigation(grid);
      window.STUDIO_MEDIA?.initImageSkeletons(grid);
      resolve();
    }, 120);
  });

const initCases = async () => {
  const grid = qs("#projects-grid");
  const tabsRoot = qs("#projectTabs");
  const statusEl = qs("[data-cases-status]");
  const cfg = window.STUDIO_CONFIG || {};

  if (!grid) return;
  if (grid.dataset.initInProgress === "true") return;
  if (grid.dataset.initDone === "true") return;

  grid.dataset.initInProgress = "true";
  renderCasesSkeleton(grid);

  try {
    const { manifest } = await loadManifestWithFallback(cfg);
    const projects = pickProjects(manifest);

    await renderCasesGrid(grid, projects, cfg);
    initCasesFilter(grid, tabsRoot);
    grid.dataset.initDone = "true";

    if (statusEl) {
      statusEl.hidden = true;
    }
  } catch (err) {
    grid.classList.remove("is-loading");
    grid.removeAttribute("aria-busy");
    if (statusEl) {
      statusEl.textContent = `Не удалось загрузить кейсы: ${err?.message || err}`;
      statusEl.hidden = false;
    }
    console.error("[studio cases]", err);
  } finally {
    grid.dataset.initInProgress = "false";
  }
};

const bootstrapCases = () => {
  let attempts = 0;
  const maxAttempts = 24;

  const run = () => {
    const grid = qs("#projects-grid");
    if (!grid) {
      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(run, 250);
      }
      return;
    }

    initCases();

    // Если по любой причине карточки не появились, пробуем еще раз.
    window.setTimeout(() => {
      const statusEl = qs("[data-cases-status]");
      if (grid.dataset.initDone === "true") return;
      if (grid.children.length > 0) return;
      if (statusEl && statusEl.hidden) return;
      initCases();
    }, 1400);
  };

  run();
};

window.__studioInitCases = initCases;
window.__studioCasesTabs = {
  updateTabsIndicator,
  setActiveTab,
  initTabsIndicator
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapCases);
} else {
  bootstrapCases();
}
