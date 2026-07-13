const initHeroSearch = () => {
  const editor = document.querySelector("[data-hero-search-editor]");
  const submitButton = document.querySelector("[data-hero-submit]");
  const budgetRange = document.querySelector("[data-hero-budget-range]");
  const budgetLabel = document.querySelector("[data-hero-budget-label]");
  const deadlineRange = document.querySelector("[data-hero-deadline-range]");
  const deadlineLabel = document.querySelector("[data-hero-deadline-label]");

  const finalModal = document.getElementById("heroFinalModal");
  const finalForm = document.getElementById("heroFinalForm");
  const finalCommentField = finalForm?.querySelector('textarea[name="comment"]');
  const finalNameField = finalForm?.querySelector('input[name="name"]');
  const finalPhoneField = finalForm?.querySelector('input[name="phone"]');
  const finalContactField = finalForm?.querySelector('input[name="contact"]');
  const finalSubmitButton = finalForm?.querySelector(".hero-final-submit");

  if (!editor || !submitButton) return;

  const createFlightPlane = () => {
    const rect = submitButton.getBoundingClientRect();
    const launch = document.createElement("span");
    launch.className = "hero-send-launch";
    launch.style.left = `${rect.left + rect.width / 2}px`;
    launch.style.top = `${rect.top + rect.height / 2}px`;
    launch.innerHTML = `
      <span class="hero-send-glow" aria-hidden="true"></span>
      <span class="hero-send-burst" aria-hidden="true"></span>
      <span class="hero-send-ring" aria-hidden="true"></span>
    `;

    document.body.appendChild(launch);
    window.setTimeout(() => launch.remove(), 1650);
  };

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

  const update = () => {
    if (budgetRange && budgetLabel) {
      budgetLabel.textContent = formatMoney(Number(budgetRange.value));
      setRangeProgress(budgetRange);
    }
    if (deadlineRange && deadlineLabel) {
      deadlineLabel.textContent = formatDeadline(Number(deadlineRange.value));
      setRangeProgress(deadlineRange);
    }
  };

  const resetHeroForm = () => {
    editor.value = "";
    if (budgetRange) budgetRange.value = "150";
    if (deadlineRange) deadlineRange.value = "30";
    update();
  };

  const closeFinalModal = () => {
    if (!finalModal) return;
    finalModal.classList.remove("is-open");
    finalModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openFinalModal = comment => {
    if (!finalModal || !finalCommentField) return;
    finalCommentField.value = comment;
    finalModal.classList.add("is-open");
    finalModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => finalNameField?.focus(), 20);
  };

  const handleSend = () => {
    const text = editor.value.trim();
    if (!text) {
      submitButton.classList.add("is-invalid");
      window.setTimeout(() => submitButton.classList.remove("is-invalid"), 360);
      editor.focus();
      return;
    }

    submitButton.classList.add("is-sending");
    createFlightPlane();

    window.setTimeout(() => {
      submitButton.classList.remove("is-sending");
      openFinalModal(text);
    }, 980);
  };

  const handleFinalSubmit = async event => {
    event.preventDefault();
    if (!finalForm) return;

    if (!finalNameField?.value.trim()) {
      finalNameField?.focus();
      return;
    }
    if (!finalPhoneField?.value.trim() && !finalContactField?.value.trim()) {
      (finalContactField || finalPhoneField)?.focus();
      return;
    }

    const result = await window.STUDIO_CONTACT?.submitLead({
      source: "AI-бриф",
      name: finalNameField.value.trim(),
      phone: finalPhoneField?.value.trim() || "",
      contact: finalContactField?.value.trim() || "",
      budget: budgetLabel?.textContent || "",
      deadline: deadlineLabel?.textContent || "",
      comment: finalCommentField?.value.trim() || ""
    });

    if (finalSubmitButton) {
      finalSubmitButton.textContent =
        result?.ok && (result.mode === "crm" || result.mode === "telegram")
          ? "Отправлено"
          : "Ошибка отправки";
      finalSubmitButton.disabled = true;
    }

    window.setTimeout(() => {
      if (finalSubmitButton) {
        finalSubmitButton.textContent = "Отправить";
        finalSubmitButton.disabled = false;
      }
      if (result?.ok) {
        finalForm.reset();
        closeFinalModal();
        resetHeroForm();
      }
    }, result?.ok ? 1200 : 1800);
  };

  editor.addEventListener("input", update);
  budgetRange?.addEventListener("input", update);
  deadlineRange?.addEventListener("input", update);

  submitButton.addEventListener("click", handleSend);
  finalForm?.addEventListener("submit", handleFinalSubmit);

  finalModal?.addEventListener("click", event => {
    if (event.target.closest("[data-close-hero-final]")) {
      closeFinalModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && finalModal?.classList.contains("is-open")) {
      closeFinalModal();
    }
  });

  window.addEventListener("beforeunload", () => {
    document.body.style.overflow = "";
  });

  update();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroSearch);
} else {
  initHeroSearch();
}
