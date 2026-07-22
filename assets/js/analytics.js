const initStudioAnalytics = () => {
  const metrikaId = String(window.STUDIO_CONFIG?.analytics?.metrikaId || "").trim();

  window.reachGoal = name => {
    const goal = String(name || "").trim();
    if (!goal || !metrikaId || typeof window.ym !== "function") return;
    window.ym(Number(metrikaId), "reachGoal", goal);
  };

  const track = (name, detail = {}) => {
    window.reachGoal(name);
    window.dispatchEvent(
      new CustomEvent("studio:analytics", {
        detail: { name, ...detail }
      })
    );
  };

  window.STUDIO_ANALYTICS = { track, reachGoal: window.reachGoal };

  if (metrikaId) {
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
  }

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
    if (!target) return;

    if (target.matches("[data-open-brief-modal], [data-hero-submit], .case-brief")) {
      track("cta_click", { label: String(target.textContent || target.getAttribute("aria-label") || "").trim().slice(0, 80) });
      return;
    }

    const href = target instanceof HTMLAnchorElement ? String(target.getAttribute("href") || "") : "";
    if (/^(tel:|mailto:|https:\/\/t\.me\/|https:\/\/vk\.com\/)/i.test(href)) {
      track("contact_click", { channel: href.split(":")[0] || "social" });
      return;
    }

    if (href.includes("case.html?slug=")) {
      track("case_open", { slug: new URL(href, window.location.href).searchParams.get("slug") || "" });
    }
  });

  // Only confirmed backend delivery.
  window.addEventListener("studio:lead-sent", event => {
    const source = String(event.detail?.source || "").trim();
    track("lead_success", { source, requestId: event.detail?.requestId || "" });
    track("lead_submit", { source, outcome: "success" });
    if (source) track(`lead_sent_${source.replace(/\s+/g, "_").toLowerCase()}`);
  });

  window.addEventListener("studio:lead-fallback", event => {
    const source = String(event.detail?.source || "").trim();
    track("lead_error", { source, outcome: "fallback_opened" });
    track("lead_submit", { source, outcome: "fallback_opened" });
  });

  window.addEventListener("studio:lead-error", event => {
    const source = String(event.detail?.source || "").trim();
    track("lead_error", {
      source,
      code: event.detail?.code || "DELIVERY_FAILED",
      requestId: event.detail?.requestId || ""
    });
    track("lead_submit", { source, outcome: "error" });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioAnalytics);
} else {
  initStudioAnalytics();
}
