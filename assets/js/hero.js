const initHeroSearch = () => {
  const finalModal = document.getElementById("heroFinalModal");
  const finalForm = document.getElementById("heroFinalForm");
  const finalCommentField = finalForm?.querySelector('textarea[name="comment"]');
  const finalNameField = finalForm?.querySelector('input[name="name"]');
  const finalPhoneField = finalForm?.querySelector('input[name="phone"]');
  const finalContactField = finalForm?.querySelector('input[name="contact"]');
  const finalSubmitButton = finalForm?.querySelector(".hero-final-submit");
  const finalAttachmentsRoot = document.querySelector("[data-hero-final-attachments]");
  const finalAttachList = document.querySelector("[data-hero-final-attach-list]");
  const mobileLite =
    Boolean(window.STUDIO_PERF?.isLite) ||
    window.matchMedia("(max-width: 1100px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  let activeComposer = null;
  let lastFinalFocus = null;
  let finalFocusTrap = null;
  const finalDialog = finalModal?.querySelector(".hero-final-modal__dialog") || finalModal;
  const a11y = () => window.STUDIO_A11Y;

  const escapeHtml = value =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const getDeclension = (value, [one, two, five]) => {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 14) return five;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return two;
    return five;
  };

  const formatMoney = value => `${new Intl.NumberFormat("ru-RU").format(Number(value) * 1000)} ₽`;

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
    const progressValue = `${Math.max(0, Math.min(progress, 100))}%`;
    input.style.setProperty("--range-progress", progressValue);
    input.closest(".hero-range-track")?.style.setProperty("--range-progress", progressValue);
    input.closest(".hero-range-control")?.style.setProperty("--range-progress", progressValue);
  };

  const closeFinalModal = () => {
    if (!finalModal) return;
    finalModal.classList.remove("is-open");
    finalModal.setAttribute("aria-hidden", "true");
    finalFocusTrap?.deactivate?.();
    a11y()?.setBackgroundInert?.(finalModal, false);
    document.body.style.overflow = "";
    if (lastFinalFocus instanceof HTMLElement) lastFinalFocus.focus();
    lastFinalFocus = null;
  };

  finalFocusTrap = a11y()?.createFocusTrap?.(finalDialog, {
    onEscape: event => {
      if (!finalModal?.classList.contains("is-open")) return;
      event.preventDefault();
      closeFinalModal();
    }
  });

  const renderAttachmentMarkup = (items, { removable = true } = {}) =>
    items
      .map(item => {
        const preview =
          item.type === "photo" && item.previewUrl
            ? `<img class="hero-attach-item__thumb" src="${item.previewUrl}" alt="" />`
            : `<span class="hero-attach-item__icon hero-attach-item__icon--${item.type}" aria-hidden="true"></span>`;

        const removeButton = removable
          ? `<button
              class="hero-attach-item__remove"
              type="button"
              aria-label="Удалить вложение"
              data-hero-attach-remove
              data-attach-type="${item.type}"
              data-attach-index="${item.index}"
            >×</button>`
          : "";

        return `
          <li class="hero-attach-item hero-attach-item--${item.type}">
            ${preview}
            <span class="hero-attach-item__label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
            ${removeButton}
          </li>`;
      })
      .join("");

  const initComposer = root => {
    const editor = root.querySelector("[data-hero-search-editor]");
    const submitButton = root.querySelector("[data-hero-submit]");
    const deadlineRange = root.querySelector("[data-hero-deadline-range]");
    const deadlineLabel = root.querySelector("[data-hero-deadline-label]");
    const budgetRange = root.querySelector("[data-hero-budget-range]");
    const budgetLabel = root.querySelector("[data-hero-budget-label]");
    const attachmentsRoot = root.querySelector("[data-hero-attachments]");
    const photoButton = attachmentsRoot?.querySelector("[data-hero-attach-photo]");
    const fileButton = attachmentsRoot?.querySelector("[data-hero-attach-file]");
    const photoInput = attachmentsRoot?.querySelector("[data-hero-attach-photo-input]");
    const fileInput = attachmentsRoot?.querySelector("[data-hero-attach-file-input]");
    const attachList = root.querySelector("[data-hero-attach-list]");
    const inputWrap = root.querySelector(".hero-search-input-wrap");
    const rangesRoot = root.querySelector("[data-hero-search-ranges]");
    const slidersRow = root.querySelector(".hero-search-sliders");

    if (!editor || !submitButton) return null;

    const attachmentState = {
      photos: [],
      files: []
    };

    const api = {
      removeAttachment: null,
      resetForm: null,
      formatAttachmentSummary: null,
      getAttachments: null,
      getBudgetLabel: null,
      getDeadlineLabel: null,
      revokePhotoPreviews: null
    };

    const createFlightPlane = () => {
      if (mobileLite) return;
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

    const revokePhotoPreviews = () => {
      attachmentState.photos.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };

    const formatAttachmentSummary = () => {
      const lines = [];

      if (attachmentState.photos.length) {
        lines.push(`Фото: ${attachmentState.photos.map(item => item.file.name).join(", ")}`);
      }
      if (attachmentState.files.length) {
        lines.push(`Файлы: ${attachmentState.files.map(item => item.file.name).join(", ")}`);
      }

      return lines.length ? `\n\nПрикрепления:\n${lines.join("\n")}` : "";
    };

    const syncComposerState = () => {
      const hasAttachments = attachmentState.photos.length + attachmentState.files.length > 0;
      inputWrap?.classList.toggle("has-attachments", hasAttachments);
    };

    const buildAttachmentItems = () => [
      ...attachmentState.photos.map((item, index) => ({
        type: "photo",
        index,
        label: item.file.name,
        previewUrl: item.previewUrl
      })),
      ...attachmentState.files.map((item, index) => ({
        type: "file",
        index,
        label: item.file.name,
        previewUrl: ""
      }))
    ];

    const renderFinalAttachmentList = () => {
      if (!finalAttachList || !finalAttachmentsRoot) return;

      const items = buildAttachmentItems();
      finalAttachmentsRoot.hidden = items.length === 0;
      finalAttachList.innerHTML = renderAttachmentMarkup(items, { removable: true });
    };

    const renderAttachmentList = () => {
      if (!attachList) return;

      const items = buildAttachmentItems();
      attachList.hidden = items.length === 0;
      attachList.innerHTML = renderAttachmentMarkup(items, { removable: true });
      syncComposerState();
      if (activeComposer === api) renderFinalAttachmentList();
    };

    const addFiles = (fileList, bucket) => {
      if (!fileList?.length) return;
      const maxFiles = Number(window.STUDIO_CONFIG?.crm?.maxAttachments || 8);
      const maxBytes = Number(window.STUDIO_CONFIG?.crm?.maxAttachmentBytes || 20 * 1024 * 1024);
      const currentCount = attachmentState.photos.length + attachmentState.files.length;
      const room = Math.max(0, maxFiles - currentCount);
      const nextItems = [];

      for (const file of Array.from(fileList)) {
        if (nextItems.length >= room) break;
        if (!file || file.size <= 0 || file.size > maxBytes) continue;
        nextItems.push({
          file,
          previewUrl: bucket === "photos" ? URL.createObjectURL(file) : ""
        });
      }

      if (!nextItems.length) return;
      attachmentState[bucket].push(...nextItems);
      renderAttachmentList();
    };

    const removeAttachment = (type, index) => {
      const bucketMap = {
        photo: "photos",
        file: "files"
      };
      const bucket = bucketMap[type];
      if (!bucket) return;

      const [removed] = attachmentState[bucket].splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      renderAttachmentList();
    };

    const resetAttachments = () => {
      revokePhotoPreviews();
      attachmentState.photos = [];
      attachmentState.files = [];
      if (photoInput) photoInput.value = "";
      if (fileInput) fileInput.value = "";
      renderAttachmentList();
    };

    const syncRangesVisibility = () => {
      const hasText = Boolean(editor.value.trim());
      if (!rangesRoot) return;

      window.clearTimeout(rangesRoot._rangesHideTimer);

      if (hasText) {
        rangesRoot.hidden = false;
        if (mobileLite) {
          // Instant reveal: animated transform + keyboard resize causes compositing blur on iOS.
          rangesRoot.classList.add("is-visible");
          slidersRow?.classList.add("has-ranges");
          return;
        }
        // Allow layout to apply before animating in.
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            rangesRoot.classList.add("is-visible");
            slidersRow?.classList.add("has-ranges");
          });
        });
        return;
      }

      rangesRoot.classList.remove("is-visible");
      slidersRow?.classList.remove("has-ranges");
      rangesRoot._rangesHideTimer = window.setTimeout(
        () => {
          if (!editor.value.trim()) rangesRoot.hidden = true;
        },
        mobileLite ? 0 : 520
      );
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
      syncRangesVisibility();
    };

    const resetForm = () => {
      editor.value = "";
      if (budgetRange) budgetRange.value = "150";
      if (deadlineRange) deadlineRange.value = "30";
      resetAttachments();
      update();
    };

    const openFinalModal = comment => {
      if (!finalModal || !finalCommentField) return;
      activeComposer = api;
      lastFinalFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      finalCommentField.value = comment;
      renderFinalAttachmentList();
      finalModal.classList.add("is-open");
      finalModal.setAttribute("aria-hidden", "false");
      a11y()?.setBackgroundInert?.(finalModal, true);
      finalFocusTrap?.activate?.();
      document.body.style.overflow = "hidden";
      window.setTimeout(() => finalNameField?.focus(), 20);
    };

    const handleSend = () => {
      const text = editor.value.trim();
      const hasAttachments = attachmentState.photos.length + attachmentState.files.length > 0;
      if (!text && !hasAttachments) {
        submitButton.classList.add("is-invalid");
        window.setTimeout(() => submitButton.classList.remove("is-invalid"), 360);
        editor.focus();
        return;
      }

      submitButton.classList.add("is-sending");
      createFlightPlane();

      window.setTimeout(
        () => {
          submitButton.classList.remove("is-sending");
          openFinalModal(text || "Заявка с вложениями");
        },
        mobileLite ? 120 : 980
      );
    };

    const getAttachments = () => [
      ...attachmentState.photos.map(item => ({ kind: "photo", file: item.file })),
      ...attachmentState.files.map(item => ({ kind: "file", file: item.file }))
    ];

    const apiMethods = {
      removeAttachment,
      resetForm,
      formatAttachmentSummary,
      getAttachments,
      getBudgetLabel: () => budgetLabel?.textContent || "",
      getDeadlineLabel: () => deadlineLabel?.textContent || "",
      revokePhotoPreviews
    };
    Object.assign(api, apiMethods);

    photoButton?.addEventListener("click", () => photoInput?.click());
    fileButton?.addEventListener("click", () => fileInput?.click());

    photoInput?.addEventListener("change", () => {
      addFiles(photoInput.files, "photos");
      photoInput.value = "";
    });

    fileInput?.addEventListener("change", () => {
      addFiles(fileInput.files, "files");
      fileInput.value = "";
    });

    attachList?.addEventListener("click", event => {
      const button = event.target.closest("[data-hero-attach-remove]");
      if (!button) return;
      removeAttachment(button.dataset.attachType, Number(button.dataset.attachIndex));
    });

    budgetRange?.addEventListener("input", update);
    deadlineRange?.addEventListener("input", update);
    editor.addEventListener("input", syncRangesVisibility);
    submitButton.addEventListener("click", handleSend);

    update();
    renderAttachmentList();
    return api;
  };

  const composers = [...document.querySelectorAll("[data-ai-brief]")]
    .map(initComposer)
    .filter(Boolean);

  if (!composers.length) return;

  finalAttachList?.addEventListener("click", event => {
    const button = event.target.closest("[data-hero-attach-remove]");
    if (!button || !activeComposer) return;
    activeComposer.removeAttachment(button.dataset.attachType, Number(button.dataset.attachIndex));
  });

  finalForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!finalForm || !activeComposer) return;

    if (!finalNameField?.value.trim()) {
      finalNameField?.focus();
      return;
    }
    if (!finalPhoneField?.value.trim() && !finalContactField?.value.trim()) {
      (finalContactField || finalPhoneField)?.focus();
      return;
    }

    const commentText = finalCommentField?.value.trim() || "";
    if (finalSubmitButton) {
      finalSubmitButton.disabled = true;
      finalSubmitButton.textContent = "Отправляем…";
    }

    const result = await window.STUDIO_CONTACT?.submitLead({
      source: "AI-бриф",
      name: finalNameField.value.trim(),
      phone: finalPhoneField?.value.trim() || "",
      contact: finalContactField?.value.trim() || "",
      budget: activeComposer.getBudgetLabel(),
      deadline: activeComposer.getDeadlineLabel(),
      comment: commentText,
      attachments: activeComposer.getAttachments?.() || []
    });

    if (result?.confirmed && result?.ok) {
      if (finalSubmitButton) {
        finalSubmitButton.textContent = "Отправлено";
        finalSubmitButton.disabled = true;
      }
      window.setTimeout(() => {
        finalForm.reset();
        const privacyReset = finalForm.querySelector('input[name="privacy"]');
        if (privacyReset instanceof HTMLInputElement) privacyReset.checked = true;
        closeFinalModal();
        activeComposer.resetForm();
        activeComposer = null;
        if (finalSubmitButton) {
          finalSubmitButton.textContent = "Отправить";
          finalSubmitButton.disabled = false;
        }
      }, 1200);
      return;
    }

    if (finalSubmitButton) {
      finalSubmitButton.textContent = "Отправить";
      finalSubmitButton.disabled = false;
    }
    const recoveryPayload = {
      source: "AI-бриф",
      name: finalNameField.value.trim(),
      phone: finalPhoneField?.value.trim() || "",
      contact: finalContactField?.value.trim() || "",
      budget: activeComposer.getBudgetLabel(),
      deadline: activeComposer.getDeadlineLabel(),
      comment: commentText
    };
    if (window.STUDIO_CONTACT?.showLeadRecovery) {
      window.STUDIO_CONTACT.showLeadRecovery(finalForm, result, recoveryPayload, {
        onRetry: () => finalForm.requestSubmit()
      });
    } else {
      window.STUDIO_CONTACT?.setFormStatus?.(
        finalForm,
        `${result?.error || "Не удалось отправить заявку."}${
          result?.requestId ? ` Код обращения: ${result.requestId}.` : ""
        }`,
        "error"
      );
    }
  });

  finalModal?.addEventListener("click", event => {
    if (event.target.closest("[data-close-hero-final]")) {
      closeFinalModal();
    }
  });

  window.addEventListener("beforeunload", () => {
    document.body.style.overflow = "";
    composers.forEach(composer => composer.revokePhotoPreviews());
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroSearch);
} else {
  initHeroSearch();
}
