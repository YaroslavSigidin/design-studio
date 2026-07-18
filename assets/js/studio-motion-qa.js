(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("motionQa") !== "1" && !window.__STUDIO_MOTION_QA__) return;

  const log = (...args) => console.info("[motion-qa]", ...args);

  const checklist = () => {
    const perf = window.STUDIO_PERF;
    const profile = perf?.profile || document.documentElement.dataset.studioPerf || "?";
    const scrollBus = Boolean(window.STUDIO_SCROLL?.subscribe);
    const cursor = Boolean(document.getElementById("studioUserCursor"));
    const arc = Boolean(document.querySelector(".studio-services-carousel.is-arc"));
    const casesMore = document.getElementById("studioCasesMore");
    const collapsed = document.getElementById("studioCasesStack")?.classList.contains("is-collapsed");

    const report = {
      profile,
      flags: {
        full: document.documentElement.classList.contains("studio-perf-full"),
        balanced: document.documentElement.classList.contains("studio-perf-balanced"),
        lite: document.documentElement.classList.contains("studio-perf-lite"),
        reduced: document.documentElement.classList.contains("studio-perf-reduced")
      },
      scrollBus,
      cursorMounted: cursor,
      servicesArc: arc,
      casesMoreHidden: casesMore ? casesMore.hidden : null,
      casesCollapsed: Boolean(collapsed),
      canAnimateHeavy: Boolean(perf?.canAnimateHeavy),
      canAnimateMid: Boolean(perf?.canAnimateMid)
    };

    log("snapshot", report);
    log("manual checklist:");
    log("1. Desktop Chrome Perf: scroll homepage 5s — FPS ≥55");
    log("2. Services arc drag/click — no left/top jank");
    log("3. Cases tabs ×3 — no veil when ≤6 cards");
    log("4. Idle 3s with cursor — RAF should sleep (Performance monitor)");
    log("5. Narrow / mobile emulate — profile=balanced, no cursor/pong");
    log("6. prefers-reduced-motion — profile=lite, instant reveals");
    return report;
  };

  const boot = () => {
    checklist();
    window.STUDIO_MOTION_QA = { checklist };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(boot, 80));
  } else {
    window.setTimeout(boot, 80);
  }
})();
