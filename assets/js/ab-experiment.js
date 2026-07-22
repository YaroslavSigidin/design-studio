/**
 * Изолированный hero-эксперимент для рекламного трафика.
 *
 * Контрольная версия показывается всем обычным посетителям. Вариант можно
 * зафиксировать ссылкой `?variant=landing|product|redesign`. Случайное
 * распределение включается только ссылкой `?exp=hero-offer-july`.
 */
(() => {
  const EXPERIMENT_ID = "hero_offer_july_2026";
  const STORAGE_KEY = `studio:experiment:${EXPERIMENT_ID}`;
  const variants = {
    control: {
      title: "Дизайн-студия<br />полного цикла",
      subtitle: ["Проектируем интерфейсы", "Повышаем конверсию", "Разрабатываем сайты"],
      placeholder: "Мне нужен(а)....",
      cta: "Заказать дизайн",
      service: "Дизайн и разработка",
      source: "Главная — контроль"
    },
    landing: {
      title: "Лендинг под ключ<br />за 14–21 день",
      subtitle: ["Прототип и тексты", "Уникальный дизайн", "Разработка и запуск"],
      placeholder: "Опишите продукт — оценим лендинг и сроки",
      cta: "Получить расчёт",
      service: "Одностраничный сайт",
      source: "A/B — лендинг",
      pageTitle: "Лендинг под ключ за 14–21 день — Согласовано",
      description: "Проектируем, оформляем и запускаем лендинги под ключ. Смета и план работ до начала проекта."
    },
    product: {
      title: "UX/UI для сложных<br />цифровых продуктов",
      subtitle: ["Исследование", "Прототип", "Дизайн-система и передача в разработку"],
      placeholder: "Опишите продукт или пришлите ТЗ — оценим объём",
      cta: "Обсудить продукт",
      service: "UX/UI дизайн",
      source: "A/B — продуктовый дизайн",
      pageTitle: "UX/UI-дизайн цифровых продуктов — Согласовано",
      description: "Проектируем SaaS, личные кабинеты и мобильные приложения: UX, прототип, UI-kit и сопровождение разработки."
    },
    redesign: {
      title: "Редизайн сайта,<br />который ведёт к заявке",
      subtitle: ["UX-аудит", "Новый сценарий", "Макеты для разработки"],
      placeholder: "Пришлите ссылку — найдём потери на пути к заявке",
      cta: "Получить разбор",
      service: "Редизайн сайта",
      source: "A/B — редизайн",
      pageTitle: "Редизайн сайта и UX-аудит — Согласовано",
      description: "Находим барьеры в пользовательском пути и проектируем редизайн сайта с понятными точками конверсии."
    }
  };

  const params = new URLSearchParams(window.location.search);
  const forcedVariant = String(params.get("variant") || "").toLowerCase();
  const experimentRequested = params.get("exp") === "hero-offer-july";
  let variant = Object.hasOwn(variants, forcedVariant) ? forcedVariant : "control";
  let assignment = forcedVariant ? "url" : "control";

  if (!forcedVariant && experimentRequested) {
    const choices = ["control", "landing", "product", "redesign"];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      variant = choices.includes(stored) ? stored : choices[Math.floor(Math.random() * choices.length)];
      window.localStorage.setItem(STORAGE_KEY, variant);
    } catch (_) {
      variant = choices[Math.floor(Math.random() * choices.length)];
    }
    assignment = "experiment";
  }

  const selected = variants[variant];
  window.STUDIO_EXPERIMENT = {
    id: EXPERIMENT_ID,
    variant,
    assignment,
    active: variant !== "control" || experimentRequested
  };

  document.documentElement.dataset.experiment = EXPERIMENT_ID;
  document.documentElement.dataset.variant = variant;

  const apply = () => {
    document.body.dataset.experiment = EXPERIMENT_ID;
    document.body.dataset.variant = variant;

    if (variant === "control") return;

    const title = document.querySelector("[data-hero-wordmark]");
    if (title) title.innerHTML = selected.title;

    const subtitle = document.querySelector(".hero-subtitle");
    if (subtitle) {
      subtitle.innerHTML = selected.subtitle
        .map((item, index) => `${index ? '<span class="hero-subtitle__dot" aria-hidden="true">·</span>' : ""}<span>${item}</span>`)
        .join("");
    }

    document.querySelectorAll("[data-hero-search-editor]").forEach(editor => {
      editor.dataset.placeholder = selected.placeholder;
      editor.setAttribute("aria-label", selected.placeholder);
      const ghost = editor.parentElement?.querySelector(".hero-search-editor-ghost");
      if (ghost) ghost.firstChild.textContent = `${selected.placeholder} `;
    });

    document.querySelectorAll("a.hero-btn[data-open-brief-modal]").forEach(button => {
      button.textContent = selected.cta;
      button.dataset.service = selected.service;
      button.dataset.briefSource = selected.source;
      button.dataset.briefTitle = selected.cta;
    });

    if (selected.pageTitle) document.title = selected.pageTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description && selected.description) description.content = selected.description;
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
