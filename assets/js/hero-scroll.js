const easeOutQuint = value => 1 - (1 - value) ** 5;

const clamp01 = value => Math.min(1, Math.max(0, value));

const initHeroScroll = () => {
  const heroPage = document.querySelector(".hero-page");
  const wordmark = document.querySelector("[data-hero-wordmark]");
  const subtitle = document.querySelector(".hero-subtitle[data-hero-scroll-item]");
  const brief = document.querySelector(".hero-search-wrap[data-hero-scroll-item]");
  const partners = document.querySelector(".hero-partners[data-hero-scroll-item]");
  const stats = document.querySelector(".studio-stats[data-hero-scroll-item]");
  if (!heroPage || !wordmark || !subtitle || !brief) return;

  const perf = window.STUDIO_PERF;
  if (
    (perf && !perf.isFull) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    navigator.connection?.saveData === true ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1100px)").matches
  ) {
    return;
  }

  const layers = [
    { node: wordmark, lift: 52, scale: 0.1, fade: 0.94 },
    { node: subtitle, lift: 40, scale: 0.07, fade: 0.9 },
    { node: brief, lift: 34, scale: 0.06, fade: 0.88 },
    ...(partners ? [{ node: partners, lift: 28, scale: 0.04, fade: 0.82 }] : []),
    ...(stats ? [{ node: stats, lift: 22, scale: 0.03, fade: 0.78 }] : [])
  ];

  let paused = false;
  let lastProgress = -1;
  let enabled = true;
  let unsubscribeScroll = null;

  const clearLayerStyles = () => {
    lastProgress = -1;
    layers.forEach(layer => {
      layer.node.style.removeProperty("--hero-scroll-opacity");
      layer.node.style.removeProperty("--hero-scroll-transform");
    });
  };

  const isTypingInHero = () => {
    const active = document.activeElement;
    return Boolean(
      active &&
        brief.contains(active) &&
        (active.matches("textarea, input, [contenteditable='true']") ||
          active.closest("textarea, input, [contenteditable='true']"))
    );
  };

  const update = ({ y } = {}) => {
    if (!enabled || paused || isTypingInHero()) {
      clearLayerStyles();
      return;
    }

    const scrollY = typeof y === "number" ? y : window.scrollY;
    const range = Math.max(heroPage.offsetHeight * 0.62, window.innerHeight * 0.48, 340);
    const progress = easeOutQuint(clamp01(scrollY / range));

    if (Math.abs(progress - lastProgress) < 0.0008) return;
    lastProgress = progress;

    layers.forEach(layer => {
      const opacity = 1 - progress * layer.fade;
      const translateY = -progress * layer.lift;
      const scale = 1 - progress * layer.scale;

      layer.node.style.setProperty("--hero-scroll-opacity", opacity.toFixed(4));
      layer.node.style.setProperty(
        "--hero-scroll-transform",
        `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
      );
    });
  };

  const onFocusIn = event => {
    if (!brief.contains(event.target)) return;
    paused = true;
    clearLayerStyles();
  };

  const onFocusOut = event => {
    if (!brief.contains(event.target)) return;
    window.requestAnimationFrame(() => {
      if (isTypingInHero()) return;
      paused = false;
      update();
    });
  };

  brief.addEventListener("focusin", onFocusIn);
  brief.addEventListener("focusout", onFocusOut);

  if (window.STUDIO_SCROLL?.subscribe) {
    unsubscribeScroll = window.STUDIO_SCROLL.subscribe(update);
  } else {
    const onScroll =
      typeof perf?.rafThrottle === "function"
        ? perf.rafThrottle(() => update())
        : (() => {
            let ticking = false;
            return () => {
              if (ticking) return;
              ticking = true;
              window.requestAnimationFrame(() => {
                ticking = false;
                update();
              });
            };
          })();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  const stopVisibility = perf?.pauseWhenHidden?.({
    start: () => {
      enabled = true;
      update();
    },
    stop: () => {
      enabled = false;
    }
  });

  update();

  window.addEventListener(
    "pagehide",
    () => {
      stopVisibility?.();
      unsubscribeScroll?.();
    },
    { once: true }
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroScroll);
} else {
  initHeroScroll();
}
