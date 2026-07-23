const ARC_BREAKPOINT = 1100;

const initServicesCarousel = () => {
  const root = document.querySelector("[data-services-carousel]");
  const track = document.getElementById("studioServicesGrid");
  const prevButton = root?.querySelector("[data-services-prev]");
  const nextButton = root?.querySelector("[data-services-next]");
  const viewport = root?.querySelector(".studio-services-carousel__viewport");
  if (!root || !track || !viewport || !prevButton || !nextButton) return;

  const arcQuery = window.matchMedia(`(min-width: ${ARC_BREAKPOINT}px)`);
  let activeIndex = 0;
  let arcFrame = 0;
  let focusRaf = 0;
  let lastFocusCard = null;

  const getCards = () => [...track.querySelectorAll("[data-service-card]")];
  const getOriginalCards = () => getCards().filter(card => !card.hasAttribute("data-service-clone"));

  // Prefer "Одностраничный сайт"; else middle card so the arc starts evenly
  const getDefaultServiceIndex = (cards = getOriginalCards()) => {
    const count = cards.length;
    if (!count) return 0;
    const preferred =
      window.STUDIO_DEFAULT_SERVICE_TITLE ||
      window.DEFAULT_SERVICE_TITLE ||
      "Одностраничный сайт";
    const byTitle = cards.findIndex(card => {
      const title = card.querySelector(".studio-service-title")?.textContent?.trim() || "";
      return title.toLowerCase() === String(preferred).toLowerCase();
    });
    if (byTitle >= 0) return byTitle;
    return Math.floor((count - 1) / 2);
  };

  const isArcMode = () => {
    if (!arcQuery.matches || window.innerWidth < ARC_BREAKPOINT) return false;
    // Arc 3D only on full profile — ignore document.hidden so layout doesn't collapse.
    if (window.STUDIO_PERF && !window.STUDIO_PERF.isFull) return false;
    return true;
  };

  const setArcModeClass = enabled => {
    root.classList.toggle("is-arc", enabled);
  };

  const removeLoopClones = () => {
    getCards()
      .filter(card => card.hasAttribute("data-service-clone"))
      .forEach(card => card.remove());
    delete track.dataset.loopReady;
    delete track.dataset.originalCount;
    delete track.dataset.loopSetWidth;
  };

  const syncArcNav = () => {
    const count = getOriginalCards().length;
    prevButton.disabled = activeIndex <= 0;
    nextButton.disabled = activeIndex >= count - 1;
  };

  const syncLinearNav = focusCard => {
    const cards = getOriginalCards();
    if (!cards.length) {
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }
    const index = Math.max(0, cards.indexOf(focusCard));
    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= cards.length - 1;
  };

  const clearArcStyles = card => {
    card.style.removeProperty("left");
    card.style.removeProperty("top");
    card.style.removeProperty("display");
    card.style.removeProperty("z-index");
    card.style.removeProperty("pointer-events");
    card.style.removeProperty("visibility");
    card.style.removeProperty("transition");
    card.style.removeProperty("--service-card-x");
    card.style.removeProperty("--service-card-y");
    card.style.removeProperty("--service-card-scale");
    card.style.removeProperty("--service-card-opacity");
    card.style.removeProperty("--service-card-rotate");
    card.classList.remove("is-focus");
    delete card.dataset.arcRel;
  };

  const setArcPosition = (card, x, y) => {
    card.style.setProperty("--service-card-x", `${x.toFixed(2)}px`);
    card.style.setProperty("--service-card-y", `${y.toFixed(2)}px`);
  };

  const resetLinearStyles = () => {
    getCards().forEach(clearArcStyles);
    track.style.removeProperty("height");
    track.style.removeProperty("scrollBehavior");
    root.style.removeProperty("--services-arc-height");
    lastFocusCard = null;
  };

  const getStep = () => {
    const card = getOriginalCards()[0] || getCards()[0];
    if (!card) return 320;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "14") || 14;
    return card.offsetWidth + gap;
  };

  const centerCard = card => {
    if (!card) return;
    const viewportWidth = viewport.clientWidth;
    const targetLeft = card.offsetLeft - (viewportWidth - card.offsetWidth) / 2;
    track.scrollLeft = Math.max(0, targetLeft);
  };

  const updateLinearFocus = () => {
    const cards = getOriginalCards();
    if (!cards.length) return;

    const mid = track.scrollLeft + track.clientWidth / 2;
    let bestCard = cards[0];
    let bestDist = Infinity;

    for (let i = 0; i < cards.length; i += 1) {
      const card = cards[i];
      const center = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - mid);
      if (distance < bestDist) {
        bestDist = distance;
        bestCard = card;
      }
    }

    if (bestCard !== lastFocusCard) {
      lastFocusCard?.classList.remove("is-focus");
      bestCard?.classList.add("is-focus");
      lastFocusCard = bestCard;
    }

    syncLinearNav(bestCard);
  };

  const scheduleLinearFocus = () => {
    if (focusRaf) return;
    focusRaf = window.requestAnimationFrame(() => {
      focusRaf = 0;
      updateLinearFocus();
    });
  };

  const layoutArc = () => {
    const cards = getOriginalCards();
    const count = cards.length;
    if (!count) return;

    activeIndex = Math.max(0, Math.min(count - 1, activeIndex));

    const viewportWidth = Math.max(viewport.clientWidth, 320);
    const cardWidth = cards[0].offsetWidth || 332;
    const cardHeight = cards[0].offsetHeight || 392;

    // Gentle arc with breathing room between cards
    const visibleRange = 2;
    const travelRange = visibleRange + 1;
    const stepDeg = 14;
    const stepRad = (stepDeg * Math.PI) / 180;
    const maxAngle = visibleRange * stepRad;
    const rotateDamp = 0.5;

    const desiredGap = cardWidth * 0.64;
    const radiusFromGap = desiredGap / Math.sin(stepRad);
    const radius = Math.min(Math.max(radiusFromGap, 780), 1200);

    const arcDrop = radius * (1 - Math.cos(maxAngle));
    const stagePadTop = 8;
    const stagePadBottom = Math.round(cardHeight * 0.16);
    const arcHeight = Math.ceil(cardHeight + arcDrop + stagePadTop + stagePadBottom);

    // Circle center below the stage; card bottoms sit on the upper arc
    const centerX = viewportWidth / 2;
    const centerY = stagePadTop + cardHeight + radius;

    const nextArcHeight = `${arcHeight}px`;
    if (root.style.getPropertyValue("--services-arc-height") !== nextArcHeight) {
      root.style.setProperty("--services-arc-height", nextArcHeight);
    }
    if (track.style.height !== nextArcHeight) track.style.height = nextArcHeight;

    cards.forEach((card, index) => {
      // Finite list: no wrap-around — ends of the catalog stay ends.
      const relative = index - activeIndex;

      const absRel = Math.abs(relative);
      const dir = relative === 0 ? 1 : Math.sign(relative);
      const prevRel = Number.parseFloat(card.dataset.arcRel || String(relative));
      const wrapped = Math.abs(relative - prevRel) > visibleRange;
      card.dataset.arcRel = String(relative);

      // Keep off-screen cards parked on the wheel rim so the next step continues the arc
      const renderRel = absRel > travelRange ? dir * travelRange : relative;
      const angle = renderRel * stepRad;
      const x = centerX + radius * Math.sin(angle);
      const y = centerY - radius * Math.cos(angle);

      if (wrapped) {
        card.style.transition = "opacity 0.42s ease, box-shadow 0.38s ease, transform 0.42s var(--ease-out, ease)";
      } else {
        card.style.removeProperty("transition");
      }

      if (absRel > travelRange) {
        setArcPosition(card, x, y);
        card.style.zIndex = "0";
        card.style.pointerEvents = "none";
        card.style.visibility = "hidden";
        card.style.setProperty("--service-card-scale", "0.78");
        card.style.setProperty("--service-card-opacity", "0");
        card.style.setProperty(
          "--service-card-rotate",
          `${(((angle * 180) / Math.PI) * rotateDamp).toFixed(2)}deg`
        );
        card.classList.remove("is-focus");
        card.setAttribute("aria-hidden", "true");
        return;
      }

      const focusWeight = Math.max(0, 1 - absRel * 0.28);
      const scale = absRel > visibleRange ? 0.86 : 0.9 + focusWeight * 0.1;
      const opacity =
        absRel > visibleRange
          ? Math.max(0, 0.35 - (absRel - visibleRange) * 0.28)
          : 0.62 + focusWeight * 0.38;
      const rotate = ((angle * 180) / Math.PI) * rotateDamp;
      const isFocus = index === activeIndex;
      const inView = absRel <= visibleRange;

      setArcPosition(card, x, y);
      card.style.zIndex = isFocus ? "120" : String(50 - Math.round(absRel * 10));
      card.style.pointerEvents = inView ? "" : "none";
      card.style.visibility = "visible";
      card.style.setProperty("--service-card-scale", scale.toFixed(3));
      card.style.setProperty("--service-card-opacity", opacity.toFixed(3));
      card.style.setProperty("--service-card-rotate", `${rotate.toFixed(2)}deg`);
      card.classList.toggle("is-focus", isFocus);

      if (inView) {
        card.removeAttribute("aria-hidden");
        card.tabIndex = isFocus ? -1 : 0;
        card.setAttribute("role", isFocus ? "group" : "button");
        if (!isFocus) card.setAttribute("aria-label", `Показать услугу: ${card.querySelector(".studio-service-title")?.textContent?.trim() || ""}`);
        else card.removeAttribute("aria-label");
      } else {
        card.setAttribute("aria-hidden", "true");
        card.removeAttribute("tabindex");
        card.removeAttribute("role");
        card.removeAttribute("aria-label");
      }
    });

    syncArcNav();
  };

  const scheduleArcLayout = () => {
    window.cancelAnimationFrame(arcFrame);
    arcFrame = window.requestAnimationFrame(layoutArc);
  };

  const bootLinear = () => {
    const originals = getOriginalCards();
    if (!originals.length) return;

    removeLoopClones();
    activeIndex = getDefaultServiceIndex(originals);
    const target = originals[activeIndex] || originals[0];
    const runCenter = () => {
      centerCard(target);
      updateLinearFocus();
    };
    runCenter();
    window.requestAnimationFrame(runCenter);
  };

  const bootArc = () => {
    activeIndex = getDefaultServiceIndex();
    scheduleArcLayout();
  };

  const applyMode = () => {
    if (isArcMode()) {
      setArcModeClass(true);
      track.scrollLeft = 0;
      bootArc();
      return;
    }

    setArcModeClass(false);
    removeLoopClones();
    resetLinearStyles();
    bootLinear();
  };

  const onTrackScroll = () => {
    if (isArcMode()) return;
    scheduleLinearFocus();
  };

  const stepArc = direction => {
    const count = getOriginalCards().length;
    if (!count) return;
    const nextIndex = Math.max(0, Math.min(count - 1, activeIndex + direction));
    if (nextIndex === activeIndex) {
      syncArcNav();
      return;
    }
    activeIndex = nextIndex;
    scheduleArcLayout();
  };

  const goToArcIndex = index => {
    const cards = getOriginalCards();
    const count = cards.length;
    if (!count) return;
    const nextIndex = Math.max(0, Math.min(count - 1, index));
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    scheduleArcLayout();
  };

  const scrollByStep = direction => {
    if (isArcMode()) {
      stepArc(direction);
      return;
    }
    track.scrollBy({ left: direction * getStep(), behavior: "smooth" });
  };

  const onCardActivate = event => {
    const card = event.target.closest("[data-service-card]");
    if (!card || !track.contains(card)) return;
    if (event.target.closest("[data-open-brief-modal], button, a")) return;

    if (isArcMode()) {
      if (card.hasAttribute("data-service-clone")) return;
      const cards = getOriginalCards();
      const index = cards.indexOf(card);
      if (index < 0) return;
      goToArcIndex(index);
      return;
    }

    centerCard(card);
    updateLinearFocus();
  };

  prevButton.addEventListener("click", () => scrollByStep(-1));
  nextButton.addEventListener("click", () => scrollByStep(1));
  track.addEventListener("click", onCardActivate);
  track.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-service-card]");
    if (!card) return;
    event.preventDefault();
    onCardActivate(event);
  });
  track.addEventListener("scroll", onTrackScroll, { passive: true });

  const onResize = () => {
    const wasArc = root.classList.contains("is-arc");
    const nowArc = isArcMode();
    if (wasArc !== nowArc) {
      applyMode();
      return;
    }
    if (nowArc) scheduleArcLayout();
    else updateLinearFocus();
  };

  window.addEventListener("resize", onResize, { passive: true });
  if (typeof arcQuery.addEventListener === "function") {
    arcQuery.addEventListener("change", applyMode);
  } else if (typeof arcQuery.addListener === "function") {
    arcQuery.addListener(applyMode);
  }

  const boot = () => {
    if (!getOriginalCards().length) return;
    applyMode();
    if (isArcMode()) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(layoutArc);
      });
    }
  };

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      if (isArcMode()) scheduleArcLayout();
    });
    resizeObserver.observe(viewport);
  }

  const onServicesRendered = () => {
    removeLoopClones();
    track.querySelectorAll(".studio-service-icon").forEach(node => node.remove());
    boot();
  };

  const paintTarget = root.closest(".studio-services") || root;
  window.STUDIO_PERF?.observeVisibility?.(paintTarget, {
    threshold: 0.05,
    rootMargin: "120px 0px",
    enter: () => root.classList.add("is-arc-paint"),
    leave: () => root.classList.remove("is-arc-paint")
  });

  if (track.children.length) {
    onServicesRendered();
  }
  window.addEventListener("studio:services-rendered", onServicesRendered);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServicesCarousel);
} else {
  initServicesCarousel();
}
