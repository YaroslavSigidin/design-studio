const initAboutMotion = () => {
  const section = document.querySelector("[data-about]");
  if (!section || section.classList.contains("is-bound")) return;
  section.classList.add("is-bound");

  const reducedMotion = () =>
    Boolean(window.STUDIO_PERF?.prefersReducedMotion) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const liteMotion = () =>
    Boolean(window.STUDIO_PERF?.isLite) ||
    reducedMotion() ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1100px)").matches;
  const cards = [...section.querySelectorAll("[data-about-card]")];
  const grid = section.querySelector("[data-about-grid]");
  const prevBtn = section.querySelector("[data-about-prev]");
  const nextBtn = section.querySelector("[data-about-next]");
  const focusPerson =
    section.querySelector('[data-about-person][style*="--about-i: 3"]') ||
    section.querySelectorAll("[data-about-person]")[1] ||
    cards[0];

  let activeIndex = Math.max(0, cards.indexOf(focusPerson));
  let stepCache = 0;
  let scrollingProgrammatically = false;
  let scrollEndTimer = 0;
  let layoutRaf = 0;
  let lastAppliedIndex = -1;

  const settle = () => {
    section.classList.add("is-settled");
    applyLayout(activeIndex);
  };

  const measureStep = () => {
    const item = cards[0];
    if (!item || !grid) return 300;
    const gap = Number.parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || "0") || 0;
    stepCache = item.offsetWidth + gap;
    return stepCache;
  };

  const getStep = () => stepCache || measureStep();

  const syncNavState = () => {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = activeIndex <= 0;
    nextBtn.disabled = activeIndex >= cards.length - 1;
  };

  const applyLayout = centerIndex => {
    if (!cards.length) return;
    activeIndex = Math.max(0, Math.min(cards.length - 1, centerIndex));
    if (activeIndex === lastAppliedIndex && lastAppliedIndex !== -1) {
      syncNavState();
      return;
    }
    lastAppliedIndex = activeIndex;

    cards.forEach((card, index) => {
      const signed = index - activeIndex;
      const absRel = Math.abs(signed);
      const isActive = index === activeIndex;

      card.classList.toggle("is-active", isActive);

      if (liteMotion()) {
        card.style.setProperty("--about-card-rotate", "0deg");
        card.style.setProperty("--about-card-scale", "1");
        card.style.setProperty("--about-card-y", "0px");
        card.style.zIndex = isActive ? "5" : "1";
        return;
      }

      const rotate = Math.max(-9, Math.min(9, signed * 6));
      const scale = Math.max(0.94, 1 - absRel * 0.035);
      const drop = Math.min(18, absRel * 11);

      card.style.setProperty("--about-card-rotate", `${rotate}deg`);
      card.style.setProperty("--about-card-scale", scale.toFixed(3));
      card.style.setProperty("--about-card-y", `${drop}px`);
      card.style.zIndex = String(20 - absRel);
    });

    syncNavState();
  };

  const cardScrollLeft = card => {
    if (!grid || !card) return 0;
    return card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2;
  };

  const unlockSnap = () => {
    if (!grid) return;
    scrollingProgrammatically = false;
    grid.style.scrollSnapType = "";
    section.classList.remove("is-nav-animating");
  };

  const goToIndex = (index, { smooth = true } = {}) => {
    if (!grid || !cards.length) return;
    const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
    const card = cards[nextIndex];
    if (!card) return;

    applyLayout(nextIndex);

    const useSmooth = smooth && !reducedMotion() && !liteMotion();
    scrollingProgrammatically = useSmooth;
    section.classList.toggle("is-nav-animating", useSmooth);
    grid.style.scrollSnapType = "none";

    const left = Math.max(0, cardScrollLeft(card));
    grid.scrollTo({
      left,
      behavior: useSmooth ? "smooth" : "auto"
    });

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(unlockSnap, useSmooth ? 420 : 0);
  };

  const scrollByDir = direction => {
    goToIndex(activeIndex + direction);
  };

  const nearestIndexFromScroll = () => {
    if (!grid || !cards.length) return activeIndex;
    const mid = grid.scrollLeft + grid.clientWidth / 2;
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < cards.length; i += 1) {
      const center = cards[i].offsetLeft + cards[i].offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    return bestIndex;
  };

  const scheduleScrollLayout = () => {
    if (scrollingProgrammatically || layoutRaf) return;
    layoutRaf = window.requestAnimationFrame(() => {
      layoutRaf = 0;
      applyLayout(nearestIndexFromScroll());
    });
  };

  const play = () => {
    if (section.classList.contains("is-inview")) return;
    section.classList.add("is-inview");
    measureStep();
    window.setTimeout(settle, 1100);
    window.requestAnimationFrame(() => {
      goToIndex(Math.max(0, cards.indexOf(focusPerson)), { smooth: false });
    });
  };

  prevBtn?.addEventListener("click", () => scrollByDir(-1));
  nextBtn?.addEventListener("click", () => scrollByDir(1));

  grid?.addEventListener("click", event => {
    const card = event.target.closest("[data-about-card]");
    if (!card || !grid.contains(card)) return;
    const index = cards.indexOf(card);
    if (index < 0 || index === activeIndex) return;
    goToIndex(index);
  });

  grid?.addEventListener(
    "scroll",
    () => {
      if (scrollingProgrammatically) return;
      scheduleScrollLayout();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      measureStep();
      lastAppliedIndex = -1;
      goToIndex(activeIndex, { smooth: false });
    },
    { passive: true }
  );

  measureStep();
  syncNavState();

  if (liteMotion() || !("IntersectionObserver" in window)) {
    play();
    settle();
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        play();
        observer.disconnect();
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -4% 0px"
    }
  );

  observer.observe(section);

  cards.forEach(card => {
    card.addEventListener(
      "animationend",
      event => {
        if (event.target !== card) return;
        if (cards.every(node => getComputedStyle(node).opacity === "1")) settle();
      },
      { once: true }
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAboutMotion);
} else {
  initAboutMotion();
}
