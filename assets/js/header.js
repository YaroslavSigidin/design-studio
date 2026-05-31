const initFloatingHeader = () => {
  const header = document.querySelector("[data-floating-header]");
  const toggleButton = document.querySelector("[data-header-toggle]");
  if (!header || !toggleButton) return;

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    header.classList.add("is-open");
    toggleButton.setAttribute("aria-expanded", "true");
  };

  toggleButton.setAttribute("aria-expanded", "false");

  toggleButton.addEventListener("click", () => {
    if (header.classList.contains("is-open")) {
      closeMenu();
      return;
    }
    openMenu();
  });

  header.querySelectorAll(".hero-mobile-sheet a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", event => {
    if (!header.classList.contains("is-open")) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) closeMenu();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFloatingHeader);
} else {
  initFloatingHeader();
}
