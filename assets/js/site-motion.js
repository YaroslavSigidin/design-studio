const initSiteMotion = () => {
  const perf = window.STUDIO_PERF;
  const hardDisable =
    Boolean(perf?.isLite) || Boolean(perf?.prefersReducedMotion);

  // Everything below the hero — never touch .hero-page
  const RULES = [
    { sel: ".studio-services .section-subtitle", variant: "fade-up", delayStep: 80 },
    { sel: ".studio-services-carousel.is-arc .studio-services-carousel__viewport", variant: "scale-in", delayStep: 0 },
    { sel: ".studio-services-carousel:not(.is-arc) .studio-service-card", variant: "fade-up", delayStep: 60 },
    { sel: ".studio-services-carousel__controls", variant: "fade-up", delayStep: 0 },
    { sel: ".studio-cases .tabs", variant: "fade-up", delayStep: 0 },
    {
      sel: ".studio-cases .project-card:not(.case-skeleton):not(.project-card--beyond-limit)",
      variant: "fade-up",
      delayStep: 45,
      max: 9
    },
    { sel: ".studio-cases-more", variant: "fade-up", delayStep: 0 },
    { sel: ".studio-services-ai__subtitle", variant: "fade-up", delayStep: 60 },
    { sel: ".studio-services-ai__chat", variant: "fade-up", delayStep: 0 },
    { sel: ".studio-faq__item", variant: "slide-up", delayStep: 55 },
    { sel: ".studio-footer__card", variant: "fade-up", delayStep: 0 },
    { sel: ".studio-footer__bottom", variant: "fade-up", delayStep: 0 },
    { sel: ".case-hero-copy", variant: "fade-up", delayStep: 0 },
    { sel: ".case-hero-media", variant: "fade-up", delayStep: 0 },
    { sel: ".case-block", variant: "fade-up", delayStep: 50 },
    { sel: ".case-related-card", variant: "fade-up", delayStep: 45 },
    { sel: ".case-lead-form__inner", variant: "fade-up", delayStep: 0 },
    { sel: ".studio-case-page .studio-footer__card", variant: "fade-up", delayStep: 0 },
    { sel: ".studio-case-page .studio-footer__bottom", variant: "fade-up", delayStep: 0 }
  ];

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
          threshold: 0.08,
          rootMargin: "0px 0px -8% 0px"
        }
      );

  const registerElement = (element, variant, delayMs) => {
    if (!element || seen.has(element)) return;
    if (element.closest(".hero-page")) return;
    if (element.matches("[data-reveal-heading]")) return;
    if (element.matches("[data-about-card]") || element.closest("[data-about-card]")) return;
    if (element.hidden) return;
    if (element.classList.contains("project-card--beyond-limit")) return;
    seen.add(element);

    element.classList.add("motion-item", `motion-item--${variant}`);
    element.dataset.motion = variant;
    element.style.setProperty("--motion-delay", `${delayMs}ms`);

    if (hardDisable) {
      element.classList.add("is-visible");
      return;
    }

    intersectionObserver.observe(element);
  };

  const scan = () => {
    RULES.forEach(rule => {
      let localIndex = 0;
      document.querySelectorAll(rule.sel).forEach(node => {
        if (node.closest(".hero-page")) return;
        if (node.classList.contains("project-card--beyond-limit")) return;
        if (typeof rule.max === "number" && localIndex >= rule.max) {
          // Do not force-show overflow cards — collapse owns those
          return;
        }
        const delay = Math.min(localIndex * rule.delayStep, 360);
        registerElement(node, rule.variant, delay);
        localIndex += 1;
      });
    });
  };

  scan();

  ["studio:services-rendered", "studio:cases-rendered", "studio:case-rendered"].forEach(
    eventName => {
      window.addEventListener(eventName, () => {
        window.requestAnimationFrame(scan);
      });
    }
  );

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(scan, { timeout: 1800 });
  } else {
    window.setTimeout(scan, 900);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteMotion);
} else {
  initSiteMotion();
}
