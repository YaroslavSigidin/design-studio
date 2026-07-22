const initStudioAnalytics = () => {
  const metrikaId = String(window.STUDIO_CONFIG?.analytics?.metrikaId || "").trim();

  window.reachGoal = (name, params = {}) => {
    const goal = String(name || "").trim();
    if (!goal || !metrikaId || typeof window.ym !== "function") return;
    window.ym(Number(metrikaId), "reachGoal", goal, params);
  };

  const track = (name, detail = {}) => {
    window.reachGoal(name, detail);
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

    const experiment = window.STUDIO_EXPERIMENT;
    if (experiment?.active) {
      const experimentParams = {
        experiment: experiment.id,
        variant: experiment.variant,
        assignment: experiment.assignment
      };
      window.ym(Number(metrikaId), "params", {
        experiments: { [experiment.id]: experiment.variant }
      });
      window.ym(Number(metrikaId), "reachGoal", "experiment_view", experimentParams);
    }
  }

  if (document.body?.dataset?.seoPage === "insights") {
    track("insights_view", {
      articleCount: document.querySelectorAll("[data-insight-id]").length,
      page: "insights"
    });
  }

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
    if (!target) return;

    if (target.matches("[data-open-brief-modal], [data-hero-submit], [data-offer-cta], .case-brief")) {
      track("cta_click", { label: String(target.textContent || target.getAttribute("aria-label") || "").trim().slice(0, 80) });
      return;
    }

    const insightCta = target.closest("[data-insight-cta]");
    if (insightCta) {
      track("insight_cta_click", {
        article: insightCta.getAttribute("data-insight-article") || "hero",
        label: insightCta.getAttribute("data-insight-label") || String(insightCta.textContent || "").trim().slice(0, 80)
      });
      return;
    }

    const insightLink = target.closest("[data-insight-link]");
    if (insightLink) {
      track("insight_open", {
        article: insightLink.getAttribute("data-insight-id") || ""
      });
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
