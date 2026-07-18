const initAboutMotion = () => {
  const section = document.querySelector("[data-about]");
  if (!section || section.classList.contains("is-bound")) return;
  section.classList.add("is-bound");

  const reducedMotion = () =>
    Boolean(window.STUDIO_PERF?.prefersReducedMotion) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Flat card fan (no tilt) on touch/narrow — but entrance still plays
  const flatLayout = () =>
    reducedMotion() ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1100px)").matches;
  // Only hard-skip entrance for a11y / lite perf profile
  const skipEntrance = () =>
    reducedMotion() || Boolean(window.STUDIO_PERF?.isLite);
  const cards = [...section.querySelectorAll("[data-about-card]")];
  const grid = section.querySelector("[data-about-grid]");
  const prevBtn = section.querySelector("[data-about-prev]");
  const nextBtn = section.querySelector("[data-about-next]");
  const focusPerson =
    section.querySelector('[data-about-person][style*="--about-i: 1"]') ||
    section.querySelectorAll("[data-about-person]")[1] ||
    cards[0];

  let activeIndex = Math.max(0, cards.indexOf(focusPerson));
  let stepCache = 0;
  let scrollingProgrammatically = false;
  let scrollEndTimer = 0;
  let lastAppliedIndex = -1;
  let sectionVisible = true;
  const cardVars = new WeakMap();

  const settle = () => {
    // Layout vars already match entrance end-state — just drop will-change layers
    section.classList.add("is-settled");
    cards.forEach(card => {
      card.style.willChange = "auto";
    });
  };

  const measureStep = () => {
    const item = cards[0];
    if (!item || !grid) return 300;
    const gap = Number.parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || "0") || 0;
    stepCache = item.offsetWidth + gap;
    return stepCache;
  };

  const syncNavState = () => {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = activeIndex <= 0;
    nextBtn.disabled = activeIndex >= cards.length - 1;
  };

  const writeCardVars = (card, rotate, scale, drop, zIndex) => {
    const prev = cardVars.get(card);
    if (
      prev &&
      prev.rotate === rotate &&
      prev.scale === scale &&
      prev.drop === drop &&
      prev.zIndex === zIndex
    ) {
      return;
    }
    cardVars.set(card, { rotate, scale, drop, zIndex });
    card.style.setProperty("--about-card-rotate", `${rotate}deg`);
    card.style.setProperty("--about-card-scale", scale);
    card.style.setProperty("--about-card-y", `${drop}px`);
    card.style.zIndex = zIndex;
  };

  const applyLayout = centerIndex => {
    if (!cards.length) return;
    activeIndex = Math.max(0, Math.min(cards.length - 1, centerIndex));
    if (activeIndex === lastAppliedIndex && lastAppliedIndex !== -1) {
      syncNavState();
      return;
    }
    lastAppliedIndex = activeIndex;

    const flat = flatLayout();

    cards.forEach((card, index) => {
      const signed = index - activeIndex;
      const absRel = Math.abs(signed);
      const isActive = index === activeIndex;

      card.classList.toggle("is-active", isActive);

      if (flat) {
        writeCardVars(card, 0, "1", 0, isActive ? "5" : "1");
        return;
      }

      const rotate = Math.max(-9, Math.min(9, signed * 6));
      const scale = Math.max(0.94, 1 - absRel * 0.035);
      const drop = Math.min(18, absRel * 11);

      writeCardVars(card, rotate, scale.toFixed(3), drop, String(20 - absRel));
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

    const useSmooth = smooth && !reducedMotion() && !flatLayout();
    scrollingProgrammatically = useSmooth;
    section.classList.toggle("is-nav-animating", useSmooth);
    grid.style.scrollSnapType = "none";

    const left = Math.max(0, cardScrollLeft(card));
    grid.scrollTo({
      left,
      behavior: useSmooth ? "smooth" : "auto"
    });

    window.clearTimeout(scrollEndTimer);
    if (!useSmooth) {
      unlockSnap();
      return;
    }

    // Prefer native scrollend when available; keep timeout as safety net
    const onScrollEnd = () => {
      grid.removeEventListener("scrollend", onScrollEnd);
      window.clearTimeout(scrollEndTimer);
      unlockSnap();
    };
    if ("onscrollend" in window) {
      grid.addEventListener("scrollend", onScrollEnd, { once: true });
    }
    scrollEndTimer = window.setTimeout(onScrollEnd, 420);
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

  const runScrollLayout = () => {
    if (scrollingProgrammatically || !sectionVisible) return;
    applyLayout(nearestIndexFromScroll());
  };

  const scheduleScrollLayout =
    typeof window.STUDIO_PERF?.rafThrottle === "function"
      ? window.STUDIO_PERF.rafThrottle(runScrollLayout)
      : (() => {
          let layoutRaf = 0;
          return () => {
            if (layoutRaf) return;
            layoutRaf = window.requestAnimationFrame(() => {
              layoutRaf = 0;
              runScrollLayout();
            });
          };
        })();

  const warmImages = () => {
    const imgs = cards
      .map(card => card.querySelector("img"))
      .filter(Boolean);
    return Promise.all(
      imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) {
          return img.decode?.().catch(() => {}) || Promise.resolve();
        }
        return new Promise(resolve => {
          const done = () => {
            if (img.decode) {
              img.decode().then(resolve).catch(resolve);
            } else {
              resolve();
            }
          };
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", resolve, { once: true });
          // Kick load early if still lazy
          if (img.loading === "lazy") img.loading = "eager";
        });
      })
    );
  };

  const play = () => {
    if (section.classList.contains("is-inview") || section.dataset.aboutPlaying) return;
    section.dataset.aboutPlaying = "1";

    const start = () => {
      if (section.classList.contains("is-inview")) return;
      measureStep();
      // Fan pose + scroll first, THEN animate — no mid-flight layout hitch
      goToIndex(Math.max(0, cards.indexOf(focusPerson)), { smooth: false });
      void grid?.offsetWidth;
      section.classList.add("is-inview");
      window.setTimeout(settle, 620);
    };

    // Decode photos before animating — avoids mid-flight decode jank
    let started = false;
    const kick = () => {
      if (started) return;
      started = true;
      start();
    };
    warmImages().then(kick);
    window.setTimeout(kick, 180);
  };

  const closeAllBios = (except = null) => {
    cards.forEach(card => {
      if (card === except) return;
      card.classList.remove("is-bio-open");
      const more = card.querySelector("[data-about-more]");
      const bio = card.querySelector("[data-about-bio]");
      if (more) {
        more.setAttribute("aria-expanded", "false");
        more.setAttribute("aria-label", more.dataset.labelMore || more.getAttribute("aria-label") || "Подробнее");
      }
      if (bio) bio.hidden = true;
    });
  };

  const toggleBio = card => {
    const more = card.querySelector("[data-about-more]");
    const bio = card.querySelector("[data-about-bio]");
    if (!more || !bio) return;

    const willOpen = !card.classList.contains("is-bio-open");
    closeAllBios(willOpen ? card : null);

    card.classList.toggle("is-bio-open", willOpen);
    more.setAttribute("aria-expanded", willOpen ? "true" : "false");
    bio.hidden = !willOpen;

    if (!more.dataset.labelMore) {
      more.dataset.labelMore = more.getAttribute("aria-label") || "Подробнее";
    }
    more.setAttribute(
      "aria-label",
      willOpen ? "Скрыть описание" : more.dataset.labelMore
    );
  };

  cards.forEach(card => {
    const more = card.querySelector("[data-about-more]");
    if (!more) return;
    if (!more.dataset.labelMore) {
      more.dataset.labelMore = more.getAttribute("aria-label") || "Подробнее";
    }
    more.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const index = cards.indexOf(card);
      if (index >= 0 && index !== activeIndex) {
        goToIndex(index);
      }
      toggleBio(card);
    });
  });

  prevBtn?.addEventListener("click", () => {
    closeAllBios();
    scrollByDir(-1);
  });
  nextBtn?.addEventListener("click", () => {
    closeAllBios();
    scrollByDir(1);
  });

  grid?.addEventListener("click", event => {
    if (event.target.closest("[data-about-more], [data-about-bio]")) return;
    const card = event.target.closest("[data-about-card]");
    if (!card || !grid.contains(card)) return;

    if (card.classList.contains("is-bio-open")) {
      toggleBio(card);
      return;
    }

    const index = cards.indexOf(card);
    if (index < 0 || index === activeIndex) return;
    closeAllBios();
    goToIndex(index);
  });

  grid?.addEventListener(
    "scroll",
    () => {
      if (scrollingProgrammatically) return;
      closeAllBios();
      scheduleScrollLayout();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      measureStep();
      lastAppliedIndex = -1;
      cards.forEach(card => cardVars.delete(card));
      goToIndex(activeIndex, { smooth: false });
    },
    { passive: true }
  );

  measureStep();
  syncNavState();

  window.STUDIO_PERF?.observeVisibility?.(section, {
    threshold: 0.01,
    enter: () => {
      sectionVisible = true;
    },
    leave: () => {
      sectionVisible = false;
    }
  });

  if (skipEntrance() || !("IntersectionObserver" in window)) {
    goToIndex(Math.max(0, cards.indexOf(focusPerson)), { smooth: false });
    section.classList.add("is-inview");
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
      threshold: 0.06,
      // Start a bit earlier on mobile so the deal-in is visible
      rootMargin: "160px 0px -4% 0px"
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
