const initBriefModal = () => {
  const modal = document.getElementById("briefModal");
  const form = document.getElementById("briefForm");
  const modalTitle = document.getElementById("briefModalTitle");
  const phoneInput = form?.querySelector('input[name="phone"]');
  const nameInput = form?.querySelector('input[name="name"]');
  const submitButton = form?.querySelector('button[type="submit"]');
  if (!modal || !form || !phoneInput || !nameInput || !submitButton) return;

  const defaultModalTitle = modalTitle?.textContent?.trim() || "Заказать дизайн";
  const dialog = modal.querySelector(".brief-modal__dialog") || modal;
  const a11y = () => window.STUDIO_A11Y;
  let lastFocusedElement = null;
  let focusTrap = null;

  const clearErrors = () => {
    form.querySelectorAll("[aria-invalid='true']").forEach(field => a11y()?.clearFieldError?.(field));
  };

  const formatRuPhone = input => {
    let digits = String(input || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "8") digits = `7${digits.slice(1)}`;
    if (digits[0] === "9") digits = `7${digits}`;
    if (digits[0] !== "7") digits = `7${digits}`;
    digits = digits.slice(0, 11);
    const code = digits.slice(1, 4);
    const part1 = digits.slice(4, 7);
    const part2 = digits.slice(7, 9);
    const part3 = digits.slice(9, 11);
    let formatted = "+7";
    if (code) formatted += ` (${code}`;
    if (code.length === 3) formatted += ")";
    if (part1) formatted += ` ${part1}`;
    if (part2) formatted += `-${part2}`;
    if (part3) formatted += `-${part3}`;
    return formatted;
  };

  const getPhoneDigits = value => String(value || "").replace(/\D/g, "");

  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value.trim()) phoneInput.value = "+7 ";
  });
  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatRuPhone(phoneInput.value);
  });
  phoneInput.addEventListener("blur", () => {
    if (getPhoneDigits(phoneInput.value).length <= 1) phoneInput.value = "";
  });

  const reset = () => {
    form.reset();
    const privacy = form.querySelector('input[name="privacy"]');
    if (privacy instanceof HTMLInputElement) privacy.checked = true;
    submitButton.disabled = false;
    submitButton.classList.remove("is-sending", "is-success", "is-error");
    submitButton.textContent = "Отправить заявку";
    delete form.dataset.leadSource;
    delete form.dataset.service;
    delete form.dataset.comment;
    if (modalTitle) modalTitle.textContent = defaultModalTitle;
    clearErrors();
  };

  const open = (options = {}) => {
    const opts = typeof options === "string" ? { service: options } : options || {};
    reset();
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    form.dataset.leadSource = String(opts.source || "Быстрая форма").trim() || "Быстрая форма";
    form.dataset.service = String(opts.service || "").trim();
    form.dataset.comment = String(opts.comment || "").trim();
    if (modalTitle) modalTitle.textContent = String(opts.title || "").trim() || defaultModalTitle;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    a11y()?.setBackgroundInert?.(modal, true);
    focusTrap?.activate?.();
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => nameInput.focus());
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    focusTrap?.deactivate?.();
    a11y()?.setBackgroundInert?.(modal, false);
    document.body.style.overflow = "";
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
    lastFocusedElement = null;
  };

  focusTrap = a11y()?.createFocusTrap?.(dialog, {
    onEscape: event => {
      if (!modal.classList.contains("is-open")) return;
      event.preventDefault();
      close();
    }
  });

  const openFromElement = opener =>
    open({
      service: opener.dataset.service || "",
      source: opener.dataset.briefSource || "Быстрая форма",
      comment: opener.dataset.briefComment || "",
      title: opener.dataset.briefTitle || ""
    });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-promo-close]")) return;
    const opener = event.target.closest("[data-open-brief-modal]");
    if (!opener) return;
    event.preventDefault();
    openFromElement(opener);
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const opener = event.target.closest("[data-open-brief-modal][role='button']");
    if (!opener || event.target !== opener) return;
    event.preventDefault();
    openFromElement(opener);
  });

  modal.addEventListener("click", event => {
    if (!event.target.closest("[data-close-brief-modal]")) return;
    event.preventDefault();
    close();
  });

  form.addEventListener("focusin", event => {
    if (event.target instanceof HTMLElement) a11y()?.clearFieldError?.(event.target);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    if (!name) {
      a11y()?.setFieldError?.(nameInput, "Укажите имя.");
      nameInput.focus();
      return;
    }
    if (getPhoneDigits(phoneInput.value).length !== 11) {
      a11y()?.setFieldError?.(phoneInput, "Введите телефон полностью: +7 (___) ___-__-__.");
      phoneInput.focus();
      return;
    }
    const privacy = form.querySelector('input[name="privacy"]');
    if (privacy instanceof HTMLInputElement && !privacy.checked) {
      a11y()?.setFieldError?.(privacy, "Отметьте согласие с политикой конфиденциальности.");
      privacy.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.remove("is-success", "is-error");
    submitButton.classList.add("is-sending");
    submitButton.textContent = "Отправляем…";

    const payload = {
      source: form.dataset.leadSource || "Быстрая форма",
      service: form.dataset.service || "",
      name,
      phone: phoneInput.value.trim(),
      comment: form.dataset.comment || ""
    };
    const result = await window.STUDIO_CONTACT?.submitLead(payload);

    if (result?.confirmed && result?.ok) {
      submitButton.classList.remove("is-sending", "is-error");
      submitButton.classList.add("is-success");
      submitButton.textContent = "Заявка отправлена ✓";
      return;
    }

    submitButton.disabled = false;
    submitButton.classList.remove("is-sending", "is-success");
    submitButton.classList.add("is-error");
    submitButton.textContent = "Не отправилось — повторить";
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBriefModal);
} else {
  initBriefModal();
}
