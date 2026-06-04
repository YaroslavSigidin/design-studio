const initBriefModal = () => {
  const modal = document.getElementById("briefModal");
  const form = document.getElementById("briefForm");
  const quickServices = modal?.querySelector("[data-quick-services]");
  const serviceHidden = document.getElementById("briefServiceValue");
  const success = document.getElementById("briefSuccess");
  const budgetInput = form?.querySelector("[data-brief-budget-input]");
  const budgetLabel = form?.querySelector("[data-brief-budget-label]");
  const budgetOptions = Array.from(form?.querySelectorAll("[data-brief-budget-options] .brief-choice-option") || []);
  const deadlineInput = form?.querySelector("[data-brief-deadline-input]");
  const deadlineLabel = form?.querySelector("[data-brief-deadline-label]");
  const deadlineOptions = Array.from(form?.querySelectorAll("[data-brief-deadline-options] .brief-choice-option") || []);
  const phoneInput = form?.querySelector('input[name="phone"]');
  if (!modal || !form || !quickServices || !serviceHidden || !success) return;

  const serviceNames = [...new Set((window.SERVICES || []).map(item => item.title))];
  const serviceOptions = [...serviceNames, "Другое"];
  const defaultBudget = budgetInput?.value || "100 000–200 000 ₽";
  const defaultDeadline = deadlineInput?.value || "3–4 недели";

  let selectedServices = [];
  let isServiceDropdownOpen = false;
  let lastFocusedElement = null;

  const lockScroll = locked => {
    document.body.style.overflow = locked ? "hidden" : "";
  };

  const getServiceCountLabel = count => {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} услуга`;
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return `${count} услуги`;
    return `${count} услуг`;
  };

  const syncServiceHidden = () => {
    serviceHidden.value = selectedServices.join(", ");
  };

  const closeServiceDropdown = () => {
    isServiceDropdownOpen = false;
    quickServices.classList.remove("is-dropdown-open");
  };

  const renderServicePicker = () => {
    const summaryText = selectedServices.length ? selectedServices.join(", ") : "Выберите одну или несколько услуг";
    const badgeMarkup =
      selectedServices.length > 1
        ? `<span class="brief-service-badge">${getServiceCountLabel(selectedServices.length)}</span>`
        : "";

    const optionsMarkup = serviceOptions
      .map(item => {
        const isActive = selectedServices.includes(item);
        return `<button type="button" class="brief-service-chip${isActive ? " is-active" : ""}" data-value="${item}" data-toggle-service>${item}</button>`;
      })
      .join("");

    quickServices.innerHTML = `
      <button type="button" class="brief-service-trigger" aria-expanded="${isServiceDropdownOpen ? "true" : "false"}" data-toggle-service-dropdown>
        <span class="brief-service-summary">
          ${badgeMarkup}
          <span class="brief-service-summary-text">${summaryText}</span>
        </span>
        <svg class="brief-service-caret" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="brief-service-dropdown">
        <div class="brief-service-options">${optionsMarkup}</div>
        <button type="button" class="brief-service-option-done" data-close-service-dropdown>Готово</button>
      </div>
    `;

    quickServices.classList.toggle("is-dropdown-open", isServiceDropdownOpen);
    syncServiceHidden();
  };

  const setServices = values => {
    const normalized = [...new Set((values || []).map(item => String(item || "").trim()).filter(Boolean))];
    selectedServices = normalized;
    renderServicePicker();
  };

  const addService = value => {
    if (!value || selectedServices.includes(value)) return;
    selectedServices = [...selectedServices, value];
    renderServicePicker();
  };

  const removeService = value => {
    if (!value || selectedServices.length <= 1) return;
    selectedServices = selectedServices.filter(item => item !== value);
    renderServicePicker();
  };

  const toggleService = value => {
    if (!value) return;
    if (selectedServices.includes(value)) {
      removeService(value);
      return;
    }
    addService(value);
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

  const setChoice = (options, input, label, value) => {
    if (!input || !label) return;
    const nextValue = String(value || "").trim();
    input.value = nextValue;
    label.textContent = nextValue;
    options.forEach(option => {
      option.classList.toggle("is-active", option.dataset.value === nextValue);
    });
  };

  const open = presetService => {
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lockScroll(true);

    const preset = presetService?.trim() || "";
    const initialService = preset || serviceNames[0] || "Другое";
    setServices([initialService]);
    closeServiceDropdown();
    success.hidden = true;
    form.hidden = false;
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

    if (event.target.closest("[data-close-service-dropdown]")) {
      closeServiceDropdown();
      return;
    }

    const option = event.target.closest("[data-toggle-service]");
    if (option) {
      toggleService(option.dataset.value || "");
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
    if (!serviceHidden.value) setServices([serviceNames[0] || "Другое"]);

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
      budget: budgetInput?.value || "",
      deadline: deadlineInput?.value || "",
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
      setChoice(budgetOptions, budgetInput, budgetLabel, defaultBudget);
      setChoice(deadlineOptions, deadlineInput, deadlineLabel, defaultDeadline);
      setServices([serviceNames[0] || "Другое"]);
      closeServiceDropdown();
      form.hidden = false;
      success.hidden = true;
    }, 1400);
  });

  budgetOptions.forEach(option => {
    option.addEventListener("click", () => {
      setChoice(budgetOptions, budgetInput, budgetLabel, option.dataset.value || "");
    });
  });

  deadlineOptions.forEach(option => {
    option.addEventListener("click", () => {
      setChoice(deadlineOptions, deadlineInput, deadlineLabel, option.dataset.value || "");
    });
  });

  setChoice(budgetOptions, budgetInput, budgetLabel, defaultBudget);
  setChoice(deadlineOptions, deadlineInput, deadlineLabel, defaultDeadline);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBriefModal);
} else {
  initBriefModal();
}
