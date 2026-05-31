const initHeadingReveal = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const lowEndCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const headings = [...document.querySelectorAll("[data-reveal-heading]")];
  if (!headings.length) return;

  if (!("IntersectionObserver" in window) || reducedMotion || saveData || lowEndCpu) {
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
    { threshold: 0.22, rootMargin: "0px 0px -7% 0px" }
  );

  headings.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    observer.observe(node);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeadingReveal);
} else {
  initHeadingReveal();
}
