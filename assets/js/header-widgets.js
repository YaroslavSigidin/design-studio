const initHeaderWidgets = () => {
  const widgets = [...document.querySelectorAll("[data-header-widget]")].filter(
    node => !node.classList.contains("is-hidden")
  );
  if (!widgets.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const revealOffset = 12;
  const directionThreshold = 6;
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let ticking = false;

  const setHidden = hidden => {
    if (isHidden === hidden) return;
    isHidden = hidden;
    widgets.forEach(widget => widget.classList.toggle("is-scroll-away", hidden));
  };

  const update = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    if (currentY <= revealOffset) {
      setHidden(false);
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
