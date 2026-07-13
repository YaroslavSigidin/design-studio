const initPromoStrip = () => {
  const strip = document.querySelector("[data-promo-strip]");
  const timerNode = document.querySelector("[data-promo-timer]");
  const closeButton = document.querySelector("[data-promo-close]");
  const storageKey = "studio-promo-dismissed";
  const desktopMedia = window.matchMedia("(min-width: 1101px)");
  if (!strip || !timerNode) return;

  const syncVisibility = () => {
    if (desktopMedia.matches) {
      strip.classList.remove("is-hidden");
      return true;
    }

    try {
      if (window.localStorage.getItem(storageKey) === "true") {
        strip.classList.add("is-hidden");
        return false;
      }
    } catch {}

    strip.classList.remove("is-hidden");
    return true;
  };

  let remainingSeconds = 20 * 3600 + 10 * 60 + 46;

  const formatPart = (value, suffix) => `${String(value).padStart(2, "0")}${suffix}`;

  const render = () => {
    const safeValue = Math.max(0, remainingSeconds);
    const hours = Math.floor(safeValue / 3600);
    const minutes = Math.floor((safeValue % 3600) / 60);
    const seconds = safeValue % 60;
    timerNode.textContent = `${formatPart(hours, "ч")}:${formatPart(minutes, "м")}:${formatPart(seconds, "с")}`;
  };

  const startTimer = () => {
    if (!syncVisibility()) return;

    render();
    window.setInterval(() => {
      remainingSeconds = remainingSeconds > 0 ? remainingSeconds - 1 : 20 * 3600 + 10 * 60 + 46;
      render();
    }, 1000);
  };

  const handleMediaChange = () => {
    syncVisibility();
  };

  startTimer();

  closeButton?.addEventListener("click", () => {
    strip.classList.add("is-hidden");
    try {
      if (!desktopMedia.matches) {
        window.localStorage.setItem(storageKey, "true");
      }
    } catch {}
    document.dispatchEvent(new CustomEvent("studio:promo-hidden"));
  });

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleMediaChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(handleMediaChange);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPromoStrip);
} else {
  initPromoStrip();
}
