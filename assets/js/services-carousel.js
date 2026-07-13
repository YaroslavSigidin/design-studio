const initServicesCarousel = () => {
  const root = document.querySelector("[data-services-carousel]");
  const track = document.getElementById("studioServicesGrid");
  const prevButton = root?.querySelector("[data-services-prev]");
  const nextButton = root?.querySelector("[data-services-next]");
  const viewport = root?.querySelector(".studio-services-carousel__viewport");
  if (!root || !track || !viewport || !prevButton || !nextButton) return;

  const getCards = () => [...track.querySelectorAll("[data-service-card]")];

  const getStep = () => {
    const cards = getCards();
    if (!cards.length) return 320;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "14") || 14;
    return cards[0].offsetWidth + gap;
  };

  const updateFocus = () => {
    const cards = getCards();
    if (!cards.length) return;

    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;
    const cardWidth = cards[0].offsetWidth || 360;
    const focusBand = cardWidth * 0.92;
    const fadeBand = viewportRect.width * 0.46;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - centerX);
      let opacity = 1;
      let scale = 1;
      const focusRatio = Math.min(1, distance / Math.max(focusBand, 1));

      if (distance <= focusBand * 0.35) {
        scale = 1.028;
      } else if (distance > focusBand) {
        const fadeProgress = Math.min(1, (distance - focusBand) / Math.max(fadeBand - focusBand, 1));
        opacity = Math.max(0.04, 1 - fadeProgress * 0.96);
        scale = Math.max(0.92, 1 - fadeProgress * 0.07);
      } else {
        scale = 1 + (1 - focusRatio) * 0.02;
      }

      card.style.setProperty("--service-card-opacity", opacity.toFixed(3));
      card.style.setProperty("--service-card-scale", scale.toFixed(3));
      card.classList.toggle("is-focus", distance <= focusBand);
    });

    const maxScroll = track.scrollWidth - track.clientWidth;
    prevButton.disabled = track.scrollLeft <= 4;
    nextButton.disabled = track.scrollLeft >= maxScroll - 4;
  };

  const scrollByStep = direction => {
    track.scrollBy({ left: direction * getStep(), behavior: "smooth" });
  };

  prevButton.addEventListener("click", () => scrollByStep(-1));
  nextButton.addEventListener("click", () => scrollByStep(1));
  track.addEventListener("scroll", updateFocus, { passive: true });
  window.addEventListener("resize", updateFocus, { passive: true });

  const boot = () => {
    const cards = getCards();
    if (!cards.length) return;
    const startIndex = Math.min(1, cards.length - 1);
    const target = cards[startIndex];
    const targetLeft = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
    track.scrollLeft = Math.max(0, targetLeft);
    updateFocus();
  };

  if (track.children.length) {
    boot();
  } else {
    window.addEventListener("studio:services-rendered", boot, { once: true });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServicesCarousel);
} else {
  initServicesCarousel();
}
