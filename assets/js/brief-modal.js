const initBriefModal = () => {
  const modal = document.getElementById("briefModal");
  const form = document.getElementById("briefForm");
  const quickServices = modal?.querySelector("[data-quick-services]");
  const serviceHidden = document.getElementById("briefServiceValue");
  const success = document.getElementById("briefSuccess");
  const budgetRange = form?.querySelector("[data-brief-budget-range]");
  const budgetLabel = form?.querySelector("[data-brief-budget-label]");
  const deadlineRange = form?.querySelector("[data-brief-deadline-range]");
  const deadlineLabel = form?.querySelector("[data-brief-deadline-label]");
  const phoneInput = form?.querySelector('input[name="phone"]');
  if (!modal || !form || !quickServices || !serviceHidden || !success) return;

  const serviceNames = [...new Set((window.SERVICES || []).map(item => item.title))];
  const serviceOptions = [...serviceNames, "Другое"];
  let selectedService = "";
  let isServiceDropdownOpen = false;
  let lastFocusedElement = null;

  const lockScroll = locked => {
    document.body.style.overflow = locked ? "hidden" : "";
  };

  const syncServiceHidden = () => {
    serviceHidden.value = selectedService;
  };

  const closeServiceDropdown = () => {
    isServiceDropdownOpen = false;
    quickServices.classList.remove("is-dropdown-open");
  };

  const renderServicePicker = () => {
    const summaryText = selectedService || "Выберите услугу";
    const optionsMarkup = serviceOptions
      .map(item => {
        const isActive = selectedService === item;
        return `<button type="button" class="brief-service-chip${isActive ? " is-active" : ""}" data-value="${item}" data-select-service>${item}</button>`;
      })
      .join("");

    quickServices.innerHTML = `
      <button type="button" class="brief-service-trigger" aria-expanded="${isServiceDropdownOpen ? "true" : "false"}" data-toggle-service-dropdown>
        <span class="brief-service-summary-text">${summaryText}</span>
        <svg class="brief-service-caret" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="brief-service-dropdown">
        <div class="brief-service-options">${optionsMarkup}</div>
      </div>
    `;

    quickServices.classList.toggle("is-dropdown-open", isServiceDropdownOpen);
    syncServiceHidden();
  };

  const setService = value => {
    selectedService = String(value || "").trim();
    closeServiceDropdown();
    renderServicePicker();
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
    setService(preset || serviceNames[0] || "Другое");
    success.hidden = true;
    form.hidden = false;
    updateRanges();
    modal.querySelector('input[name="name"]')?.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
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

    if (event.target.closest("[data-toggle-service-dropdown]")) {
      isServiceDropdownOpen = !isServiceDropdownOpen;
      quickServices.classList.toggle("is-dropdown-open", isServiceDropdownOpen);
      return;
    }

    const option = event.target.closest("[data-select-service]");
    if (option) {
      setService(option.dataset.value || "");
      return;
    }

    if (!event.target.closest(".brief-quick-services")) {
      closeServiceDropdown();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      close();
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!serviceHidden.value) {
      setService(serviceNames[0] || "Другое");
    }

    if (!phoneInput?.value.trim()) {
      phoneInput?.focus();
      return;
    }

    if (getPhoneDigits(phoneInput.value).length !== 11) {
      phoneInput.focus();
      return;
    }

    window.STUDIO_CONTACT?.openLeadChannel({
      source: "Модальное окно брифа",
      service: serviceHidden.value,
      name: form.querySelector('input[name="name"]')?.value.trim() || "",
      phone: phoneInput?.value.trim() || "",
      budget: budgetLabel?.textContent || "",
      deadline: deadlineLabel?.textContent || "",
      comment: form.querySelector('textarea[name="comment"]')?.value.trim() || ""
    });

    form.hidden = true;
    success.hidden = false;
    success.querySelector("h3").textContent = "Открываем чат";
    success.querySelector("p").textContent =
      "Текст заявки скопирован, сейчас откроется Telegram с готовым сообщением.";

    window.setTimeout(() => {
      close();
      form.reset();
      if (budgetRange) budgetRange.value = "150";
      if (deadlineRange) deadlineRange.value = "30";
      setService(serviceNames[0] || "Другое");
      closeServiceDropdown();
      updateRanges();
      form.hidden = false;
      success.hidden = true;
    }, 1400);
  });

  budgetRange?.addEventListener("input", updateRanges);
  deadlineRange?.addEventListener("input", updateRanges);

  setService(serviceNames[0] || "Другое");
  updateRanges();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBriefModal);
} else {
  initBriefModal();
}
