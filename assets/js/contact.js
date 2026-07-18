const initStudioContacts = () => {
  const cfg = window.STUDIO_CONFIG || {};
  const contacts = cfg.contacts || {};

  const encode = value => encodeURIComponent(String(value || "").trim());

  // Temporary production policy (AUDIT A01): attachment UI is disabled until
  // multipart + Telegram sendPhoto/sendDocument is shipped. Do not base64 files.
  const ATTACHMENTS_ENABLED = false;

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

  const submitToCrm = async payload => {
    const endpoint = String(cfg.crm?.endpoint || "").trim();
    if (!endpoint) {
      return { ok: false, mode: "crm-unconfigured", code: "DELIVERY_FAILED" };
    }

    const controller = new AbortController();
    const timeoutMs = Number(cfg.crm?.timeoutMs || 12000);
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildLeadBody(payload)),
        signal: controller.signal
      });

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
    // Drop attachments until secure multipart delivery is live.
    const safePayload = { ...payload };
    if (!ATTACHMENTS_ENABLED) delete safePayload.attachments;

    try {
      const backendResult = await submitToCrm(safePayload);
      if (backendResult.ok && backendResult.confirmed) {
        notifyLeadSent(safePayload?.source, { mode: backendResult.mode, requestId: backendResult.requestId });
        return backendResult;
      }
    } catch (error) {
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

    const opened = openLeadChannel(safePayload);
    if (opened) {
      // Opening Telegram/email is NOT a confirmed delivery.
      notifyLeadFallback(safePayload?.source);
      return {
        ok: false,
        confirmed: false,
        mode: "fallback-opened",
        code: "DELIVERY_FAILED",
        error:
          "Сервер временно недоступен. Мы подготовили текст заявки и открыли Telegram — отправьте сообщение вручную, чтобы завершить обращение."
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
    if (status) return status;
    status = document.createElement("p");
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

  const setFormStatus = (form, message, tone = "") => {
    const status = ensureFormStatus(form);
    if (!message) {
      status.hidden = true;
      status.textContent = "";
      status.classList.remove("is-error", "is-success");
      return;
    }
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle("is-error", tone === "error");
    status.classList.toggle("is-success", tone === "success");
  };

  const bindContactLink = (selector, value, { hideIfEmpty = false } = {}) => {
    document.querySelectorAll(selector).forEach(node => {
      if (!value) {
        if (hideIfEmpty) node.hidden = true;
        return;
      }
      node.hidden = false;
      node.setAttribute("href", value);
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

  bindContactLink('[data-contact-link="telegram"]', telegramUrl);
  bindContactLink('[data-contact-link="phone"]', contacts.phoneHref);
  bindContactLink('[data-contact-link="email"]', contacts.emailHref);
  bindContactLink('[data-contact-link="vk"]', vkUrl || telegramUrl);
  bindContactLink('[data-contact-link="max"]', maxUrl || contacts.phoneHref || telegramUrl);

  const telegramIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M21.5 4.5 3.8 11.3c-1.2.47-1.18 1.28-.22 1.61l4.55 1.42 1.74 5.4c.23.72.12 1 .93.1l2.64-2.9 4.84 3.58c.89.49 1.53.23 1.76-.84l3.2-15.07c.33-1.48-.5-2.14-1.74-1.1Z" fill="currentColor"/>
    </svg>
  `;

  document.querySelectorAll('[data-contact-link="max"]').forEach(node => {
    const iconHost = node.querySelector("[data-max-icon]");
    const href = maxUrl || contacts.phoneHref || telegramUrl;
    if (href?.startsWith("tel:")) {
      node.removeAttribute("target");
      node.removeAttribute("rel");
      node.setAttribute("aria-label", "MAX");
      node.setAttribute("title", `MAX: ${contacts.phoneDisplay || href.replace(/^tel:/, "")}`);
      node.classList.remove("is-telegram-fallback");
      if (iconHost && !iconHost.querySelector("[data-max-icon-img]")) {
        iconHost.innerHTML = `<img src="./assets/icons/custom/max-logo-white.svg" alt="" data-max-icon-img />`;
      }
    } else if (maxUrl) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noreferrer");
      node.setAttribute("aria-label", "MAX");
      node.setAttribute("title", "MAX");
      node.classList.remove("is-telegram-fallback");
      if (iconHost && !iconHost.querySelector("[data-max-icon-img]")) {
        iconHost.innerHTML = `<img src="./assets/icons/custom/max-logo-white.svg" alt="" data-max-icon-img />`;
      }
    } else if (telegramUrl) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noreferrer");
      node.setAttribute("aria-label", "Telegram");
      node.setAttribute("title", "Telegram");
      node.classList.add("is-telegram-fallback");
      if (iconHost) iconHost.innerHTML = telegramIconSvg;
    }
  });

  document.querySelectorAll('[data-contact-link="vk"]').forEach(node => {
    if (!vkUrl && telegramUrl) {
      node.setAttribute("aria-label", "Telegram");
      node.setAttribute("title", "Telegram");
    }
  });

  bindText("[data-contact-phone]", contacts.phoneDisplay);
  bindText("[data-contact-email]", contacts.email);
  bindText("[data-contact-name]", contacts.name);
  bindText("[data-contact-handle]", `@${String(contacts.telegramHandle || "").replace(/^@/, "")}`);

  document.querySelectorAll("[data-copy-phone-chip]").forEach(node => {
    let resetTimer = 0;
    node.addEventListener("click", async event => {
      event.preventDefault();
      const value = String(contacts.phoneDisplay || contacts.phone || node.textContent || "").trim();
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

    const privacy = form.querySelector('input[name="privacy"]');
    if (privacy instanceof HTMLInputElement && !privacy.checked) {
      privacy.focus();
      setFormStatus(form, "Отметьте согласие с политикой конфиденциальности.", "error");
      return;
    }

    const name = form.querySelector('input[name="name"]')?.value.trim() || "";
    const phone = form.querySelector('input[name="phone"]')?.value.trim() || "";
    const contact = form.querySelector('input[name="contact"]')?.value.trim() || "";

    if (!name) {
      form.querySelector('input[name="name"]')?.focus();
      setFormStatus(form, "Укажите имя.", "error");
      return;
    }

    if (!phone && !contact) {
      const fallbackField = form.querySelector('input[name="contact"]') || form.querySelector('input[name="phone"]');
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

    if (submitButton) submitButton.disabled = true;
    if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Отправляем…";
    if (submitButton instanceof HTMLInputElement) submitButton.value = "Отправляем…";

    const result = await submitLead({
      source: form.dataset.caseTitle
        ? "Кейс"
        : form.matches(".hero-request__form")
          ? "Подвал «Оставить заявку»"
          : "Блок «Обсудить проект»",
      name,
      phone,
      contact,
      comment: form.dataset.caseTitle || ""
    });

    const restoreButton = () => {
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = previousLabel || "Отправить";
      if (submitButton instanceof HTMLInputElement) submitButton.value = previousLabel || "Отправить";
      if (submitButton) submitButton.disabled = false;
    };

    if (result.confirmed && result.ok) {
      form.reset();
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

    // Keep form data on any non-confirmed result.
    const requestHint = result?.requestId ? ` Код обращения: ${result.requestId}.` : "";
    setFormStatus(
      form,
      `${result?.error || "Не удалось отправить заявку."}${requestHint}`,
      "error"
    );
    restoreButton();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioContacts);
} else {
  initStudioContacts();
}
