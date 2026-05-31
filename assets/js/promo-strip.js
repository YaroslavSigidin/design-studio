const initPromoStrip = () => {
  const strip = document.querySelector("[data-promo-strip]");
  const timerNode = document.querySelector("[data-promo-timer]");
  const closeButton = document.querySelector("[data-promo-close]");
  const storageKey = "studio-promo-dismissed";
  if (!strip || !timerNode) return;

  try {
    if (window.localStorage.getItem(storageKey) === "true") {
      strip.classList.add("is-hidden");
      return;
    }
  } catch {}

  let remainingSeconds = 20 * 3600 + 10 * 60 + 46;

  const formatPart = (value, suffix) => `${String(value).padStart(2, "0")}${suffix}`;

  const render = () => {
    const safeValue = Math.max(0, remainingSeconds);
    const hours = Math.floor(safeValue / 3600);
    const minutes = Math.floor((safeValue % 3600) / 60);
    const seconds = safeValue % 60;
    timerNode.textContent = `${formatPart(hours, "ч")}:${formatPart(minutes, "м")}:${formatPart(seconds, "с")}`;
  };

  render();

  window.setInterval(() => {
    remainingSeconds = remainingSeconds > 0 ? remainingSeconds - 1 : 20 * 3600 + 10 * 60 + 46;
    render();
  }, 1000);

  closeButton?.addEventListener("click", () => {
    strip.classList.add("is-hidden");
    try {
      window.localStorage.setItem(storageKey, "true");
    } catch {}
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPromoStrip);
} else {
  initPromoStrip();
}
