const initFaq = () => {
  const list = document.querySelector("[data-faq]");
  if (!list) return;

  const items = [...list.querySelectorAll(".studio-faq__item")];

  const setOpen = (item, open) => {
    const trigger = item.querySelector(".studio-faq__trigger");
    item.classList.toggle("is-open", open);
    if (trigger) {
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }
  };

  items.forEach((item, index) => {
    const trigger = item.querySelector(".studio-faq__trigger");
    const panel = item.querySelector(".studio-faq__panel");
    if (!trigger || !panel) return;

    const panelId = panel.id || `faq-panel-${index + 1}`;
    panel.id = panelId;
    trigger.setAttribute("aria-controls", panelId);
    trigger.setAttribute("aria-expanded", item.classList.contains("is-open") ? "true" : "false");

    trigger.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      // Один открытый вопрос за раз — привычное поведение аккордеона.
      if (willOpen) {
        items.forEach(other => {
          if (other !== item) setOpen(other, false);
        });
      }

      setOpen(item, willOpen);
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFaq);
} else {
  initFaq();
}
