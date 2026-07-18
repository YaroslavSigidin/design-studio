const SERVICE_ICONS = {
  layout: `
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="26" height="22" rx="4" fill="currentColor" opacity="0.12"/>
      <rect x="3" y="5" width="26" height="22" rx="4" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3 11.5h26" stroke="currentColor" stroke-width="1.6"/>
      <rect x="6.2" y="8.1" width="3.2" height="1.5" rx="0.75" fill="currentColor" opacity="0.45"/>
      <rect x="10.4" y="8.1" width="3.2" height="1.5" rx="0.75" fill="currentColor" opacity="0.28"/>
      <rect x="5.5" y="14" width="7.5" height="10" rx="1.6" fill="currentColor" opacity="0.18"/>
      <path d="M15.8 15.2h9.2M15.8 18.6h7.2M15.8 22h5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
      <path d="M22.2 20.4 25.4 24.8l-3.7-.7-.95-3.7Z" fill="currentColor"/>
    </svg>
  `,
  landing: `
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="8" y="2.5" width="16" height="27" rx="4" fill="currentColor" opacity="0.12"/>
      <rect x="8" y="2.5" width="16" height="27" rx="4" stroke="currentColor" stroke-width="1.6"/>
      <path d="M12.5 5.2h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/>
      <rect x="11" y="8.2" width="10" height="6.2" rx="1.4" fill="currentColor" opacity="0.22"/>
      <path d="M11.5 17.2h9M11.5 20.4h7.2M11.5 23.6h5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
      <circle cx="16" cy="26.8" r="1.15" fill="currentColor"/>
    </svg>
  `,
  multipage: `
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="10.5" y="3.5" width="15.5" height="20" rx="2.4" fill="currentColor" opacity="0.1"/>
      <rect x="10.5" y="3.5" width="15.5" height="20" rx="2.4" stroke="currentColor" stroke-width="1.45" opacity="0.55"/>
      <rect x="6" y="7.5" width="16.5" height="21" rx="2.6" fill="currentColor" opacity="0.14"/>
      <rect x="6" y="7.5" width="16.5" height="21" rx="2.6" stroke="currentColor" stroke-width="1.6"/>
      <path d="M9.2 12.2h10M9.2 16h7.6M9.2 19.8h8.8M9.2 23.6h5.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="18.8" y="9.8" width="5.4" height="5.4" rx="1.2" fill="currentColor" opacity="0.28"/>
    </svg>
  `,
  brand: `
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="11.2" fill="currentColor" opacity="0.1"/>
      <circle cx="16" cy="16" r="11.2" stroke="currentColor" stroke-width="1.55"/>
      <path d="M16 7.2 18.35 13.1l6.35.45-4.9 3.95 1.55 6.15L16 20.5l-5.35 3.15 1.55-6.15-4.9-3.95 6.35-.45L16 7.2Z" fill="currentColor" opacity="0.22"/>
      <path d="M16 9.4 17.75 14l5 .35-3.85 3.1 1.2 4.85L16 19.85 11.9 22.3l1.2-4.85-3.85-3.1 5-.35L16 9.4Z" fill="currentColor"/>
      <circle cx="16" cy="16.2" r="2.1" fill="#fff" opacity="0.92"/>
    </svg>
  `,
  redesign: `
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3.5" y="6" width="25" height="18.5" rx="3.5" fill="currentColor" opacity="0.12"/>
      <rect x="3.5" y="6" width="25" height="18.5" rx="3.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3.5 11.2h25" stroke="currentColor" stroke-width="1.55"/>
      <circle cx="7.2" cy="8.6" r="0.9" fill="currentColor" opacity="0.45"/>
      <circle cx="10" cy="8.6" r="0.9" fill="currentColor" opacity="0.3"/>
      <circle cx="12.8" cy="8.6" r="0.9" fill="currentColor" opacity="0.2"/>
      <path d="M11.2 16.2a5.2 5.2 0 0 1 8.7-2.1" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"/>
      <path d="M20.8 19.8a5.2 5.2 0 0 1-8.7 2.1" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"/>
      <path d="M18.4 11.8v3.4h3.4M13.6 24.2v-3.4H10.2" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

const SERVICES_FALLBACK = [
  {
    id: "uxui",
    title: "UX/UI дизайн",
    price: 95000,
    icon: "layout",
    ctaLabel: "Обсудить эту задачу",
    bullets: [
      "Понятные пользовательские сценарии",
      "Удобные роли доступа",
      "Быстрые ежедневные задачи",
      "Готовность к разработке",
      "Единый визуальный стиль"
    ]
  },
  {
    id: "landing",
    title: "Одностраничный сайт",
    price: 40000,
    icon: "landing",
    ctaLabel: "Обсудить эту задачу",
    bullets: [
      "Сильный первый экран",
      "Путь к заявке",
      "Адаптив под телефон",
      "Блоки с доверием",
      "Быстрый запуск проекта"
    ]
  },
  {
    id: "multipage",
    title: "Многостраничный сайт",
    price: 70000,
    icon: "multipage",
    ctaLabel: "Обсудить эту задачу",
    bullets: [
      "Логичная карта разделов",
      "Единый стиль страниц",
      "Удобная навигация сайта",
      "Структура под поиск",
      "Место для роста"
    ]
  },
  {
    id: "branding",
    title: "Брендинг и айдентика",
    price: 48000,
    icon: "brand",
    ctaLabel: "Обсудить эту задачу",
    bullets: [
      "Узнаваемый логотип бренда",
      "Цвета и шрифты",
      "Правила использования стиля",
      "Носители для бизнеса",
      "Гайд для команды"
    ]
  },
  {
    id: "redesign",
    title: "Редизайн сайта",
    price: 60000,
    icon: "redesign",
    ctaLabel: "Обсудить эту задачу",
    bullets: [
      "Аудит текущих проблем",
      "Свежий внешний вид",
      "Короткий путь заявки",
      "Сохранение поисковых позиций",
      "Обновление без перезапуска"
    ]
  }
];

window.SERVICES = SERVICES_FALLBACK;

const loadServicesContent = async () => {
  const url = window.STUDIO_CONFIG?.content?.services;
  if (!url) return SERVICES_FALLBACK;
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`services ${response.status}`);
    const data = await response.json();
    const list = Array.isArray(data?.services) ? data.services : [];
    return list.length ? list : SERVICES_FALLBACK;
  } catch (err) {
    console.warn("[studio services] content fallback", err);
    return SERVICES_FALLBACK;
  }
};

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

const getServiceIcon = service => SERVICE_ICONS[service.icon] || SERVICE_ICONS.layout;

const serviceCardTemplate = service => {
  const pricingDetail = getPricingDetail(service.title);
  const isFree = Number(service.price) === 0;
  const priceValue = isFree ? "Бесплатно" : `от ${formatRub(service.price)} ₽`;
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
        <span class="studio-service-icon" aria-hidden="true">${getServiceIcon(service)}</span>
        <div class="studio-service-prices">
          <p class="studio-service-price">${window.__studioEscapeHtml(priceValue)}</p>
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

const initServices = async () => {
  const grid = document.getElementById("studioServicesGrid");
  if (!grid) return;

  const services = await loadServicesContent();
  window.SERVICES = services;
  const hasPrerender = grid.querySelector("[data-service-card][data-prerendered]");
  // Keep static HTML if fetch failed and returned the same fallback already painted.
  if (hasPrerender && services === SERVICES_FALLBACK && grid.children.length) {
    window.dispatchEvent(new CustomEvent("studio:services-rendered"));
    return;
  }

  grid.innerHTML = services.map(serviceCardTemplate).join("");
  window.dispatchEvent(new CustomEvent("studio:services-rendered"));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServices);
} else {
  initServices();
}
