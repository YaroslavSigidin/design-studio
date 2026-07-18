const initHeadingReveal = () => {
  const perf = window.STUDIO_PERF;
  const hardDisable =
    Boolean(perf?.isLite) ||
    Boolean(perf?.prefersReducedMotion) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero stays static — only section titles below the fold
  const headings = [...document.querySelectorAll("[data-reveal-heading]")].filter(
    node => !node.closest(".hero-page")
  );
  if (!headings.length) return;

  if (!("IntersectionObserver" in window) || hardDisable) {
    headings.forEach(node => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  headings.forEach(node => {
    node.style.setProperty("--reveal-delay", "0ms");
    observer.observe(node);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeadingReveal);
} else {
  initHeadingReveal();
}
