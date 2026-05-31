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

  bindContactLink('[data-contact-link="telegram"]', contacts.telegramUrl);
  bindContactLink('[data-contact-link="phone"]', contacts.phoneHref);
  bindContactLink('[data-contact-link="email"]', contacts.emailHref);
  bindContactLink('[data-contact-link="direct"]', contacts.telegramUrl || contacts.emailHref || contacts.phoneHref);

  bindText("[data-contact-phone]", contacts.phoneDisplay);
  bindText("[data-contact-email]", contacts.email);
  bindText("[data-contact-name]", contacts.name);
  bindText("[data-contact-handle]", `@${String(contacts.telegramHandle || "").replace(/^@/, "")}`);

  window.STUDIO_CONTACT = {
    buildLeadUrl: payload => {
      const message = formatPayload(payload);
      const channelType = cfg.leadChannel?.type || "telegram";
      return channelType === "telegram" ? buildTelegramUrl(message) : buildMailtoUrl(message);
    },
    openLeadChannel,
    formatPayload
  };

  document.addEventListener("submit", event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (
      !form.matches(".studio-discuss__form") &&
      !form.matches(".case-lead-form__form")
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

    openLeadChannel({
      source: form.matches(".case-lead-form__form") ? "Кейс" : "Блок «Обсудить проект»",
      name,
      phone,
      contact,
      comment: form.dataset.caseTitle || ""
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioContacts);
} else {
  initStudioContacts();
}
