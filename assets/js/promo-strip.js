const initPromoStrip = () => {
  const strip = document.querySelector("[data-promo-strip]");
  const timerNode = document.querySelector("[data-promo-timer]");
  const closeButton = document.querySelector("[data-promo-close]");
  const desktopMedia = window.matchMedia("(min-width: 1101px)");
  const storageKey = "studio-promo-dismissed-v2";
  if (!strip || !timerNode) return;

  const isDismissed = () => window.localStorage.getItem(storageKey) === "1";

  const syncVisibility = () => {
    if (!desktopMedia.matches || isDismissed()) {
      strip.classList.add("is-hidden");
      return false;
    }

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
    window.localStorage.setItem(storageKey, "1");
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
