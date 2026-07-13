const initHeroWordmarkScroll = () => {
  const wordmark = document.querySelector("[data-hero-wordmark]");
  const heroPage = document.querySelector(".hero-page");
  if (!wordmark || !heroPage) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  if (reducedMotion || saveData) return;

  let ticking = false;

  const update = () => {
    const range = Math.max(heroPage.offsetHeight * 0.52, window.innerHeight * 0.42, 320);
    const progress = Math.min(1, Math.max(0, window.scrollY / range));
    const eased = 1 - (1 - progress) ** 1.65;

    wordmark.style.setProperty("--wordmark-scale", (1 + eased * 0.34).toFixed(4));
    wordmark.style.setProperty("--wordmark-shift", `${(-eased * 108).toFixed(2)}px`);
    wordmark.style.setProperty("--wordmark-opacity", (1 - eased * 0.98).toFixed(4));
    wordmark.style.setProperty("--wordmark-blur", `${(eased * 7).toFixed(2)}px`);
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
  document.addEventListener("DOMContentLoaded", initHeroWordmarkScroll);
} else {
  initHeroWordmarkScroll();
}
