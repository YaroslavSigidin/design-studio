const SCROLL_GATE_DELAY_MS = 8000;
const SCROLL_GATE_THRESHOLD = 8;

const initScrollGatedWidgets = () => {
  const widgets = [...document.querySelectorAll("[data-scroll-gated]")];
  if (!widgets.length) return;

  let scrollStarted = false;
  let revealTimer = null;

  const reveal = () => {
    widgets.forEach(widget => {
      widget.classList.remove("is-scroll-gated");
      widget.classList.add("is-scroll-revealed");
    });
    document.dispatchEvent(new CustomEvent("studio:scroll-gate-reveal"));
    window.removeEventListener("scroll", onScroll);
  };

  const onScroll = () => {
    if (scrollStarted || window.scrollY <= SCROLL_GATE_THRESHOLD) return;

    scrollStarted = true;
    revealTimer = window.setTimeout(reveal, SCROLL_GATE_DELAY_MS);
  };

  widgets.forEach(widget => widget.classList.add("is-scroll-gated"));

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener(
    "beforeunload",
    () => {
      if (revealTimer) window.clearTimeout(revealTimer);
    },
    { once: true }
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrollGatedWidgets);
} else {
  initScrollGatedWidgets();
}
