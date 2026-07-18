const SERVICES = [
  {
    title: "UX/UI дизайн",
    price: 95000,
    bullets: [
      "Понятные пользовательские сценарии",
      "Удобные роли доступа",
      "Быстрые ежедневные задачи",
      "Готовность к разработке",
      "Единый визуальный стиль"
    ]
  },
  {
    title: "Многостраничный сайт",
    price: 70000,
    bullets: [
      "Логичная карта разделов",
      "Единый стиль страниц",
      "Удобная навигация сайта",
      "Структура под поиск",
      "Место для роста"
    ]
  },
  {
    title: "Одностраничный сайт",
    price: 40000,
    bullets: [
      "Сильный первый экран",
      "Путь к заявке",
      "Адаптив под телефон",
      "Блоки с доверием",
      "Быстрый запуск проекта"
    ]
  },
  {
    title: "Брендинг и айдентика",
    price: 48000,
    bullets: [
      "Узнаваемый логотип бренда",
      "Цвета и шрифты",
      "Правила использования стиля",
      "Носители для бизнеса",
      "Гайд для команды"
    ]
  },
  {
    title: "Редизайн сайта",
    price: 60000,
    bullets: [
      "Аудит текущих проблем",
      "Свежий внешний вид",
      "Короткий путь заявки",
      "Сохранение поисковых позиций",
      "Обновление без перезапуска"
    ]
  }
];

const DEFAULT_SERVICE_TITLE = "Одностраничный сайт";

window.STUDIO_DEFAULT_SERVICE_TITLE = DEFAULT_SERVICE_TITLE;

window.SERVICES = SERVICES;

const formatRub = value => new Intl.NumberFormat("ru-RU").format(value);

const getPricingDetail = title => {
  const normalized = String(title || "").toLowerCase();

  if (normalized.includes("презентац")) return "от 400 ₽ за слайд";
  if (normalized.includes("редизайн")) return "от 7 500 ₽ за экран";
  if (normalized.includes("лендинг")) return "от 6 000 ₽ за экран";
  if (normalized.includes("многостранич")) return "от 9 000 ₽ за страницу";
  if (normalized.includes("ux-аудит")) return "от 2 250 ₽ за сценарий";
  if (normalized.includes("ресерч")) return "от 7 000 ₽ за интервью";
  if (normalized.includes("прототип")) return "от 3 000 ₽ за flow";
  if (normalized.includes("гайдлайн")) return "от 5 500 ₽ за раздел";
  if (normalized.includes("email")) return "от 1 500 ₽ за шаблон";
  if (normalized.includes("карточки для соцсетей")) return "от 600 ₽ за карточку";
  if (normalized.includes("локализация")) return "от 450 ₽ за экран";
  if (normalized.includes("motion")) return "от 3 500 ₽ за анимацию";
  if (normalized.includes("branding") || normalized.includes("брендинг")) return "от 4 800 ₽ за носитель";
  if (normalized.includes("разбор проекта")) return "Да, реально бесплатно";
  if (normalized.includes("crm")) return "от 3 750 ₽ за роль/сценарий";
  if (normalized.includes("dashboard") || normalized.includes("дашборд")) return "от 4 000 ₽ за виджет";
  if (normalized.includes("ui-kit")) return "от 1 400 ₽ за компонент";
  if (normalized.includes("handoff")) return "от 750 ₽ за экран";
  if (normalized.includes("квиз")) return "от 5 000 ₽ за шаг";

  return "от 3 250 ₽ за экран";
};

const getBullets = service => {
  if (Array.isArray(service.bullets) && service.bullets.length) return service.bullets;
  if (service.dark) return ["Разбор текущего решения", "План улучшений", "Созвон с командой"];
  return ["Бриф и структура", "Дизайн и прототип", "Передача в разработку"];
};

const serviceCardTemplate = service => {
  const pricingDetail = getPricingDetail(service.title);
  const isFree = Number(service.price) === 0;
  const priceMarkup = isFree
    ? "Бесплатно"
    : `<span class="studio-service-price__from">от</span> ${window.__studioEscapeHtml(formatRub(service.price))} ₽`;
  const cardClassName = `studio-service-card${service.dark ? " studio-service-card--dark" : ""}`;
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
          <p class="studio-service-price">${priceMarkup}</p>
        </div>
        <p class="studio-service-installment">${window.__studioEscapeHtml(pricingDetail)}</p>
        ${bulletMarkup}
      </div>
      <button
        type="button"
        class="studio-service-order"
        data-open-brief-modal
        data-service="${window.__studioEscapeHtml(service.title)}"
      >
        ${window.__studioEscapeHtml(service.ctaLabel || "Заказать")}
      </button>
    </article>
  `;
};

const stripServiceIcons = root => {
  root?.querySelectorAll(".studio-service-icon").forEach(node => node.remove());
};

const initServices = () => {
  const grid = document.getElementById("studioServicesGrid");
  if (!grid) return;

  delete grid.dataset.loopReady;
  delete grid.dataset.originalCount;
  grid.innerHTML = SERVICES.map(serviceCardTemplate).join("");
  stripServiceIcons(grid);
  window.dispatchEvent(new CustomEvent("studio:services-rendered"));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServices);
} else {
  initServices();
}
