const initStudioAnalytics = () => {
  const metrikaId = String(window.STUDIO_CONFIG?.analytics?.metrikaId || "").trim();

  window.reachGoal = name => {
    const goal = String(name || "").trim();
    if (!goal || !metrikaId || typeof window.ym !== "function") return;
    window.ym(Number(metrikaId), "reachGoal", goal);
  };

  if (!metrikaId) return;

  (function initMetrika(m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function metrikaStub() {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j += 1) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(Number(metrikaId), "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true
  });

  window.addEventListener("studio:lead-sent", event => {
    const source = String(event.detail?.source || "").trim();
    window.reachGoal("lead_sent");
    if (source) window.reachGoal(`lead_sent_${source.replace(/\s+/g, "_").toLowerCase()}`);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioAnalytics);
} else {
  initStudioAnalytics();
}
