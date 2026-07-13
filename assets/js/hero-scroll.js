const easeOutCubic = value => 1 - (1 - value) ** 3;

const clamp01 = value => Math.min(1, Math.max(0, value));

const initHeroScroll = () => {
  const heroPage = document.querySelector(".hero-page");
  const wordmark = document.querySelector("[data-hero-wordmark]");
  const subtitle = document.querySelector(".hero-subtitle[data-hero-scroll-item]");
  const cta = document.querySelector(".hero-cta-wrap[data-hero-scroll-item]");
  if (!heroPage || !wordmark || !subtitle || !cta) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  if (reducedMotion || saveData) return;

  const layers = [
    {
      node: wordmark,
      delay: 0,
      drive: eased => ({
        opacity: 1 - eased * 0.96,
        transform: `translate3d(${(-eased * 42).toFixed(2)}px, ${(-eased * 72).toFixed(2)}px, 0) scale(${(1 - eased * 0.2).toFixed(4)}) rotate(${(-eased * 3.2).toFixed(2)}deg)`
      })
    },
    {
      node: subtitle,
      delay: 0.1,
      drive: eased => ({
        opacity: 1 - eased * 0.94,
        transform: `translate3d(${(eased * 28).toFixed(2)}px, ${(eased * 56).toFixed(2)}px, 0) scale(${(1 - eased * 0.08).toFixed(4)})`
      })
    },
    {
      node: cta,
      delay: 0.18,
      drive: eased => ({
        opacity: 1 - eased * 0.9,
        transform: `translate3d(0, ${(eased * 104).toFixed(2)}px, 0) scale(${(1 - eased * 0.14).toFixed(4)}) rotate(${(eased * 2.4).toFixed(2)}deg)`
      })
    }
  ];

  let ticking = false;

  const applyLayer = (layer, progress) => {
    const local = clamp01((progress - layer.delay) / (1 - layer.delay));
    const eased = easeOutCubic(local);
    const values = layer.drive(eased);

    layer.node.style.setProperty("--hero-scroll-opacity", values.opacity.toFixed(4));
    layer.node.style.setProperty("--hero-scroll-transform", values.transform);
  };

  const update = () => {
    const range = Math.max(heroPage.offsetHeight * 0.5, window.innerHeight * 0.4, 300);
    const progress = clamp01(window.scrollY / range);

    layers.forEach(layer => applyLayer(layer, progress));
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroScroll);
} else {
  initHeroScroll();
}
