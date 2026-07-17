const initAboutMotion = () => {
  const section = document.querySelector("[data-about]");
  if (!section || section.classList.contains("is-inview")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const cards = [...section.querySelectorAll("[data-about-card]")];

  const settle = () => {
    section.classList.add("is-settled");
  };

  const play = () => {
    section.classList.add("is-inview");
    window.setTimeout(settle, 1100);
  };

  if (reducedMotion || saveData || !("IntersectionObserver" in window)) {
    play();
    settle();
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        play();
        observer.disconnect();
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  observer.observe(section);

  cards.forEach(card => {
    card.addEventListener(
      "animationend",
      event => {
        if (event.target !== card) return;
        if (cards.every(node => getComputedStyle(node).opacity === "1")) settle();
      },
      { once: true }
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAboutMotion);
} else {
  initAboutMotion();
}
