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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  if (reducedMotion || saveData) return;

  const layers = [
    { node: wordmark, lift: 52, scale: 0.1, fade: 0.94 },
    { node: subtitle, lift: 40, scale: 0.07, fade: 0.9 },
    { node: brief, lift: 34, scale: 0.06, fade: 0.88 },
    ...(partners ? [{ node: partners, lift: 28, scale: 0.04, fade: 0.82 }] : []),
    ...(stats ? [{ node: stats, lift: 22, scale: 0.03, fade: 0.78 }] : [])
  ];

  let ticking = false;

  const update = () => {
    const range = Math.max(heroPage.offsetHeight * 0.62, window.innerHeight * 0.48, 340);
    const progress = easeOutQuint(clamp01(window.scrollY / range));

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
