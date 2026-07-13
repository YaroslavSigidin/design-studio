const SERVICES = [
  {
    title: "UX/UI для платформы",
    price: 190000,
    oldPrice: 220000,
    badge: "Флагман",
    rating: 5.0,
    reviews: 28,
    featured: true,
    accent: "midnight",
    bullets: ["Сценарии и CJM", "Личный кабинет и роли", "Передача в разработку"]
  },
  {
    title: "Одностраничный сайт",
    price: 80000,
    oldPrice: 99000,
    badge: "Хит",
    rating: 4.9,
    reviews: 52,
    featured: true,
    accent: "lime",
    bullets: ["Сильный первый экран", "Структура под конверсию", "Адаптив под mobile"]
  },
  {
    title: "Многостраничный сайт",
    price: 140000,
    oldPrice: 165000,
    badge: "-15%",
    rating: 4.8,
    reviews: 41,
    featured: true,
    accent: "sky",
    bullets: ["Карта разделов", "Единая дизайн-система", "SEO-ready структура"]
  },
  { title: "Мобильное приложение", price: 220000, oldPrice: 255000, badge: "Топ", rating: 4.9, reviews: 34 },
  { title: "Брендинг и айдентика", price: 95000, oldPrice: 112000, badge: "Новое", rating: 4.7, reviews: 22 },
  { title: "Презентация для бизнеса", price: 45000, oldPrice: 55000, badge: "Быстро", rating: 4.8, reviews: 63 },
  { title: "Дизайн интернет-магазина", price: 175000, oldPrice: 205000, badge: "-10%", rating: 4.8, reviews: 30 },
  { title: "Редизайн сайта", price: 120000, oldPrice: 140000, badge: "Скидка", rating: 4.7, reviews: 44 },
  { title: "Корпоративный портал", price: 240000, oldPrice: 280000, badge: "B2B", rating: 4.9, reviews: 18 },
  { title: "Сервисный кабинет", price: 165000, oldPrice: 195000, badge: "Хит", rating: 4.8, reviews: 29 },
  { title: "Дашборд аналитики", price: 130000, oldPrice: 154000, badge: "AI", rating: 4.9, reviews: 21 },
  { title: "UI-kit + дизайн-система", price: 115000, oldPrice: 136000, badge: "Система", rating: 4.8, reviews: 37 },
  { title: "Дизайн SaaS-сервиса", price: 210000, oldPrice: 242000, badge: "Премиум", rating: 5.0, reviews: 17 },
  { title: "Личный кабинет клиента", price: 145000, oldPrice: 171000, badge: "Популярно", rating: 4.8, reviews: 33 },
  { title: "Промо-страница мероприятия", price: 65000, oldPrice: 78000, badge: "Быстро", rating: 4.7, reviews: 47 },
  { title: "Дизайн CRM-интерфейса", price: 205000, oldPrice: 238000, badge: "B2B", rating: 4.9, reviews: 14 },
  { title: "Финтех-приложение", price: 260000, oldPrice: 299000, badge: "Премиум", rating: 4.9, reviews: 11 },
  { title: "EdTech-платформа", price: 195000, oldPrice: 225000, badge: "Топ", rating: 4.8, reviews: 19 },
  { title: "Travel-сервис", price: 175000, oldPrice: 209000, badge: "Скидка", rating: 4.7, reviews: 24 },
  { title: "Медицинский сервис", price: 185000, oldPrice: 216000, badge: "Новое", rating: 4.8, reviews: 16 },
  { title: "Дизайн маркетплейса", price: 280000, oldPrice: 325000, badge: "Премиум", rating: 4.9, reviews: 10 },
  { title: "Локализация интерфейса", price: 70000, oldPrice: 84000, badge: "-12%", rating: 4.6, reviews: 27 },
  { title: "UX-аудит продукта", price: 55000, oldPrice: 68000, badge: "Аудит", rating: 4.8, reviews: 58 },
  { title: "Прототип в Figma", price: 50000, oldPrice: 62000, badge: "Быстро", rating: 4.7, reviews: 66 },
  { title: "Дизайн сайта на Tilda", price: 85000, oldPrice: 102000, badge: "Хит", rating: 4.8, reviews: 40 },
  { title: "Квиз-лендинг", price: 72000, oldPrice: 89000, badge: "-18%", rating: 4.7, reviews: 38 },
  { title: "Email-шаблоны", price: 38000, oldPrice: 47000, badge: "Пакет", rating: 4.6, reviews: 73 },
  { title: "Гайдлайн бренда", price: 90000, oldPrice: 109000, badge: "Бренд", rating: 4.8, reviews: 26 },
  { title: "Карточки для соцсетей", price: 30000, oldPrice: 38000, badge: "Быстро", rating: 4.5, reviews: 88 },
  { title: "Motion-дизайн интерфейса", price: 98000, oldPrice: 119000, badge: "Motion", rating: 4.7, reviews: 20 },
  { title: "Продуктовый ресерч", price: 82000, oldPrice: 99000, badge: "Research", rating: 4.8, reviews: 31 },
  { title: "Handoff для разработки", price: 46000, oldPrice: 57000, badge: "Dev-ready", rating: 4.9, reviews: 45 },
  {
    title: "Разбор проекта",
    price: 0,
    oldPrice: 0,
    badge: "Free",
    rating: 5.0,
    reviews: 128,
    dark: true,
    ctaLabel: "Оставить заявку",
    alwaysVisibleCta: true
  }
];

const SERVICES_HOME_TITLES = [
  "UX/UI для платформы",
  "Одностраничный сайт",
  "Многостраничный сайт",
  "Мобильное приложение",
  "Брендинг и айдентика",
  "Презентация для бизнеса"
];

const getHomeServices = () => {
  const byTitle = new Map(SERVICES.map(service => [service.title, service]));
  return SERVICES_HOME_TITLES.map(title => byTitle.get(title)).filter(Boolean);
};

window.SERVICES = SERVICES;

const formatRub = value => new Intl.NumberFormat("ru-RU").format(value);

const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getPricingDetail = title => {
  const normalized = String(title || "").toLowerCase();

  if (normalized.includes("презентац")) return "от 800 ₽ за слайд";
  if (normalized.includes("лендинг")) return "от 12 000 ₽ за экран";
  if (normalized.includes("многостранич")) return "от 18 000 ₽ за страницу";
  if (normalized.includes("мобиль")) return "от 9 500 ₽ за экран";
  if (normalized.includes("ux-аудит")) return "от 4 500 ₽ за сценарий";
  if (normalized.includes("ресерч")) return "от 14 000 ₽ за интервью";
  if (normalized.includes("прототип")) return "от 6 000 ₽ за flow";
  if (normalized.includes("гайдлайн")) return "от 11 000 ₽ за раздел";
  if (normalized.includes("email")) return "от 3 000 ₽ за шаблон";
  if (normalized.includes("карточки для соцсетей")) return "от 1 200 ₽ за карточку";
  if (normalized.includes("локализация")) return "от 900 ₽ за экран";
  if (normalized.includes("motion")) return "от 7 000 ₽ за анимацию";
  if (normalized.includes("branding") || normalized.includes("брендинг")) return "от 9 500 ₽ за носитель";
  if (normalized.includes("разбор проекта")) return "Да, реально бесплатно";
  if (normalized.includes("crm")) return "от 7 500 ₽ за роль/сценарий";
  if (normalized.includes("dashboard") || normalized.includes("дашборд")) return "от 8 000 ₽ за виджет";
  if (normalized.includes("ui-kit")) return "от 2 800 ₽ за компонент";
  if (normalized.includes("handoff")) return "от 1 500 ₽ за экран";
  if (normalized.includes("квиз")) return "от 10 000 ₽ за шаг";

  return "от 6 500 ₽ за экран";
};

const getBullets = service => {
  if (Array.isArray(service.bullets) && service.bullets.length) return service.bullets;
  if (service.dark) return ["Разбор текущего решения", "План улучшений", "Созвон с командой"];
  return ["Бриф и структура", "Дизайн и прототип", "Передача в разработку"];
};

const serviceCardTemplate = service => {
  const pricingDetail = getPricingDetail(service.title);
  const isFree = Number(service.price) === 0;
  const priceValue = isFree ? "Бесплатно" : `${formatRub(service.price)} ₽`;
  const oldPriceMarkup = !isFree && Number(service.oldPrice) > 0
    ? `<p class="studio-service-old-price">${formatRub(service.oldPrice)} ₽</p>`
    : "";
  const cardClassName = `studio-service-card${service.dark ? " studio-service-card--dark" : ""}${
    service.featured ? " studio-service-card--featured" : ""
  }${service.accent ? ` studio-service-card--${service.accent}` : ""}`;
  const bullets = getBullets(service);
  const bulletMarkup = `
    <ul class="studio-service-bullets">
      ${bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
  const metaMarkup =
    service.rating || service.reviews
      ? `
      <div class="studio-service-meta">
        ${
          service.rating
            ? `<span class="studio-service-rating" aria-label="Рейтинг ${service.rating}">★ ${service.rating.toFixed(1)}</span>`
            : ""
        }
        ${
          service.reviews
            ? `<span class="studio-service-reviews">${service.reviews} отзывов</span>`
            : ""
        }
      </div>
    `
      : "";
  return `
    <article class="${cardClassName}" data-service-card>
      <div class="studio-service-card__body">
        ${metaMarkup}
        <h3 class="studio-service-title">${escapeHtml(service.title)}</h3>
        <div class="studio-service-prices">
          <p class="studio-service-price">${escapeHtml(priceValue)}</p>
          ${oldPriceMarkup}
        </div>
        <p class="studio-service-installment">${escapeHtml(pricingDetail)}</p>
        ${bulletMarkup}
      </div>
      <button
        type="button"
        class="studio-service-order studio-service-order--always-visible"
        data-open-brief-modal
        data-service="${escapeHtml(service.title)}"
      >
        ${escapeHtml(service.ctaLabel || "Заказать")}
      </button>
    </article>
  `;
};

const initServices = () => {
  const grid = document.getElementById("studioServicesGrid");
  if (!grid) return;

  grid.innerHTML = getHomeServices().map(serviceCardTemplate).join("");
  window.dispatchEvent(new CustomEvent("studio:services-rendered"));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServices);
} else {
  initServices();
}
