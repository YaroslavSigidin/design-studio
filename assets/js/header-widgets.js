const initHeaderWidgets = () => {
  if (window.STUDIO_PERF?.isNarrow || window.STUDIO_PERF?.isLite) return;

  const widgets = [...document.querySelectorAll("[data-header-widget]")].filter(
    node => !node.classList.contains("is-hidden")
  );
  if (!widgets.length) return;

  const reducedMotion =
    Boolean(window.STUDIO_PERF?.prefersReducedMotion) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const revealOffset = 12;
  const directionThreshold = 5;
  const hideStaggerMs = 28;
  const revealStaggerMs = 24;
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let ticking = false;
  let pendingTimers = [];

  const clearPendingTimers = () => {
    pendingTimers.forEach(timerId => window.clearTimeout(timerId));
    pendingTimers = [];
  };

  const setHidden = (hidden, { stagger = true } = {}) => {
    if (isHidden === hidden) return;
    isHidden = hidden;
    clearPendingTimers();

    widgets.forEach((widget, index) => {
      const apply = () => widget.classList.toggle("is-scroll-away", hidden);

      if (!stagger) {
        apply();
        return;
      }

      const delay = hidden ? index * hideStaggerMs : (widgets.length - 1 - index) * revealStaggerMs;
      pendingTimers.push(window.setTimeout(apply, delay));
    });
  };

  const update = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    if (currentY <= revealOffset) {
      setHidden(false, { stagger: false });
    } else if (delta > directionThreshold) {
      setHidden(true);
    } else if (delta < -directionThreshold) {
      setHidden(false);
    }

    lastScrollY = currentY;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  document.addEventListener("studio:promo-hidden", () => {
    widgets
      .filter(widget => widget.matches("[data-promo-strip]"))
      .forEach(widget => widget.removeAttribute("data-header-widget"));
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderWidgets);
} else {
  initHeaderWidgets();
}
