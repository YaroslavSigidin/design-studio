const initBriefModal = () => {
  const modal = document.getElementById("briefModal");
  const form = document.getElementById("briefForm");
  const serviceInput = document.getElementById("briefServiceValue");
  const serviceSelect = modal?.querySelector("[data-brief-service-select]");
  const serviceTrigger = modal?.querySelector("[data-brief-service-trigger]");
  const serviceLabel = modal?.querySelector("[data-brief-service-label]");
  const serviceMenu = modal?.querySelector("[data-brief-service-menu]");
  const success = document.getElementById("briefSuccess");
  const budgetRange = form?.querySelector("[data-brief-budget-range]");
  const budgetLabel = form?.querySelector("[data-brief-budget-label]");
  const deadlineRange = form?.querySelector("[data-brief-deadline-range]");
  const deadlineLabel = form?.querySelector("[data-brief-deadline-label]");
  const phoneInput = form?.querySelector('input[name="phone"]');
  if (!modal || !form || !serviceInput || !serviceSelect || !serviceTrigger || !serviceLabel || !serviceMenu || !success) {
    return;
  }

  const serviceNames = [...new Set((window.SERVICES || []).map(item => item.title))];
  const services = [...serviceNames, "Другое"];
  let currentService = "";
  let isMenuOpen = false;
  let lastFocusedElement = null;

  const lockScroll = locked => {
    document.body.style.overflow = locked ? "hidden" : "";
  };

  const renderServiceMenu = () => {
    serviceMenu.innerHTML = services
      .map(
        item => `
          <button
            class="brief-service-select__option${item === currentService ? " is-active" : ""}"
            type="button"
            data-brief-service-option
            data-value="${String(item).replace(/"/g, "&quot;")}"
          >
            ${item}
          </button>
        `
      )
      .join("");
  };

  const syncServiceValue = value => {
    currentService = value || "";
    serviceInput.value = currentService;
    serviceLabel.textContent = currentService || "Выберите услугу";
    renderServiceMenu();
  };

  const openMenu = () => {
    isMenuOpen = true;
    serviceSelect.classList.add("is-open");
    serviceMenu.hidden = false;
    serviceMenu.setAttribute("aria-hidden", "false");
    serviceTrigger.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    isMenuOpen = false;
    serviceSelect.classList.remove("is-open");
    serviceMenu.hidden = true;
    serviceMenu.setAttribute("aria-hidden", "true");
    serviceTrigger.setAttribute("aria-expanded", "false");
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

  if (phoneInput) {
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value.trim()) phoneInput.value = "+7 ";
    });
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatRuPhone(phoneInput.value);
    });
    phoneInput.addEventListener("blur", () => {
      if (getPhoneDigits(phoneInput.value).length <= 1) phoneInput.value = "";
    });
  }

  const formatMoney = value => `${new Intl.NumberFormat("ru-RU").format(value * 1000)} ₽`;
  const getDeclension = (value, [one, two, five]) => {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 14) return five;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return two;
    return five;
  };

  const formatDeadline = value => {
    const days = Number(value);
    if (days < 14) return `${days} ${getDeclension(days, ["день", "дня", "дней"])}`;
    if (days < 60) {
      const weeks = Math.round(days / 7);
      return `${weeks} ${getDeclension(weeks, ["неделя", "недели", "недель"])}`;
    }
    const months = Math.round((days / 30) * 10) / 10;
    return `${String(months).replace(".0", "")} мес`;
  };

  const setRangeProgress = input => {
    if (!input) return;
    const min = Number(input.min || 0);
    const maxValue = Number(input.max || 100);
    const value = Number(input.value || min);
    const progress = ((value - min) * 100) / (maxValue - min || 1);
    input.style.setProperty("--range-progress", `${Math.max(0, Math.min(progress, 100))}%`);
  };

  const updateRanges = () => {
    if (budgetRange && budgetLabel) {
      budgetLabel.textContent = formatMoney(Number(budgetRange.value));
      setRangeProgress(budgetRange);
    }
    if (deadlineRange && deadlineLabel) {
      deadlineLabel.textContent = formatDeadline(Number(deadlineRange.value));
      setRangeProgress(deadlineRange);
    }
  };

  const open = presetService => {
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lockScroll(true);

    const preset = presetService?.trim() || "";
    syncServiceValue(services.includes(preset) ? preset : "");
    closeMenu();
    success.hidden = true;
    form.hidden = false;
    updateRanges();
    modal.querySelector('input[name="name"]')?.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    closeMenu();
    lockScroll(false);
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  document.addEventListener("click", event => {
    const opener = event.target.closest("[data-open-brief-modal]");
    if (!opener) return;
    event.preventDefault();
    open(opener.dataset.service || "");
  });

  modal.addEventListener("click", event => {
    if (event.target.closest("[data-close-brief-modal]")) {
      event.preventDefault();
      close();
      return;
    }

    if (event.target.closest("[data-brief-service-trigger]")) {
      event.preventDefault();
      if (isMenuOpen) closeMenu();
      else openMenu();
      return;
    }

    const option = event.target.closest("[data-brief-service-option]");
    if (option) {
      syncServiceValue(option.dataset.value || services[0] || "Другое");
      closeMenu();
      return;
    }

    if (!event.target.closest("[data-brief-service-select]")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      close();
    }
  });

  form.addEventListener("focusin", event => {
    if (isMenuOpen && !event.target.closest("[data-brief-service-select]")) {
      closeMenu();
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!serviceInput.value) {
      serviceTrigger.focus();
      return;
    }

    if (!phoneInput?.value.trim()) {
      phoneInput?.focus();
      return;
    }

    if (getPhoneDigits(phoneInput.value).length !== 11) {
      phoneInput.focus();
      return;
    }

    const result = await window.STUDIO_CONTACT?.submitLead({
      source: "Модальное окно брифа",
      service: serviceInput.value,
      name: form.querySelector('input[name="name"]')?.value.trim() || "",
      phone: phoneInput?.value.trim() || "",
      budget: budgetLabel?.textContent || "",
      deadline: deadlineLabel?.textContent || "",
      comment: form.querySelector('textarea[name="comment"]')?.value.trim() || ""
    });

    form.hidden = true;
    success.hidden = false;
    if (result?.ok && (result.mode === "crm" || result.mode === "telegram")) {
      success.querySelector("h3").textContent = "Заявка отправлена";
      success.querySelector("p").textContent =
        "Мы получили данные в Telegram-группу и скоро свяжемся с вами.";
    } else {
      success.querySelector("h3").textContent = "Не удалось отправить";
      success.querySelector("p").textContent =
        result?.error || "Попробуйте ещё раз или напишите нам в Telegram.";
    }

    window.setTimeout(() => {
      close();
      form.reset();
      if (budgetRange) budgetRange.value = "150";
      if (deadlineRange) deadlineRange.value = "30";
      syncServiceValue("");
      updateRanges();
      form.hidden = false;
      success.hidden = true;
    }, result?.ok ? 1600 : 2200);
  });

  budgetRange?.addEventListener("input", updateRanges);
  deadlineRange?.addEventListener("input", updateRanges);

  syncServiceValue("");
  updateRanges();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBriefModal);
} else {
  initBriefModal();
}
