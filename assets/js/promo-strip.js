const initPromoStrip = () => {
  const strip = document.querySelector("[data-promo-strip]");
  const timerNode = document.querySelector("[data-promo-timer]");
  const closeButton = document.querySelector("[data-promo-close]");
  const desktopMedia = window.matchMedia("(min-width: 1101px)");
  const storageKey = "studio-promo-dismissed-v2";
  if (!strip || !timerNode) return;

  const promoConfig = window.STUDIO_CONFIG?.promo || {};
  const endsAtMs = Date.parse(String(promoConfig.endsAt || ""));
  if (!Number.isFinite(endsAtMs)) {
    strip.classList.add("is-hidden");
    return;
  }

  if (Date.now() >= endsAtMs) {
    strip.classList.add("is-hidden");
    document.dispatchEvent(new CustomEvent("studio:promo-hidden"));
    return;
  }

  let timerId = 0;

  const isDismissed = () => window.localStorage.getItem(storageKey) === "1";
  const getRemainingMs = () => Math.max(0, endsAtMs - Date.now());
  const isExpired = () => getRemainingMs() <= 0;

  const stopTimer = () => {
    if (!timerId) return;
    window.clearInterval(timerId);
    timerId = 0;
  };

  const syncVisibility = () => {
    if (!desktopMedia.matches || isDismissed() || isExpired()) {
      strip.classList.add("is-hidden");
      stopTimer();
      if (isExpired()) {
        document.dispatchEvent(new CustomEvent("studio:promo-hidden"));
      }
      return false;
    }

    strip.classList.remove("is-hidden");
    return true;
  };

  const formatPart = (value, suffix) => `${String(value).padStart(2, "0")}${suffix}`;

  const render = () => {
    const remainingMs = getRemainingMs();
    if (remainingMs <= 0) {
      timerNode.textContent = "00ч:00м:00с";
      syncVisibility();
      return;
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    timerNode.textContent =
      days > 0
        ? `${days}д:${formatPart(hours, "ч")}:${formatPart(minutes, "м")}`
        : `${formatPart(hours, "ч")}:${formatPart(minutes, "м")}:${formatPart(seconds, "с")}`;
  };

  const startTimer = () => {
    stopTimer();
    if (!syncVisibility() || document.hidden) {
      render();
      return;
    }

    render();
    timerId = window.setInterval(() => {
      render();
      if (isExpired()) syncVisibility();
    }, 1000);
  };

  const handleMediaChange = () => {
    startTimer();
  };

  startTimer();

  closeButton?.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    strip.classList.add("is-hidden");
    window.localStorage.setItem(storageKey, "1");
    stopTimer();
    document.dispatchEvent(new CustomEvent("studio:promo-hidden"));
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopTimer();
    else startTimer();
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
