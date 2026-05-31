const initPromoStrip = () => {
  const timerNode = document.querySelector("[data-promo-timer]");
  if (!timerNode) return;

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
