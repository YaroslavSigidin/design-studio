const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];

const loadJson = async (url, timeoutMs = 2500) => {
  const timeoutPromise = new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error(`${url} → timeout (${timeoutMs}ms)`)), timeoutMs);
  });
  const responsePromise = fetch(url, { cache: "force-cache" });
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
const CASES_VISIBLE_LIMIT_DESKTOP = 9;
const CASES_VISIBLE_LIMIT_MOBILE = 6;

const getCasesVisibleLimit = () =>
  window.matchMedia("(min-width: 901px)").matches
    ? CASES_VISIBLE_LIMIT_DESKTOP
    : CASES_VISIBLE_LIMIT_MOBILE;

const renderMediaSkeleton = attrs => window.STUDIO_MEDIA?.renderSkeletonImage(attrs) || "";

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
          <div class="project-card__title-row">
            <h3> </h3>
            <span class="tag"> </span>
          </div>
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

const renderProjectCard = (project, cfg, index = 0) => {
  const tagLabel = getTagLabel(project.category);
  const caseHref = getCaseHref(project, cfg);
  const image = normalizeAssetUrl(project.image || project.cover || "", cfg);
  const isPlaceholder = Boolean(project.isPlaceholder);
  const filterTags = [...(project.tags || []), ...(project.study?.tags || [])].join(" ").toLowerCase();
  // Never leave cards without src — deferred data-src caused empty previews
  // when collapse/clip failed or "beyond" cards peeked into view.
  const imageMarkup = isPlaceholder
    ? `<div class="project-placeholder-media" aria-hidden="true"></div>`
    : renderMediaSkeleton({
        src: image,
        alt: project.title,
        width: "1200",
        height: "630",
        className: "media-skeleton--cover",
        defer: false,
        loading: "lazy",
        eager: index < 2
      });

  const linkMarkup = caseHref
    ? `<a class="project-card__link" href="${window.__studioEscapeHtml(caseHref)}"><span class="visually-hidden">${window.__studioEscapeHtml(project.title || "Открыть кейс")}</span></a>`
    : "";

  return `
    <article
      class="project-card${isPlaceholder ? " project-card--placeholder" : ""}"
      data-project-id="${window.__studioEscapeHtml(project.id)}"
      data-category="${window.__studioEscapeHtml(project.category || "web")}"
      data-search="${window.__studioEscapeHtml(buildProjectSearchText(project))}"
      data-filter-tags="${window.__studioEscapeHtml(filterTags)}"
    >
      ${imageMarkup}
      <div class="content">
        <div class="project-card__title-row">
          <h3>${window.__studioEscapeHtml(project.title)}</h3>
          <span class="tag">${isPlaceholder ? "NEW" : tagLabel}</span>
        </div>
        <p>${window.__studioEscapeHtml(project.subtitle || "")}</p>
      </div>
      ${linkMarkup}
    </article>
  `;
};

const bindCardNavigation = grid => {
  if (!grid) return;
  grid.dataset.navBound = "true";
};

const syncCardInert = (card, inert) => {
  if (window.STUDIO_A11Y?.setInert) {
    window.STUDIO_A11Y.setInert(card, inert);
    return;
  }
  if (inert) card.setAttribute("aria-hidden", "true");
  else card.removeAttribute("aria-hidden");
};

const updateCasesStackClip = (grid, stack, collapsed) => {
  if (!stack) return;

  const clip = qs("[data-cases-clip]", stack) || qs(".studio-cases-clip", stack);
  const firstBeyond = qs(".project-card--beyond-limit", grid);
  const shouldCollapse = Boolean(collapsed && firstBeyond);

  if (!shouldCollapse) {
    stack.classList.remove("is-collapsed");
    if (clip) clip.style.maxHeight = "";
    return;
  }

  stack.classList.add("is-collapsed");

  const visibleCards = [...qsa(".project-card", grid)].filter(
    card => !card.hidden && !card.classList.contains("project-card--beyond-limit")
  );
  const lastVisible = visibleCards[visibleCards.length - 1];

  if (!clip || !lastVisible) {
    stack.classList.remove("is-collapsed");
    if (clip) clip.style.maxHeight = "";
    return;
  }

  const clipTop = clip.getBoundingClientRect().top;
  const lastVisibleBottom = lastVisible.getBoundingClientRect().bottom - clipTop;
  const beyondHeight = firstBeyond.getBoundingClientRect().height;
  const peek = Math.min(Math.max(beyondHeight * 0.42, 72), 180);

  clip.style.maxHeight = `${lastVisibleBottom + peek}px`;
};

const scheduleCasesStackClip = (grid, stack, collapsed) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      updateCasesStackClip(grid, stack, collapsed);
    });
  });
};

const CASES_EXPAND_MS = 320;
const CASES_EXPAND_ANIMATE_LIMIT = 6;

const updateMoreButtonState = (moreButton, moreWrap, expanded, hasExtra) => {
  if (!moreWrap || !moreButton) return;
  moreWrap.hidden = !hasExtra;
  const label = moreButton.querySelector("[data-cases-more-label]");
  if (label) label.textContent = expanded ? "Скрыть кейсы" : "Все кейсы";
  moreButton.classList.toggle("is-expanded", expanded);
  moreButton.setAttribute("aria-expanded", expanded ? "true" : "false");
};

const revealExpandedCases = (grid, revealIds = []) => {
  if (!grid || !revealIds.length || prefersReducedMotion()) return;

  revealIds.slice(0, CASES_EXPAND_ANIMATE_LIMIT).forEach((id, index) => {
    const card = qs(`.project-card[data-project-id="${CSS.escape(id)}"]`, grid);
    if (!card || card.hidden) return;
    card.style.setProperty("--case-expand-delay", `${Math.min(index * 40, 160)}ms`);
    card.classList.add("is-expand-reveal");
    window.setTimeout(() => {
      card.classList.remove("is-expand-reveal");
      card.style.removeProperty("--case-expand-delay");
    }, CASES_EXPAND_MS + 220);
  });
};

const hydrateCaseCardImages = async (cards = []) => {
  if (!cards.length || !window.STUDIO_MEDIA?.hydrateDeferredImages) return;

  for (const card of cards) {
    await window.STUDIO_MEDIA.hydrateDeferredImages(card, { chunkSize: 2 });
  }
};

const hydrateVisibleCaseImages = grid => {
  if (!grid) return Promise.resolve();
  const visibleCards = qsa(".project-card", grid).filter(
    card => !card.hidden && !card.classList.contains("project-card--beyond-limit")
  );
  // Peek card under the veil also needs a real preview
  const peekCard = qs(".project-card--beyond-limit.project-card--peek", grid);
  const roots = peekCard ? [...visibleCards, peekCard] : visibleCards;
  return hydrateCaseCardImages(roots);
};

const hydrateExpandedCaseImages = (grid, revealIds = []) => {
  if (!grid || !revealIds.length) return Promise.resolve();

  const roots = revealIds
    .map(id => qs(`.project-card[data-project-id="${CSS.escape(id)}"]`, grid))
    .filter(Boolean);

  return hydrateCaseCardImages(roots);
};

const animateCasesStackClip = (grid, stack, collapsed, onDone) => {
  const clip = qs("[data-cases-clip]", stack) || qs(".studio-cases-clip", stack);
  if (!stack || !clip || prefersReducedMotion()) {
    updateCasesStackClip(grid, stack, collapsed);
    onDone?.();
    return;
  }

  // Expanding dozens of image cards with a max-height tween is too expensive.
  // Drop collapse instantly and let a light veil/card fade carry the motion.
  if (!collapsed) {
    stack.classList.remove("is-collapsed");
    clip.style.maxHeight = "";
    clip.classList.remove("is-clip-animating");
    window.requestAnimationFrame(() => onDone?.());
    return;
  }

  clip.classList.add("is-clip-animating");
  const startHeight = clip.getBoundingClientRect().height;
  stack.classList.add("is-collapsed");
  updateCasesStackClip(grid, stack, true);
  const endHeight = clip.getBoundingClientRect().height;
  clip.style.maxHeight = `${startHeight}px`;
  window.requestAnimationFrame(() => {
    clip.style.maxHeight = `${endHeight}px`;
  });

  let finished = false;
  const finish = event => {
    if (event?.propertyName && event.propertyName !== "max-height") return;
    if (finished) return;
    finished = true;
    updateCasesStackClip(grid, stack, true);
    clip.classList.remove("is-clip-animating");
    clip.removeEventListener("transitionend", finish);
    onDone?.();
  };

  clip.addEventListener("transitionend", finish);
  window.setTimeout(finish, CASES_EXPAND_MS + 80);
};

const TAB_SWITCH_OUT_MS = 280;
const TAB_SWITCH_IN_MS = 620;
const TAB_SWITCH_STAGGER_MS = 55;
const TAB_SWITCH_STAGGER_CAP_MS = 420;

const prefersReducedMotion = () =>
  Boolean(window.STUDIO_PERF?.prefersReducedMotion) ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const prefersLiteMotion = () =>
  Boolean(window.STUDIO_PERF?.isLite) || prefersReducedMotion();

const getTabSwitchDirection = (tabsRoot, fromTab, toTab) => {
  const tabs = qsa(".tab-button", tabsRoot);
  const fromIndex = tabs.indexOf(fromTab);
  const toIndex = tabs.indexOf(toTab);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return "next";
  return toIndex > fromIndex ? "next" : "prev";
};

const updateTabsIndicator = (tabsRoot, activeTab) => {
  const indicator = qs("[data-tabs-indicator]", tabsRoot);
  if (!indicator || !activeTab) return;

  const tabsRect = tabsRoot.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();
  const x = Math.round((tabRect.left - tabsRect.left + tabsRoot.scrollLeft) * 100) / 100;
  const y = Math.round((tabRect.top - tabsRect.top + tabsRoot.scrollTop) * 100) / 100;
  const width = Math.round(tabRect.width * 100) / 100;
  const height = Math.round(tabRect.height * 100) / 100;

  const nextKey = `${width}|${height}|${x}|${y}`;
  if (indicator.dataset.posKey === nextKey) {
    tabsRoot.classList.add("is-ready");
    return;
  }
  indicator.dataset.posKey = nextKey;

  indicator.style.width = `${width}px`;
  indicator.style.height = `${height}px`;
  indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  tabsRoot.classList.add("is-ready");
};

const initTabsIndicator = tabsRoot => {
  if (!tabsRoot || tabsRoot.dataset.indicatorBound === "true") return;

  const syncRaw = () => {
    const activeTab = qs(".tab-button.active", tabsRoot) || qs(".tab-button", tabsRoot);
    updateTabsIndicator(tabsRoot, activeTab);
  };

  const sync =
    typeof window.STUDIO_PERF?.rafThrottle === "function"
      ? window.STUDIO_PERF.rafThrottle(syncRaw)
      : (() => {
          let frame = 0;
          return () => {
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
              frame = 0;
              syncRaw();
            });
          };
        })();

  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("load", sync, { passive: true });
  tabsRoot.addEventListener("scroll", sync, { passive: true });
  window.setTimeout(syncRaw, 80);
  window.setTimeout(syncRaw, 320);
  if (document.fonts?.ready) {
    document.fonts.ready.then(syncRaw).catch(() => {});
  }
  tabsRoot.dataset.indicatorBound = "true";
};

const setActiveTab = (tabsRoot, tab) => {
  qsa(".tab-button", tabsRoot).forEach(item => {
    const isActive = item === tab;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", isActive ? "true" : "false");
    item.removeAttribute("aria-selected");
    item.removeAttribute("role");
  });
  updateTabsIndicator(tabsRoot, tab);
};

const clearFilterReveal = (grid, cards) => {
  cards.forEach(card => {
    card.classList.remove("is-filter-reveal");
    card.style.removeProperty("--case-reveal-delay");
  });
  grid.removeAttribute("data-switch-dir");
};

const revealFilteredCards = grid => {
  if (!grid) return;

  qsa(".project-card", grid).forEach(card => card.classList.remove("is-filter-reveal"));

  if (prefersLiteMotion()) return;

  const visibleCards = qsa(".project-card", grid)
    .filter(card => !card.hidden && !card.classList.contains("project-card--beyond-limit"))
    .slice(0, 6);

  if (!visibleCards.length) {
    grid.removeAttribute("data-switch-dir");
    return;
  }

  let pending = visibleCards.length;

  visibleCards.forEach((card, index) => {
    card.style.setProperty(
      "--case-reveal-delay",
      `${Math.min(index * TAB_SWITCH_STAGGER_MS, TAB_SWITCH_STAGGER_CAP_MS)}ms`
    );
    card.classList.add("is-filter-reveal");

    const onEnd = event => {
      if (event.target !== card) return;
      if (event.animationName && !String(event.animationName).includes("caseFilter")) return;
      card.removeEventListener("animationend", onEnd);
      pending -= 1;
      if (pending <= 0) clearFilterReveal(grid, visibleCards);
    };
    card.addEventListener("animationend", onEnd);
  });

  // Safety net if animationend is skipped (display:none mid-flight, etc.)
  window.setTimeout(() => {
    if (pending > 0) clearFilterReveal(grid, visibleCards);
  }, TAB_SWITCH_IN_MS + TAB_SWITCH_STAGGER_CAP_MS + 80);
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

  const applyFilter = ({ animate = false, stackAnimate = false, revealIds = [] } = {}) => {
    let visibleCount = 0;
    const limit = getCasesVisibleLimit();

    qsa(".project-card", grid).forEach(card => {
      const matches = matchesProjectFilter(card, activeFilter);
      if (!matches) {
        card.hidden = true;
        card.classList.remove("project-card--beyond-limit", "project-card--peek");
        syncCardInert(card, false);
        card.removeAttribute("aria-hidden");
        return;
      }

      visibleCount += 1;
      const isBeyond = !expanded && visibleCount > limit;
      const isPeek = isBeyond && visibleCount === limit + 1;
      card.hidden = false;
      card.classList.toggle("project-card--beyond-limit", isBeyond);
      card.classList.toggle("project-card--peek", isPeek);
      if (!isBeyond) card.classList.remove("project-card--peek");
      syncCardInert(card, isBeyond);
      if (!isBeyond) card.removeAttribute("aria-hidden");
    });

    const hasExtra = visibleCount > limit;
    if (!hasExtra) expanded = false;
    updateMoreButtonState(moreButton, moreWrap, expanded, hasExtra);

    const collapseStack = !expanded && hasExtra;

    if (stackAnimate && hasExtra) {
      stack?.classList.toggle("is-expanding", expanded);
      animateCasesStackClip(grid, stack, collapseStack, () => {
        stack?.classList.remove("is-expanding");
        if (expanded) {
          revealExpandedCases(grid, revealIds);
          hydrateExpandedCaseImages(grid, revealIds);
        }
      });
    } else {
      scheduleCasesStackClip(grid, stack, collapseStack);
    }

    hydrateVisibleCaseImages(grid).finally(() => {
      scheduleCasesStackClip(grid, stack, collapseStack);
    });

    if (animate && !stackAnimate) revealFilteredCards(grid);
  };

  const switchFilter = (tab, nextFilter) => {
    if (switching || nextFilter === activeFilter) return;

    const previousTab = qs(".tab-button.active", tabsRoot);
    const direction = getTabSwitchDirection(tabsRoot, previousTab, tab);

    switching = true;
    tabsRoot.classList.add("is-switching");
    setActiveTab(tabsRoot, tab);
    expanded = false;

    if (prefersReducedMotion()) {
      activeFilter = nextFilter;
      applyFilter();
      tabsRoot.classList.remove("is-switching");
      switching = false;
      return;
    }

    grid.dataset.switchDir = direction;
    grid.classList.add("is-tab-switching");
    qsa(".project-card.is-filter-reveal", grid).forEach(card => {
      card.classList.remove("is-filter-reveal");
      card.style.removeProperty("--case-reveal-delay");
    });

    window.setTimeout(() => {
      activeFilter = nextFilter;
      applyFilter({ animate: true });
      grid.classList.remove("is-tab-switching");
      tabsRoot.classList.remove("is-switching");
      switching = false;
    }, TAB_SWITCH_OUT_MS);
  };

  qsa(".tab-button", tabsRoot).forEach(tab => {
    tab.setAttribute("aria-pressed", tab.classList.contains("active") ? "true" : "false");
    tab.removeAttribute("aria-selected");
    tab.removeAttribute("role");
    tab.addEventListener("click", () => {
      switchFilter(tab, tab.dataset.filter || "all");
    });
  });

  tabsRoot.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = qsa(".tab-button", tabsRoot);
    if (!tabs.length) return;
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    tabs[nextIndex]?.focus();
  });

  moreButton?.addEventListener("click", () => {
    const willExpand = !expanded;
    const revealIds = willExpand
      ? qsa(".project-card--beyond-limit", grid).map(card => card.dataset.projectId).filter(Boolean)
      : [];
    expanded = willExpand;
    applyFilter({ stackAnimate: true, revealIds });
  });

  grid.addEventListener("load", () => scheduleCasesStackClip(grid, stack, stack?.classList.contains("is-collapsed")), true);

  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        expanded = false;
        applyFilter();
        updateTabsIndicator(tabsRoot, qs(".tab-button.active", tabsRoot));
      }, 140);
    },
    { passive: true }
  );

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
      const items = projects;
      grid.innerHTML = items.map((project, index) => renderProjectCard(project, cfg, index)).join("");
      bindCardNavigation(grid);
      window.STUDIO_MEDIA?.initImageSkeletons(grid);
      // cases-rendered fires after filter/collapse is applied (see initCases)
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
    window.dispatchEvent(new CustomEvent("studio:cases-rendered"));

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
