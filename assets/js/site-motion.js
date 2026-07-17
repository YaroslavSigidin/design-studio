const initSiteMotion = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const lowEndCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const targetSelector = [
    ".hero-badge",
    ".hero-btn",
    ".project-card",
    ".studio-discuss__inner",
    ".studio-faq__item",
    ".studio-footer__card",
    ".case-block",
    ".case-related-card",
    ".case-lead-form__inner"
  ].join(",");
  const hardDisable = reducedMotion || saveData || lowEndCpu;

  let itemIndex = 0;
  const seen = new WeakSet();

  const intersectionObserver = hardDisable
    ? null
    : new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            intersectionObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -8% 0px"
        }
      );

  const registerElement = element => {
    if (!element || seen.has(element)) return;
    seen.add(element);

    element.classList.add("motion-item");
    element.style.setProperty("--motion-delay", `${Math.min((itemIndex % 11) * 55, 460)}ms`);
    itemIndex += 1;

    if (hardDisable) {
      element.classList.add("is-visible");
      return;
    }

    intersectionObserver.observe(element);
  };

  const scan = root => {
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof Element && root.matches(targetSelector)) registerElement(root);

    const nodes = root.querySelectorAll ? root.querySelectorAll(targetSelector) : [];
    nodes.forEach(registerElement);
  };

  const runScan = () => scan(document);
  runScan();
  window.setTimeout(runScan, 500);
  window.setTimeout(runScan, 1600);
  window.setTimeout(runScan, 3200);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteMotion);
} else {
  initSiteMotion();
}
