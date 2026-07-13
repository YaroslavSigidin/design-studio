const initPromoStrip = () => {
  const modal = document.querySelector("[data-promo-modal]");
  const timerNode = document.querySelector("[data-promo-timer]");
  const openButton = document.querySelector("[data-promo-open]");
  const closeTargets = document.querySelectorAll("[data-promo-close]");

  if (!modal || !timerNode || !openButton) return;

  const setBodyScroll = locked => {
    document.body.style.overflow = locked ? "hidden" : "";
  };

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setBodyScroll(true);
    openButton.setAttribute("aria-expanded", "true");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    setBodyScroll(false);
    openButton.setAttribute("aria-expanded", "false");
    openButton.focus();
  };

  openButton.addEventListener("click", openModal);
  closeTargets.forEach(target => {
    target.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

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
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPromoStrip);
} else {
  initPromoStrip();
}
