const initHeaderScroll = header => {
  const threshold = 32;
  let lastScrolled = null;

  const update = ({ y } = {}) => {
    const scrollY = typeof y === "number" ? y : window.scrollY;
    const scrolled = scrollY > threshold;
    if (scrolled === lastScrolled) return;
    lastScrolled = scrolled;
    header.classList.toggle("is-scrolled", scrolled);
  };

  if (window.STUDIO_SCROLL?.subscribe) {
    window.STUDIO_SCROLL.subscribe(update);
    return;
  }

  const onScroll =
    typeof window.STUDIO_PERF?.rafThrottle === "function"
      ? window.STUDIO_PERF.rafThrottle(() => update())
      : (() => {
          let ticking = false;
          return () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
              ticking = false;
              update();
            });
          };
        })();

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
};

const initFloatingHeader = () => {
  const header = document.querySelector("[data-floating-header]");
  const toggleButton = document.querySelector("[data-header-toggle]");
  const sheet = document.querySelector("[data-header-sheet]");
  if (!header || !toggleButton) return;

  initHeaderScroll(header);

  let lastFocused = null;
  const a11y = () => window.STUDIO_A11Y;

  const syncSheetState = open => {
    if (!sheet) return;
    sheet.setAttribute("aria-hidden", open ? "false" : "true");
    a11y()?.setInert?.(sheet, !open);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!header.classList.contains("is-open")) return;
    header.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Открыть меню");
    syncSheetState(false);
    if (restoreFocus && lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    } else {
      toggleButton.focus();
    }
    lastFocused = null;
  };

  const openMenu = () => {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : toggleButton;
    header.classList.add("is-open");
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.setAttribute("aria-label", "Закрыть меню");
    syncSheetState(true);
    window.requestAnimationFrame(() => {
      const firstLink = a11y()?.getFocusable?.(sheet)?.[0] || sheet?.querySelector("a");
      firstLink?.focus?.();
    });
  };

  toggleButton.setAttribute("aria-expanded", "false");
  syncSheetState(false);

  toggleButton.addEventListener("click", () => {
    if (header.classList.contains("is-open")) {
      closeMenu({ restoreFocus: false });
      toggleButton.focus();
      return;
    }
    openMenu();
  });

  header.querySelectorAll(".hero-mobile-sheet a").forEach(link => {
    link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener("click", event => {
    if (!header.classList.contains("is-open")) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (!header.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (sheet) a11y()?.trapFocus?.(sheet, event);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) closeMenu({ restoreFocus: false });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFloatingHeader);
} else {
  initFloatingHeader();
}
