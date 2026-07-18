(() => {
  const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  const getFocusable = root => {
    if (!root) return [];
    return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(node => {
      if (node.hasAttribute("disabled") || node.getAttribute("aria-hidden") === "true") return false;
      if (node.closest("[inert]")) return false;
      const style = window.getComputedStyle(node);
      return style.visibility !== "hidden" && style.display !== "none";
    });
  };

  const setInert = (node, inert) => {
    if (!node) return;
    if ("inert" in node) {
      node.inert = Boolean(inert);
      return;
    }
    if (inert) node.setAttribute("aria-hidden", "true");
    else node.removeAttribute("aria-hidden");
  };

  const setBackgroundInert = (activeRoot, inert) => {
    [...document.body.children].forEach(child => {
      if (child === activeRoot) return;
      if (child.tagName === "SCRIPT" || child.tagName === "STYLE") return;
      setInert(child, inert);
    });
  };

  const trapFocus = (container, event) => {
    if (event.key !== "Tab" || !container) return;
    const focusable = getFocusable(container);
    if (!focusable.length) {
      event.preventDefault();
      container.focus?.();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const createFocusTrap = (container, { onEscape } = {}) => {
    let active = false;

    const onKeyDown = event => {
      if (!active) return;
      if (event.key === "Escape") {
        onEscape?.(event);
        return;
      }
      trapFocus(container, event);
    };

    return {
      activate() {
        if (active) return;
        active = true;
        document.addEventListener("keydown", onKeyDown, true);
      },
      deactivate() {
        if (!active) return;
        active = false;
        document.removeEventListener("keydown", onKeyDown, true);
      }
    };
  };

  const clearFieldError = field => {
    if (!(field instanceof HTMLElement)) return;
    field.removeAttribute("aria-invalid");
    const describedBy = field.getAttribute("aria-describedby") || "";
    const errorId = describedBy
      .split(/\s+/)
      .find(id => id.endsWith("-error") || document.getElementById(id)?.classList.contains("field-error"));
    if (errorId) {
      document.getElementById(errorId)?.remove();
      const next = describedBy
        .split(/\s+/)
        .filter(id => id && id !== errorId)
        .join(" ");
      if (next) field.setAttribute("aria-describedby", next);
      else field.removeAttribute("aria-describedby");
    }
  };

  const setFieldError = (field, message) => {
    if (!(field instanceof HTMLElement)) return;
    if (!message) {
      clearFieldError(field);
      return;
    }

    if (!field.id) {
      field.id = `field-${Math.random().toString(36).slice(2, 9)}`;
    }

    const errorId = `${field.id}-error`;
    let error = document.getElementById(errorId);
    if (!error) {
      error = document.createElement("p");
      error.id = errorId;
      error.className = "field-error";
      error.setAttribute("role", "alert");
      field.insertAdjacentElement("afterend", error);
    }

    error.textContent = message;
    field.setAttribute("aria-invalid", "true");
    const existing = (field.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter(Boolean);
    if (!existing.includes(errorId)) {
      field.setAttribute("aria-describedby", [...existing, errorId].join(" "));
    }
  };

  const focusFirstInvalid = form => {
    if (!form) return null;
    const invalid =
      form.querySelector("[aria-invalid='true']") ||
      form.querySelector(":invalid");
    if (invalid instanceof HTMLElement) {
      invalid.focus();
      return invalid;
    }
    return null;
  };

  window.STUDIO_A11Y = {
    getFocusable,
    setInert,
    setBackgroundInert,
    trapFocus,
    createFocusTrap,
    setFieldError,
    clearFieldError,
    focusFirstInvalid
  };
})();
