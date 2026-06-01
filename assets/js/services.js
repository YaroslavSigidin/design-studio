const SERVICES = [
  {
    title: "Сайт",
    badge: "Основное",
    accent: "lime",
    featured: true,
    reviews: 52,
    variants: [
      {
        label: "Одностраничный",
        serviceValue: "Сайт / Одностраничный",
        priceFrom: 80000,
        detail: "Под запуск продукта, услуги или промо",
        bullets: ["Сильный первый экран", "Конверсионная структура", "Адаптив под mobile"]
      },
      {
        label: "Многостраничный",
        serviceValue: "Сайт / Многостраничный",
        priceFrom: 150000,
        detail: "Для компании, продукта или контентного проекта",
        bullets: ["Карта разделов и логика страниц", "Единая визуальная система", "Готовность к SEO и росту"]
      }
    ]
  },
  {
    title: "WEB-платформа",
    badge: "Продукт",
    accent: "midnight",
    featured: true,
    reviews: 31,
    priceFrom: 190000,
    detail: "Сложные роли, кабинеты, сценарии и handoff",
    bullets: ["CJM и пользовательские потоки", "Роли, таблицы, дашборды", "Сопровождение до разработки"]
  },
  {
    title: "Мобильное приложение",
    badge: "App",
    accent: "sky",
    featured: true,
    reviews: 24,
    priceFrom: 220000,
    detail: "iOS / Android интерфейсы под реальные сценарии",
    bullets: ["Онбординг и core-flow", "Система экранов и состояний", "Готовность к передаче в dev"]
  },
  {
    title: "Дизайн для бренда",
    badge: "Бренд",
    accent: "sun",
    reviews: 26,
    variants: [
      {
        label: "С нуля",
        serviceValue: "Дизайн для бренда / С нуля",
        priceFrom: 90000,
        detail: "Когда нужно собрать визуальный язык с чистого листа",
        bullets: ["Стиль и базовая система", "Лого и носители", "Точка старта для сайта и презентаций"]
      },
      {
        label: "Редизайн",
        serviceValue: "Дизайн для бренда / Редизайн",
        priceFrom: 70000,
        detail: "Когда база есть, но образ нужно усилить и обновить",
        bullets: ["Освежаем визуальный код", "Упорядочиваем носители", "Делаем бренд взрослее и чище"]
      }
    ]
  },
  {
    title: "Услуги для бизнеса",
    badge: "B2B",
    accent: "business",
    reviews: 47,
    priceText: "По задаче",
    detail: "От быстрых точечных задач до пакета визуальной поддержки",
    bullets: ["Презентации", "Промо и регистрация на мероприятие", "Логотипы, дашборды и спецстраницы"],
    catalog: ["Презентация", "Event page", "Логотип", "Dashboard", "Промо-страница"],
    ctaLabel: "Собрать пакет"
  },
  {
    title: "Разбор проекта",
    badge: "Free",
    reviews: 128,
    dark: true,
    priceFrom: 0,
    detail: "Бесплатный старт, чтобы понять объём, формат и ближайший шаг",
    bullets: ["Смотрим задачу и ограничения", "Подсказываем формат работы", "Формируем адекватную оценку"],
    ctaLabel: "Получить разбор",
    alwaysVisibleCta: true
  }
];

window.SERVICES = SERVICES;
const SERVICES_VISIBLE_LIMIT = 9;

const formatRub = value => new Intl.NumberFormat("ru-RU").format(value);

const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getDefaultVariant = service => (Array.isArray(service.variants) && service.variants.length ? service.variants[0] : service);

const getPriceText = variant => {
  if (variant.priceText) return variant.priceText;
  if (Number(variant.priceFrom) === 0) return "Бесплатно";
  return `от ${formatRub(variant.priceFrom)} ₽`;
};

const getServiceValue = (service, variant) => variant.serviceValue || service.serviceValue || service.title;

const serviceCardTemplate = service => {
  const variant = getDefaultVariant(service);
  const hasVariants = Array.isArray(service.variants) && service.variants.length > 1;
  const cardClassName = `studio-service-card${service.dark ? " studio-service-card--dark" : ""}${
    service.featured ? " studio-service-card--featured" : ""
  }${service.accent ? ` studio-service-card--${service.accent}` : ""}${hasVariants ? " studio-service-card--switchable" : ""}`;
  const orderButtonClassName = `studio-service-order${
    service.alwaysVisibleCta ? " studio-service-order--always-visible" : ""
  }`;

  const switchMarkup = hasVariants
    ? `
      <div class="studio-service-switch" role="tablist" aria-label="${escapeHtml(service.title)}">
        ${service.variants
          .map(
            (item, index) => `
              <button
                type="button"
                class="studio-service-switch__button${index === 0 ? " is-active" : ""}"
                data-service-switch
                data-service-index="${index}"
              >
                ${escapeHtml(item.label)}
              </button>
            `
          )
          .join("")}
      </div>
    `
    : "";

  const bulletMarkup = Array.isArray(variant.bullets) && variant.bullets.length
    ? `
      <ul class="studio-service-bullets" data-service-bullets>
        ${variant.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `
    : "";

  const catalogMarkup = Array.isArray(service.catalog) && service.catalog.length
    ? `
      <div class="studio-service-catalog">
        ${service.catalog.map(item => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    `
    : "";

  return `
    <article
      class="${cardClassName}"
      data-service-card
      data-service='${escapeHtml(JSON.stringify(service))}'
    >
      <div class="studio-service-meta">
        <span class="studio-service-badge">${escapeHtml(service.badge)}</span>
        <span class="studio-service-reviews">Заказали: ${escapeHtml(service.reviews)} раз</span>
      </div>
      <h3 class="studio-service-title">${escapeHtml(service.title)}</h3>
      ${switchMarkup}
      <div class="studio-service-prices">
        <p class="studio-service-price" data-service-price>${escapeHtml(getPriceText(variant))}</p>
      </div>
      <p class="studio-service-installment" data-service-detail>${escapeHtml(variant.detail || service.detail || "")}</p>
      ${bulletMarkup}
      ${catalogMarkup}
      <button
        type="button"
        class="${orderButtonClassName}"
        data-open-brief-modal
        data-service="${escapeHtml(getServiceValue(service, variant))}"
      >
        ${escapeHtml(service.ctaLabel || "Заказать")}
      </button>
    </article>
  `;
};

const updateServiceCard = card => {
  const raw = card.dataset.service;
  if (!raw) return;

  const service = JSON.parse(raw);
  const activeIndex = Number(card.dataset.activeVariantIndex || 0);
  const variant = Array.isArray(service.variants) ? service.variants[activeIndex] || service.variants[0] : service;

  const priceNode = card.querySelector("[data-service-price]");
  const detailNode = card.querySelector("[data-service-detail]");
  const bulletsNode = card.querySelector("[data-service-bullets]");
  const ctaNode = card.querySelector("[data-open-brief-modal]");

  if (priceNode) priceNode.textContent = getPriceText(variant);
  if (detailNode) detailNode.textContent = variant.detail || service.detail || "";
  if (bulletsNode) {
    bulletsNode.innerHTML = (variant.bullets || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  }
  if (ctaNode) {
    ctaNode.dataset.service = getServiceValue(service, variant);
  }

  card.querySelectorAll("[data-service-switch]").forEach(button => {
    button.classList.toggle("is-active", Number(button.dataset.serviceIndex) === activeIndex);
  });
};

const initServices = () => {
  const grid = document.getElementById("studioServicesGrid");
  const moreWrap = document.getElementById("studioServicesMore");
  const moreButton = document.getElementById("studioServicesMoreButton");
  if (!grid) return;

  grid.innerHTML = SERVICES.map(serviceCardTemplate).join("");

  let expanded = false;
  const applyMobileLimit = () => {
    const cards = [...grid.querySelectorAll(".studio-service-card")];
    const limit = SERVICES_VISIBLE_LIMIT;

    cards.forEach((card, index) => {
      card.hidden = !expanded && index >= limit;
    });

    if (moreWrap) {
      moreWrap.hidden = !(cards.length > limit && !expanded);
    }
  };

  grid.querySelectorAll("[data-service-card]").forEach(card => {
    card.addEventListener("click", event => {
      const button = event.target.closest("[data-service-switch]");
      if (!button) return;
      card.dataset.activeVariantIndex = button.dataset.serviceIndex || "0";
      updateServiceCard(card);
    });
  });

  moreButton?.addEventListener("click", () => {
    expanded = true;
    applyMobileLimit();
  });

  window.addEventListener("resize", () => {
    expanded = false;
    applyMobileLimit();
  });

  applyMobileLimit();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServices);
} else {
  initServices();
}
