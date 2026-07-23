(() => {
  const root = document.querySelector("[data-article-archive]");
  if (!root) return;

  const cards = [...root.querySelectorAll("[data-article-card]")];
  const filters = [...root.querySelectorAll("[data-article-filter]")];
  const input = root.querySelector("[data-article-search]");
  const empty = root.querySelector("[data-article-empty]");
  let activeFilter = "all";

  const apply = () => {
    const query = String(input?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach(card => {
      const haystack = String(card.dataset.search || "").toLowerCase();
      const matchesFilter = activeFilter === "all" || haystack.includes(activeFilter);
      const matchesQuery = !query || haystack.includes(query);
      const isVisible = matchesFilter && matchesQuery;
      card.hidden = !isVisible;
      if (isVisible) visible += 1;
    });

    if (empty) empty.hidden = visible > 0;
  };

  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      activeFilter = String(filter.dataset.articleFilter || "all");
      filters.forEach(item => {
        const active = item === filter;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      apply();
    });
  });

  input?.addEventListener("input", apply);
  root.querySelector("form")?.addEventListener("submit", event => event.preventDefault());
  apply();
})();
