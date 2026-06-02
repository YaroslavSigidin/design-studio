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

const serviceActionMarkup = (label, serviceValue) => `
  <button
    type="button"
    class="studio-services-alt__action"
    data-open-brief-modal
    data-service="${escapeHtml(serviceValue)}"
  >
    ${escapeHtml(label)}
  </button>
`;

const renderAltServices = () => {
  const root = document.getElementById("studioServicesAltGrid");
  if (!root) return;

  const site = SERVICES.find(item => item.title === "Сайт");
  const platform = SERVICES.find(item => item.title === "WEB-платформа");
  const app = SERVICES.find(item => item.title === "Мобильное приложение");
  const brand = SERVICES.find(item => item.title === "Дизайн для бренда");
  const business = SERVICES.find(item => item.title === "Услуги для бизнеса");
  const review = SERVICES.find(item => item.title === "Разбор проекта");

  if (!site || !platform || !app || !brand || !business || !review) return;

  const siteVariants = site.variants || [];
  const brandVariants = brand.variants || [];

  root.innerHTML = `
    <article class="studio-services-alt__hero">
      <div class="studio-services-alt__eyebrow">Основной спрос</div>
      <h3 class="studio-services-alt__hero-title">Сайты, которые реально продают услугу, продукт или компанию</h3>
      <p class="studio-services-alt__hero-copy">
        В одном блоке сразу видны оба формата. Это убирает путаницу и показывает, с чего обычно начинается работа со студией.
      </p>
      <div class="studio-services-alt__plans">
        ${siteVariants
          .map(
            item => `
              <div class="studio-services-alt__plan">
                <div class="studio-services-alt__plan-label">${escapeHtml(item.label)}</div>
                <div class="studio-services-alt__plan-price">${escapeHtml(getPriceText(item))}</div>
                <div class="studio-services-alt__plan-copy">${escapeHtml(item.detail)}</div>
                ${serviceActionMarkup("Выбрать", item.serviceValue)}
              </div>
            `
          )
          .join("")}
      </div>
    </article>

    <article class="studio-services-alt__platform">
      <div class="studio-services-alt__eyebrow">UX/UI</div>
      <h3 class="studio-services-alt__card-title">${escapeHtml(platform.title)}</h3>
      <div class="studio-services-alt__card-price">${escapeHtml(getPriceText(platform))}</div>
      <p class="studio-services-alt__card-copy">${escapeHtml(platform.detail)}</p>
      <ul class="studio-services-alt__list">
        ${(platform.bullets || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      ${serviceActionMarkup("Обсудить платформу", platform.title)}
    </article>

    <article class="studio-services-alt__support studio-services-alt__support--app">
      <div class="studio-services-alt__eyebrow">Следующий уровень</div>
      <h3 class="studio-services-alt__card-title">${escapeHtml(app.title)}</h3>
      <div class="studio-services-alt__card-price">${escapeHtml(getPriceText(app))}</div>
      <p class="studio-services-alt__card-copy">${escapeHtml(app.detail)}</p>
      ${serviceActionMarkup("Обсудить приложение", app.title)}
    </article>

    <article class="studio-services-alt__support studio-services-alt__support--brand">
      <div class="studio-services-alt__eyebrow">Усиление образа</div>
      <h3 class="studio-services-alt__card-title">${escapeHtml(brand.title)}</h3>
      <div class="studio-services-alt__micro-prices">
        ${brandVariants
          .map(
            item => `
              <div class="studio-services-alt__micro-price">
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(getPriceText(item))}</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <p class="studio-services-alt__card-copy">${escapeHtml(brand.detail)}</p>
      ${serviceActionMarkup("Обсудить бренд", brand.title)}
    </article>

    <article class="studio-services-alt__support studio-services-alt__support--business">
      <div class="studio-services-alt__eyebrow">Точечные задачи</div>
      <h3 class="studio-services-alt__card-title">${escapeHtml(business.title)}</h3>
      <div class="studio-services-alt__card-price">${escapeHtml(getPriceText(business))}</div>
      <div class="studio-services-alt__chips">
        ${(business.catalog || []).map(item => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
      ${serviceActionMarkup("Собрать пакет", business.title)}
    </article>

    <article class="studio-services-alt__review">
      <div>
        <div class="studio-services-alt__eyebrow">Вход в работу</div>
        <h3 class="studio-services-alt__card-title">${escapeHtml(review.title)}</h3>
        <p class="studio-services-alt__card-copy">${escapeHtml(review.detail)}</p>
      </div>
      <div class="studio-services-alt__review-side">
        <div class="studio-services-alt__review-price">${escapeHtml(getPriceText(review))}</div>
        ${serviceActionMarkup("Получить разбор", review.title)}
      </div>
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
  renderAltServices();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServices);
} else {
  initServices();
}
