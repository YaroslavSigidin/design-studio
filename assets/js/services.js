const SERVICES = [
  {
    title: "UX/UI для платформы",
    price: 190000,
    oldPrice: 220000,
    featured: true,
    accent: "midnight",
    bullets: ["Сценарии и CJM", "Личный кабинет и роли", "Передача в разработку"]
  },
  {
    title: "Одностраничный сайт",
    price: 80000,
    oldPrice: 99000,
    featured: true,
    accent: "lime",
    bullets: ["Сильный первый экран", "Структура под конверсию", "Адаптив под mobile"]
  },
  {
    title: "Многостраничный сайт",
    price: 140000,
    oldPrice: 165000,
    featured: true,
    accent: "sky",
    bullets: ["Карта разделов", "Единая дизайн-система", "SEO-ready структура"]
  },
  {
    title: "Мобильное приложение",
    price: 220000,
    oldPrice: 255000,
    bullets: ["UX-сценарии", "UI-kit экранов", "Адаптив и handoff"]
  },
  {
    title: "Брендинг и айдентика",
    price: 95000,
    oldPrice: 112000,
    bullets: ["Логотип и знак", "Фирменные носители", "Гайдлайн бренда"]
  },
  {
    title: "Презентация для бизнеса",
    price: 45000,
    oldPrice: 55000,
    bullets: ["Структура и сценарий", "Дизайн слайдов", "Шаблон под правки"]
  }
];

window.SERVICES = SERVICES;

const formatRub = value => new Intl.NumberFormat("ru-RU").format(value);

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
      ${bullets.map(item => `<li>${window.__studioEscapeHtml(item)}</li>`).join("")}
    </ul>
  `;
  return `
    <article class="${cardClassName}" data-service-card>
      <div class="studio-service-card__body">
        <h3 class="studio-service-title">${window.__studioEscapeHtml(service.title)}</h3>
        <div class="studio-service-prices">
          <p class="studio-service-price">${window.__studioEscapeHtml(priceValue)}</p>
          ${oldPriceMarkup}
        </div>
        <p class="studio-service-installment">${window.__studioEscapeHtml(pricingDetail)}</p>
        ${bulletMarkup}
      </div>
      <button
        type="button"
        class="studio-service-order studio-service-order--always-visible"
        data-open-brief-modal
        data-service="${window.__studioEscapeHtml(service.title)}"
      >
        ${window.__studioEscapeHtml(service.ctaLabel || "Заказать")}
      </button>
    </article>
  `;
};

const initServices = () => {
  const grid = document.getElementById("studioServicesGrid");
  if (!grid) return;

  grid.innerHTML = SERVICES.map(serviceCardTemplate).join("");
  window.dispatchEvent(new CustomEvent("studio:services-rendered"));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServices);
} else {
  initServices();
}
