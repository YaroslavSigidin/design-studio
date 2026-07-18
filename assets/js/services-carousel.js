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

  const isArcMode = () => arcQuery.matches && window.innerWidth >= ARC_BREAKPOINT;

  const setArcModeClass = enabled => {
    root.classList.toggle("is-arc", enabled);
  };

  const setCloneVisibility = visible => {
    getCards()
      .filter(card => card.hasAttribute("data-service-clone"))
      .forEach(card => {
        card.style.display = visible ? "" : "none";
      });
  };

  const clearArcStyles = card => {
    card.style.removeProperty("left");
    card.style.removeProperty("top");
    card.style.removeProperty("display");
    card.style.removeProperty("z-index");
    card.style.removeProperty("pointer-events");
    card.style.removeProperty("visibility");
    card.style.removeProperty("transition");
    card.style.removeProperty("--service-card-scale");
    card.style.removeProperty("--service-card-opacity");
    card.style.removeProperty("--service-card-rotate");
    card.classList.remove("is-focus");
    delete card.dataset.arcRel;
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

  const prepareLoop = () => {
    if (track.dataset.loopReady === "true") {
      return Number(track.dataset.originalCount || 0);
    }

    const originals = getOriginalCards();
    if (originals.length < 2) return originals.length;

    const setWidth = track.scrollWidth;
    const endFragment = document.createDocumentFragment();
    const startFragment = document.createDocumentFragment();

    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-service-clone", "append");
      clone.setAttribute("aria-hidden", "true");
      endFragment.appendChild(clone);
    });

    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-service-clone", "prepend");
      clone.setAttribute("aria-hidden", "true");
      startFragment.appendChild(clone);
    });

    track.appendChild(endFragment);
    track.insertBefore(startFragment, track.firstChild);

    track.dataset.loopReady = "true";
    track.dataset.originalCount = String(originals.length);
    track.dataset.loopSetWidth = String(setWidth);
    return originals.length;
  };

  const normalizeLoop = () => {
    if (isArcMode()) return;

    const setWidth = Number(track.dataset.loopSetWidth || 0);
    if (!setWidth) return;

    const left = track.scrollLeft;
    if (left >= setWidth * 2 - 6) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft = left - setWidth;
      track.style.scrollBehavior = "";
    } else if (left <= 6) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft = left + setWidth;
      track.style.scrollBehavior = "";
    }
  };

  const updateLinearFocus = () => {
    const cards = getCards();
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

    prevButton.disabled = false;
    nextButton.disabled = false;
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

    setCloneVisibility(false);
    activeIndex = ((activeIndex % count) + count) % count;

    const viewportWidth = Math.max(viewport.clientWidth, 320);
    const cardWidth = cards[0].offsetWidth || 332;
    const cardHeight = cards[0].offsetHeight || 392;

    // Wheel: 5 cards on a semicircle, one extra slot for enter/exit travel
    const visibleRange = 2;
    const travelRange = visibleRange + 1;
    const stepDeg = 28;
    const stepRad = (stepDeg * Math.PI) / 180;
    const maxAngle = visibleRange * stepRad;

    const desiredGap = cardWidth * 0.58;
    const radiusFromGap = desiredGap / Math.sin(stepRad);
    const radius = Math.min(Math.max(radiusFromGap, 360), 520);

    const arcDrop = radius * (1 - Math.cos(maxAngle));
    const stagePadTop = 10;
    const stagePadBottom = Math.round(cardHeight * 0.3);
    const arcHeight = Math.ceil(cardHeight + arcDrop + stagePadTop + stagePadBottom);

    // Circle center below the stage; card bottoms sit on the upper arc
    const centerX = viewportWidth / 2;
    const centerY = stagePadTop + cardHeight + radius;

    root.style.setProperty("--services-arc-height", `${arcHeight}px`);
    track.style.height = `${arcHeight}px`;

    cards.forEach((card, index) => {
      let relative = index - activeIndex;
      if (relative > count / 2) relative -= count;
      if (relative < -count / 2) relative += count;

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
        card.style.transition = "opacity 0.55s ease, box-shadow 0.45s ease";
      } else {
        card.style.removeProperty("transition");
      }

      if (absRel > travelRange) {
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.zIndex = "0";
        card.style.pointerEvents = "none";
        card.style.visibility = "hidden";
        card.style.setProperty("--service-card-scale", "0.78");
        card.style.setProperty("--service-card-opacity", "0");
        card.style.setProperty("--service-card-rotate", `${(angle * 180) / Math.PI}deg`);
        card.classList.remove("is-focus");
        card.setAttribute("aria-hidden", "true");
        return;
      }

      const focusWeight = Math.max(0, 1 - absRel * 0.32);
      const scale = absRel > visibleRange ? 0.78 : 0.82 + focusWeight * 0.18;
      const opacity =
        absRel > visibleRange
          ? Math.max(0, 0.28 - (absRel - visibleRange) * 0.28)
          : 0.5 + focusWeight * 0.5;
      const rotate = (angle * 180) / Math.PI;
      const isFocus = index === activeIndex;
      const inView = absRel <= visibleRange;

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
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

    prevButton.disabled = false;
    nextButton.disabled = false;
  };

  const scheduleArcLayout = () => {
    window.cancelAnimationFrame(arcFrame);
    arcFrame = window.requestAnimationFrame(layoutArc);
  };

  const bootLinear = () => {
    const count = prepareLoop();
    if (!count) return;

    const startIndex = Math.min(1, count - 1);
    const target = track.children[count + startIndex];

    const runCenter = () => {
      centerCard(target);
      updateLinearFocus();
    };

    runCenter();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(runCenter);
    });
  };

  const bootArc = () => {
    activeIndex = Math.min(1, Math.max(getOriginalCards().length - 1, 0));
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
    setCloneVisibility(true);
    resetLinearStyles();
    bootLinear();
  };

  let normalizeTimer = 0;

  const onTrackScroll = () => {
    if (isArcMode()) return;
    scheduleLinearFocus();
    window.clearTimeout(normalizeTimer);
    normalizeTimer = window.setTimeout(normalizeLoop, 110);
  };

  const stepArc = direction => {
    const count = getOriginalCards().length;
    if (!count) return;
    activeIndex = (activeIndex + direction + count) % count;
    layoutArc();
  };

  const goToArcIndex = index => {
    const cards = getOriginalCards();
    const count = cards.length;
    if (!count) return;
    const nextIndex = ((index % count) + count) % count;
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    layoutArc();
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
    else {
      updateLinearFocus();
      normalizeLoop();
    }
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

  if (track.children.length) {
    boot();
  } else {
    window.addEventListener("studio:services-rendered", boot, { once: true });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServicesCarousel);
} else {
  initServicesCarousel();
}
