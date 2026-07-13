const initStudioContacts = () => {
  const cfg = window.STUDIO_CONFIG || {};
  const contacts = cfg.contacts || {};

  const encode = value => encodeURIComponent(String(value || "").trim());

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
      window.location.href = url;
      return true;
    }

    if (fallbackUrl) {
      window.location.href = fallbackUrl;
      return true;
    }

    return false;
  };

  const submitToCrm = async payload => {
    const endpoint = String(cfg.crm?.endpoint || "").trim();
    if (!endpoint) {
      return { ok: false, mode: "crm-unconfigured" };
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
        body: JSON.stringify({
          ...payload,
          page: window.location.href,
          referer: document.referrer || "",
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString()
        }),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        throw new Error(data?.error || `CRM request failed with ${response.status}`);
      }

      return {
        ok: true,
        mode: data?.mode === "telegram" ? "telegram" : "crm",
        data
      };
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const submitLead = async payload => {
    try {
      const backendResult = await submitToCrm(payload);
      if (backendResult.ok) return backendResult;
    } catch (error) {
      if (!cfg.crm?.allowFallback) {
        return {
          ok: false,
          mode: "backend-error",
          error: error instanceof Error ? error.message : "Backend error"
        };
      }
    }

    const opened = openLeadChannel(payload);
    return opened
      ? { ok: true, mode: "fallback" }
      : { ok: false, mode: "fallback-error", error: "Не удалось открыть канал связи" };
  };

  const bindContactLink = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach(node => {
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

  bindContactLink('[data-contact-link="telegram"]', contacts.telegramUrl);
  bindContactLink('[data-contact-link="phone"]', contacts.phoneHref);
  bindContactLink('[data-contact-link="email"]', contacts.emailHref);
  bindContactLink('[data-contact-link="direct"]', contacts.telegramUrl || contacts.emailHref || contacts.phoneHref);

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

  window.STUDIO_CONTACT = {
    buildLeadUrl: payload => {
      const message = formatPayload(payload);
      const channelType = cfg.leadChannel?.type || "telegram";
      return channelType === "telegram" ? buildTelegramUrl(message) : buildMailtoUrl(message);
    },
    openLeadChannel,
    submitLead,
    formatPayload
  };

  document.addEventListener("submit", async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (
      !form.matches(".studio-discuss__form") &&
      !form.matches(".case-lead-form__form") &&
      !form.matches(".hero-request__form")
    ) {
      return;
    }

    event.preventDefault();

    const name = form.querySelector('input[name="name"]')?.value.trim() || "";
    const phone = form.querySelector('input[name="phone"]')?.value.trim() || "";
    const contact = form.querySelector('input[name="contact"]')?.value.trim() || "";

    if (!name) {
      form.querySelector('input[name="name"]')?.focus();
      return;
    }

    if (!phone && !contact) {
      const fallbackField = form.querySelector('input[name="contact"]') || form.querySelector('input[name="phone"]');
      fallbackField?.focus();
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
      source: form.matches(".case-lead-form__form")
        ? "Кейс"
        : form.matches(".hero-request__form")
          ? "Hero «Оставить заявку»"
          : "Блок «Обсудить проект»",
      name,
      phone,
      contact,
      comment: form.dataset.caseTitle || ""
    });

    if (result.ok && result.mode === "crm") {
      form.reset();
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Отправлено";
      if (submitButton instanceof HTMLInputElement) submitButton.value = "Отправлено";
      window.setTimeout(() => {
        if (submitButton instanceof HTMLButtonElement) submitButton.textContent = previousLabel || "Отправить";
        if (submitButton instanceof HTMLInputElement) submitButton.value = previousLabel || "Отправить";
        if (submitButton) submitButton.disabled = false;
      }, 1800);
      return;
    }

    if (result.ok && result.mode === "telegram") {
      form.reset();
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Отправлено";
      if (submitButton instanceof HTMLInputElement) submitButton.value = "Отправлено";
      window.setTimeout(() => {
        if (submitButton instanceof HTMLButtonElement) submitButton.textContent = previousLabel || "Отправить";
        if (submitButton instanceof HTMLInputElement) submitButton.value = previousLabel || "Отправить";
        if (submitButton) submitButton.disabled = false;
      }, 1800);
      return;
    }

    if (submitButton instanceof HTMLButtonElement) submitButton.textContent = previousLabel || "Отправить";
    if (submitButton instanceof HTMLInputElement) submitButton.value = previousLabel || "Отправить";
    if (submitButton) submitButton.disabled = false;
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioContacts);
} else {
  initStudioContacts();
}
