const initStudioContacts = () => {
  const cfg = window.STUDIO_CONFIG || {};
  const contacts = cfg.contacts || {};

  const encode = value => encodeURIComponent(String(value || "").trim());

  const ATTACHMENTS_ENABLED = true;
  const MAX_ATTACHMENTS = Number(cfg.crm?.maxAttachments || 8);
  const MAX_ATTACHMENT_BYTES = Number(cfg.crm?.maxAttachmentBytes || 20 * 1024 * 1024);

  const formatPayload = payload => {
    const lines = [
      `Новая заявка с сайта «Согласовано»`,
      "",
      payload.source ? `Источник: ${payload.source}` : "",
      payload.service ? `Услуга: ${payload.service}` : "",
      payload.name ? `Имя: ${payload.name}` : "",
      payload.phone ? `Телефон: ${payload.phone}` : "",
      payload.contact ? `Контакт: ${payload.contact}` : "",
      payload.budget ? `Бюджет: ${payload.budget}` : "",
      payload.deadline ? `Срок: ${payload.deadline}` : "",
      payload.comment ? `Комментарий: ${payload.comment}` : ""
    ].filter(Boolean);

    return lines.join("\n");
  };

  const buildTelegramUrl = message => {
    const handle = String(contacts.telegramHandle || "").replace(/^@/, "").trim();
    if (!handle) return "";
    return `https://t.me/${handle}?text=${encode(message)}`;
  };

  const buildMailtoUrl = message => {
    const email = String(contacts.email || "").trim();
    if (!email) return "";
    const subject = encode("Новая заявка с сайта Согласовано");
    return `mailto:${email}?subject=${subject}&body=${encode(message)}`;
  };

  const openLeadChannel = payload => {
    const message = formatPayload(payload);
    const channelType = cfg.leadChannel?.type || "telegram";
    const url = channelType === "telegram" ? buildTelegramUrl(message) : buildMailtoUrl(message);
    const fallbackUrl = channelType === "telegram" ? buildMailtoUrl(message) : buildTelegramUrl(message);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(message).catch(() => {});
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }

    if (fallbackUrl) {
      window.location.href = fallbackUrl;
      return true;
    }

    return false;
  };

  const buildLeadBody = payload => {
    const fields = payload || {};
    return {
      name: String(fields.name || "").trim(),
      phone: String(fields.phone || "").trim(),
      contact: String(fields.contact || "").trim(),
      service: String(fields.service || "").trim(),
      source: String(fields.source || "").trim(),
      budget: String(fields.budget || "").trim(),
      deadline: String(fields.deadline || "").trim(),
      comment: String(fields.comment || "").trim(),
      page: window.location.href.slice(0, 500),
      referer: String(document.referrer || "").slice(0, 500),
      submittedAt: new Date().toISOString(),
      privacy: true,
      // Honeypot fields — must remain empty.
      website: "",
      company_url: "",
      turnstileToken: String(fields.turnstileToken || window.STUDIO_CONFIG?.turnstileToken || "").trim()
    };
  };

  const normalizeAttachments = payload => {
    if (!ATTACHMENTS_ENABLED) return [];
    const raw = Array.isArray(payload?.attachments) ? payload.attachments : [];
    const files = [];
    for (const item of raw) {
      const file = item?.file instanceof File ? item.file : item instanceof File ? item : null;
      if (!file) continue;
      if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) {
        const error = new Error(`Файл «${file.name}» слишком большой (лимит 20 МБ).`);
        error.code = "ATTACHMENT_REJECTED";
        throw error;
      }
      files.push({
        kind: String(item?.kind || "file"),
        file
      });
    }
    if (files.length > MAX_ATTACHMENTS) {
      const error = new Error(`Можно прикрепить не больше ${MAX_ATTACHMENTS} файлов.`);
      error.code = "ATTACHMENT_REJECTED";
      throw error;
    }
    return files;
  };

  const submitToCrm = async payload => {
    const endpoint = String(cfg.crm?.endpoint || "").trim();
    if (!endpoint) {
      return { ok: false, mode: "crm-unconfigured", code: "DELIVERY_FAILED" };
    }

    const body = buildLeadBody(payload);
    const attachments = normalizeAttachments(payload);
    const hasFiles = attachments.length > 0;

    const controller = new AbortController();
    const timeoutMs = Number(
      hasFiles ? cfg.crm?.uploadTimeoutMs || 90000 : cfg.crm?.timeoutMs || 15000
    );
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response;
      if (hasFiles) {
        const form = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          form.append(key, value === true ? "true" : value === false ? "false" : String(value ?? ""));
        });
        attachments.forEach(item => {
          form.append("attachments[]", item.file, item.file.name);
        });
        response = await fetch(endpoint, {
          method: "POST",
          body: form,
          signal: controller.signal
        });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const code = String(data?.code || "DELIVERY_FAILED");
        const error = new Error(data?.error || `CRM request failed with ${response.status}`);
        error.code = code;
        error.requestId = data?.requestId || "";
        throw error;
      }

      return {
        ok: true,
        confirmed: true,
        mode: data?.mode === "telegram" ? "telegram" : "crm",
        requestId: data?.requestId || "",
        data
      };
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const notifyLeadSent = (source, detail = {}) => {
    window.dispatchEvent(
      new CustomEvent("studio:lead-sent", {
        detail: { source: String(source || "").trim(), ...detail }
      })
    );
  };

  const notifyLeadFallback = source => {
    window.dispatchEvent(
      new CustomEvent("studio:lead-fallback", {
        detail: { source: String(source || "").trim() }
      })
    );
  };

  const notifyLeadError = (source, detail = {}) => {
    window.dispatchEvent(
      new CustomEvent("studio:lead-error", {
        detail: { source: String(source || "").trim(), ...detail }
      })
    );
  };

  const submitLead = async payload => {
    const safePayload = { ...payload };
    if (!ATTACHMENTS_ENABLED) delete safePayload.attachments;

    try {
      const backendResult = await submitToCrm(safePayload);
      if (backendResult.ok && backendResult.confirmed) {
        notifyLeadSent(safePayload?.source, { mode: backendResult.mode, requestId: backendResult.requestId });
        return backendResult;
      }
    } catch (error) {
      if (error?.code === "ATTACHMENT_REJECTED") {
        const failed = {
          ok: false,
          confirmed: false,
          mode: "attachment-error",
          code: "ATTACHMENT_REJECTED",
          requestId: error?.requestId || "",
          error: error.message || "Вложение отклонено."
        };
        notifyLeadError(safePayload?.source, failed);
        return failed;
      }

      if (!cfg.crm?.allowFallback) {
        const failed = {
          ok: false,
          confirmed: false,
          mode: "backend-error",
          code: error?.code || "DELIVERY_FAILED",
          requestId: error?.requestId || "",
          error: "Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram."
        };
        notifyLeadError(safePayload?.source, failed);
        return failed;
      }
    }

    // Do not auto-open Telegram: opening a composer is not delivery.
    // UI offers «Открыть Telegram» / «Скопировать заявку» instead.
    if (cfg.crm?.allowFallback) {
      notifyLeadFallback(safePayload?.source);
      return {
        ok: false,
        confirmed: false,
        mode: "fallback-opened",
        code: "DELIVERY_FAILED",
        error:
          "Сервер временно недоступен. Скопируйте заявку или откройте Telegram и отправьте сообщение вручную — только после этого обращение будет доставлено."
      };
    }

    const failed = {
      ok: false,
      confirmed: false,
      mode: "fallback-error",
      code: "DELIVERY_FAILED",
      error: "Не удалось отправить заявку. Напишите нам в Telegram: @sigidingo"
    };
    notifyLeadError(safePayload?.source, failed);
    return failed;
  };

  const ensureHoneypot = form => {
    if (form.querySelector('input[name="website"]')) return;
    const wrap = document.createElement("div");
    wrap.setAttribute("aria-hidden", "true");
    wrap.style.cssText =
      "position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;";
    wrap.innerHTML =
      '<label>Website<input type="text" name="website" tabindex="-1" autocomplete="off" /></label>' +
      '<label>Company URL<input type="text" name="company_url" tabindex="-1" autocomplete="off" /></label>';
    form.appendChild(wrap);
  };

  const ensureFormStatus = form => {
    ensureHoneypot(form);
    let status = form.querySelector("[data-form-status]");
    if (status) {
      if (status.tagName === "P") {
        const replacement = document.createElement("div");
        replacement.className = status.className || "form-status";
        replacement.hidden = status.hidden;
        replacement.setAttribute("data-form-status", "");
        replacement.setAttribute("role", "status");
        replacement.setAttribute("aria-live", "polite");
        status.replaceWith(replacement);
        status = replacement;
      }
      return status;
    }
    status = document.createElement("div");
    status.className = "form-status";
    status.hidden = true;
    status.setAttribute("data-form-status", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton?.parentElement) {
      submitButton.parentElement.insertAdjacentElement("afterend", status);
    } else {
      form.appendChild(status);
    }
    return status;
  };

  const setFormStatus = (form, message, tone = "", options = {}) => {
    const status = ensureFormStatus(form);
    status.classList.remove("is-error", "is-success");
    status.replaceChildren();

    if (!message) {
      status.hidden = true;
      return status;
    }

    status.hidden = false;
    status.classList.toggle("is-error", tone === "error");
    status.classList.toggle("is-success", tone === "success");

    const messageNode = document.createElement("p");
    messageNode.className = "form-status__message";
    messageNode.textContent = message;
    status.appendChild(messageNode);

    if (options.requestId) {
      const meta = document.createElement("p");
      meta.className = "form-status__meta";
      meta.textContent = `Код обращения: ${options.requestId}`;
      status.appendChild(meta);
    }

    const actions = Array.isArray(options.actions) ? options.actions.filter(Boolean) : [];
    if (actions.length) {
      const row = document.createElement("div");
      row.className = "form-status__actions";
      actions.forEach(action => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "form-status__action";
        button.textContent = action.label;
        button.addEventListener("click", event => {
          event.preventDefault();
          action.onClick?.(event);
        });
        row.appendChild(button);
      });
      status.appendChild(row);
    }

    return status;
  };

  const isHttpUrl = value => /^https?:\/\//i.test(String(value || "").trim());
  const isRealMaxUrl = value => {
    const url = String(value || "").trim();
    if (!isHttpUrl(url)) return false;
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return host === "max.ru" || host.endsWith(".max.ru");
    } catch {
      return false;
    }
  };

  const decorateExternalLink = node => {
    if (!(node instanceof HTMLAnchorElement)) return;
    const href = node.getAttribute("href") || "";
    if (!isHttpUrl(href)) {
      node.removeAttribute("target");
      return;
    }
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  };

  const bindContactLink = (selector, value, { hideIfEmpty = false } = {}) => {
    document.querySelectorAll(selector).forEach(node => {
      if (!value) {
        if (hideIfEmpty) node.hidden = true;
        return;
      }
      node.hidden = false;
      node.setAttribute("href", value);
      decorateExternalLink(node);
    });
  };

  const bindText = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach(node => {
      node.textContent = value;
    });
  };

  const fallbackCopyText = value => {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    field.style.pointerEvents = "none";
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, field.value.length);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    field.remove();
    return copied;
  };

  const copyText = async value => {
    if (!value) return false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {}
    }
    return fallbackCopyText(value);
  };

  const maxUrl = String(contacts.maxUrl || "").trim();
  const vkUrl = String(contacts.vkUrl || "").trim();
  const telegramUrl = String(contacts.telegramUrl || "").trim();
  const phoneHref = String(contacts.phoneHref || "").trim();

  bindContactLink('[data-contact-link="telegram"]', telegramUrl);
  bindContactLink('[data-contact-link="phone"]', phoneHref);
  bindContactLink('[data-contact-link="email"]', contacts.emailHref);
  bindContactLink('[data-contact-link="vk"]', vkUrl, { hideIfEmpty: true });

  document.querySelectorAll('[data-contact-link="phone"]').forEach(node => {
    if (!(node instanceof HTMLAnchorElement)) return;
    node.removeAttribute("target");
    node.removeAttribute("rel");
    if (phoneHref) {
      node.setAttribute(
        "aria-label",
        `Позвонить: ${contacts.phoneDisplay || phoneHref.replace(/^tel:/, "")}`
      );
    }
  });

  document.querySelectorAll('[data-contact-link="max"]').forEach(node => {
    if (!isRealMaxUrl(maxUrl)) {
      node.hidden = true;
      node.setAttribute("href", "#");
      node.removeAttribute("target");
      node.removeAttribute("rel");
      return;
    }

    node.hidden = false;
    node.setAttribute("href", maxUrl);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
    node.setAttribute("aria-label", "MAX");
    node.setAttribute("title", "MAX");
    node.classList.remove("is-telegram-fallback");
  });

  document.querySelectorAll('[data-contact-link="vk"]').forEach(node => {
    if (!vkUrl) {
      node.hidden = true;
      return;
    }
    node.hidden = false;
    node.setAttribute("aria-label", "VK");
    node.setAttribute("title", "VK");
    decorateExternalLink(node);
  });

  document.querySelectorAll('[data-contact-link="telegram"]').forEach(decorateExternalLink);

  bindText("[data-contact-phone]", contacts.phoneDisplay);
  bindText("[data-contact-email]", contacts.email);
  bindText("[data-contact-name]", contacts.name);
  bindText("[data-contact-handle]", `@${String(contacts.telegramHandle || "").replace(/^@/, "")}`);

  document.querySelectorAll("[data-copy-phone], [data-copy-phone-chip]").forEach(node => {
    let resetTimer = 0;
    node.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      const value = String(contacts.phoneDisplay || contacts.phone || "").trim();
      const copied = await copyText(value);
      node.classList.toggle("is-copied", copied);
      if (copied) {
        const previousLabel = node.getAttribute("aria-label") || "";
        node.setAttribute("aria-label", "Номер скопирован");
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          node.classList.remove("is-copied");
          if (previousLabel) node.setAttribute("aria-label", previousLabel);
        }, 1400);
      }
    });
  });

  const showLeadRecovery = (form, result, payload, { onRetry } = {}) => {
    const messageText = formatPayload(payload || {});
    const telegramUrlForLead = buildTelegramUrl(messageText);
    setFormStatus(form, result?.error || "Не удалось отправить заявку.", "error", {
      requestId: result?.requestId || "",
      actions: [
        onRetry
          ? {
              label: "Повторить",
              onClick: () => onRetry()
            }
          : null,
        {
          label: "Скопировать заявку",
          onClick: async () => {
            const copied = await copyText(messageText);
            if (copied) {
              setFormStatus(form, "Текст заявки скопирован. Можно вставить в Telegram.", "error", {
                requestId: result?.requestId || "",
                actions: [
                  onRetry ? { label: "Повторить", onClick: () => onRetry() } : null,
                  telegramUrlForLead
                    ? {
                        label: "Открыть Telegram",
                        onClick: () => window.open(telegramUrlForLead, "_blank", "noopener,noreferrer")
                      }
                    : null
                ].filter(Boolean)
              });
            }
          }
        },
        telegramUrlForLead
          ? {
              label: "Открыть Telegram",
              onClick: () => window.open(telegramUrlForLead, "_blank", "noopener,noreferrer")
            }
          : null
      ]
    });
  };

  // Prepare honeypot + status hosts on every known lead form.
  document
    .querySelectorAll(
      ".studio-discuss__form, .hero-request__form, #briefForm, #heroFinalForm, form[data-lead-form]"
    )
    .forEach(form => {
      if (form instanceof HTMLFormElement) ensureFormStatus(form);
    });

  window.STUDIO_CONTACT = {
    buildLeadUrl: payload => {
      const message = formatPayload(payload);
      const channelType = cfg.leadChannel?.type || "telegram";
      return channelType === "telegram" ? buildTelegramUrl(message) : buildMailtoUrl(message);
    },
    openLeadChannel,
    submitLead,
    formatPayload,
    setFormStatus,
    showLeadRecovery,
    ensureHoneypot
  };

  document.addEventListener("submit", async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (
      !form.matches(".studio-discuss__form") &&
      !form.matches(".hero-request__form")
    ) {
      return;
    }

    event.preventDefault();
    setFormStatus(form, "");
    form.querySelectorAll("[aria-invalid='true']").forEach(field => {
      window.STUDIO_A11Y?.clearFieldError?.(field);
    });

    const privacy = form.querySelector('input[name="privacy"]');
    if (privacy instanceof HTMLInputElement && !privacy.checked) {
      window.STUDIO_A11Y?.setFieldError?.(
        privacy,
        "Отметьте согласие с политикой конфиденциальности."
      );
      privacy.focus();
      setFormStatus(form, "Отметьте согласие с политикой конфиденциальности.", "error");
      return;
    }

    const nameField = form.querySelector('input[name="name"]');
    const name = nameField?.value.trim() || "";
    const phone = form.querySelector('input[name="phone"]')?.value.trim() || "";
    const contact = form.querySelector('input[name="contact"]')?.value.trim() || "";

    if (!name) {
      window.STUDIO_A11Y?.setFieldError?.(nameField, "Укажите имя.");
      nameField?.focus();
      setFormStatus(form, "Укажите имя.", "error");
      return;
    }

    if (!phone && !contact) {
      const fallbackField = form.querySelector('input[name="contact"]') || form.querySelector('input[name="phone"]');
      window.STUDIO_A11Y?.setFieldError?.(fallbackField, "Укажите телефон или мессенджер.");
      fallbackField?.focus();
      setFormStatus(form, "Укажите телефон или мессенджер.", "error");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const previousLabel =
      submitButton instanceof HTMLButtonElement
        ? submitButton.textContent
        : submitButton instanceof HTMLInputElement
          ? submitButton.value
          : "";

    const payload = {
      source: form.dataset.caseTitle
        ? "Кейс"
        : form.matches(".hero-request__form")
          ? "Подвал «Оставить заявку»"
          : "Блок «Обсудить проект»",
      name,
      phone,
      contact,
      comment: form.dataset.caseTitle || ""
    };

    const restoreButton = () => {
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = previousLabel || "Отправить";
      if (submitButton instanceof HTMLInputElement) submitButton.value = previousLabel || "Отправить";
      if (submitButton) submitButton.disabled = false;
    };

    const send = async () => {
      if (submitButton) submitButton.disabled = true;
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Отправляем…";
      if (submitButton instanceof HTMLInputElement) submitButton.value = "Отправляем…";

      const result = await submitLead(payload);

      if (result.confirmed && result.ok) {
        form.reset();
        const privacyReset = form.querySelector('input[name="privacy"]');
        if (privacyReset instanceof HTMLInputElement) privacyReset.checked = true;
        setFormStatus(
          form,
          "Заявка отправлена. Мы изучим задачу и свяжемся с вами.",
          "success"
        );
        if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Отправлено";
        if (submitButton instanceof HTMLInputElement) submitButton.value = "Отправлено";
        window.setTimeout(() => {
          restoreButton();
          setFormStatus(form, "");
        }, 2200);
        return;
      }

      // Keep form data; offer retry / copy / Telegram.
      restoreButton();
      showLeadRecovery(form, result, payload, { onRetry: send });
    };

    await send();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioContacts);
} else {
  initStudioContacts();
}
