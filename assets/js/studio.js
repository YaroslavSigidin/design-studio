const qs = (sel, scope = document) => scope.querySelector(sel);

const setStatus = (el, ok, lines) => {
  if (!el) return;
  el.classList.remove("is-ok", "is-error");
  el.classList.add(ok ? "is-ok" : "is-error");
  el.innerHTML = lines.map(line => `<div>${line}</div>`).join("");
};

const loadJson = async url => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

const renderCasePreview = (host, manifest) => {
  if (!host || !manifest?.projects?.length) return;
  const items = manifest.projects.filter(p => p.caseUrl).slice(0, 8);
  host.innerHTML = `
    <h2>Кейсы портфолио (preview)</h2>
    <ul class="studio-case-list">
      ${items
        .map(
          p => `<li><a href="${p.caseUrl}" target="_blank" rel="noreferrer"><strong>${p.title}</strong><span>${p.category}</span></a></li>`
        )
        .join("")}
    </ul>
  `;
};

const boot = async () => {
  const cfg = window.STUDIO_CONFIG || {};
  const statusEl = qs("#studioStatus");
  const previewEl = qs("#studioCasesPreview");

  try {
    const manifest = await loadJson(cfg.manifest || "./data/cases.manifest.json");
    window.STUDIO_CASES = manifest;

    setStatus(statusEl, true, [
      `Manifest: ${manifest.totalProjects} проектов`,
      `С кейс-страницей: ${manifest.withCasePage}`,
      `Данные caseStudies: ${manifest.withCaseStudy}`,
      "Готово к подключению в новый сайт студии."
    ]);

    renderCasePreview(previewEl, manifest);
  } catch (err) {
    setStatus(statusEl, false, [
      "Не удалось загрузить cases.manifest.json",
      "Проверьте, что локальный сервер запущен из корня этого репозитория.",
      String(err.message || err)
    ]);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
