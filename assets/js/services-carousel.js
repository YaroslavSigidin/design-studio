const initServicesCarousel = () => {
  const root = document.querySelector("[data-services-carousel]");
  const track = document.getElementById("studioServicesGrid");
  const prevButton = root?.querySelector("[data-services-prev]");
  const nextButton = root?.querySelector("[data-services-next]");
  const viewport = root?.querySelector(".studio-services-carousel__viewport");
  if (!root || !track || !viewport || !prevButton || !nextButton) return;

  const getCards = () => [...track.querySelectorAll("[data-service-card]")];

  const getStep = () => {
    const card = getCards().find(item => !item.hasAttribute("data-service-clone")) || getCards()[0];
    if (!card) return 320;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "14") || 14;
    return card.offsetWidth + gap;
  };

  const centerCard = card => {
    if (!card) return;
    const targetLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollLeft = targetLeft;
  };

  const prepareLoop = () => {
    if (track.dataset.loopReady === "true") {
      return Number(track.dataset.originalCount || 0);
    }

    const originals = [...track.children].filter(card => !card.hasAttribute("data-service-clone"));
    if (originals.length < 2) return originals.length;

    const setWidth = track.scrollWidth;
    const endFragment = document.createDocumentFragment();
    const startFragment = document.createDocumentFragment();

    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-service-clone", "append");
      clone.setAttribute("aria-hidden", "true");
      endFragment.appendChild(clone);
    });

    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-service-clone", "prepend");
      clone.setAttribute("aria-hidden", "true");
      startFragment.appendChild(clone);
    });

    track.appendChild(endFragment);
    track.insertBefore(startFragment, track.firstChild);

    track.dataset.loopReady = "true";
    track.dataset.originalCount = String(originals.length);
    track.dataset.loopSetWidth = String(setWidth);
    return originals.length;
  };

  const normalizeLoop = () => {
    const setWidth = Number(track.dataset.loopSetWidth || 0);
    if (!setWidth) return;

    const left = track.scrollLeft;
    if (left >= setWidth * 2 - 6) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft = left - setWidth;
      track.style.scrollBehavior = "";
    } else if (left <= 6) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft = left + setWidth;
      track.style.scrollBehavior = "";
    }
  };

  const updateFocus = () => {
    const cards = getCards();
    if (!cards.length) return;

    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;
    const cardWidth = cards.find(card => !card.hasAttribute("data-service-clone"))?.offsetWidth || cards[0].offsetWidth || 360;
    const focusBand = cardWidth * 0.88;
    const fadeBand = viewportRect.width * 0.42;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - centerX);
      let opacity = 1;
      let scale = 1;

      if (distance <= focusBand * 0.42) {
        scale = 1.02;
      } else if (distance > focusBand) {
        const fadeProgress = Math.min(1, (distance - focusBand) / Math.max(fadeBand - focusBand, 1));
        opacity = Math.max(0.42, 1 - fadeProgress * 0.58);
        scale = Math.max(0.97, 1 - fadeProgress * 0.03);
      }

      card.style.setProperty("--service-card-opacity", opacity.toFixed(3));
      card.style.setProperty("--service-card-scale", scale.toFixed(3));
      card.classList.toggle("is-focus", distance <= focusBand);
    });

    prevButton.disabled = false;
    nextButton.disabled = false;
  };

  let normalizeTimer = 0;

  const onTrackScroll = () => {
    updateFocus();
    window.clearTimeout(normalizeTimer);
    normalizeTimer = window.setTimeout(normalizeLoop, 110);
  };

  const scrollByStep = direction => {
    track.scrollBy({ left: direction * getStep(), behavior: "smooth" });
  };

  prevButton.addEventListener("click", () => scrollByStep(-1));
  nextButton.addEventListener("click", () => scrollByStep(1));
  track.addEventListener("scroll", onTrackScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateFocus();
    normalizeLoop();
  }, { passive: true });

  const boot = () => {
    const count = prepareLoop();
    if (!count) return;

    const startIndex = Math.min(1, count - 1);
    const target = track.children[count + startIndex];
    centerCard(target);
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
