(() => {
  const mq = {
    coarse: window.matchMedia("(pointer: coarse)"),
    narrow: window.matchMedia("(max-width: 1100px)"),
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)")
  };

  const readSaveData = () => navigator.connection?.saveData === true;
  const readLowCore = () =>
    Number.isFinite(navigator.hardwareConcurrency) && navigator.hardwareConcurrency > 0
      ? navigator.hardwareConcurrency <= 4
      : false;

  const syncHtmlFlags = () => {
    const root = document.documentElement;
    const lite =
      mq.coarse.matches || mq.narrow.matches || mq.reduced.matches || readSaveData() || readLowCore();
    root.classList.toggle("studio-perf-lite", lite);
    root.classList.toggle("studio-perf-coarse", mq.coarse.matches);
    root.classList.toggle("studio-perf-narrow", mq.narrow.matches);
    root.classList.toggle("studio-perf-reduced", mq.reduced.matches);
  };

  const rafThrottle = fn => {
    let frame = 0;
    let latestArgs = null;
    return (...args) => {
      latestArgs = args;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        fn(...(latestArgs || []));
      });
    };
  };

  const pauseWhenHidden = ({ start, stop } = {}) => {
    const sync = () => {
      if (document.hidden) stop?.();
      else start?.();
    };
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => document.removeEventListener("visibilitychange", sync);
  };

  const observeVisibility = (element, { enter, leave, threshold = 0.01, rootMargin = "0px" } = {}) => {
    if (!element || typeof IntersectionObserver !== "function") {
      enter?.();
      return () => {};
    }
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting);
        if (next === visible) return;
        visible = next;
        if (next) enter?.();
        else leave?.();
      },
      { threshold, rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  };

  const perf = {
    get isCoarse() {
      return mq.coarse.matches;
    },
    get isNarrow() {
      return mq.narrow.matches;
    },
    get prefersReducedMotion() {
      return mq.reduced.matches;
    },
    get saveData() {
      return readSaveData();
    },
    get lowCore() {
      return readLowCore();
    },
    get isLite() {
      return (
        this.isCoarse ||
        this.isNarrow ||
        this.prefersReducedMotion ||
        this.saveData ||
        this.lowCore
      );
    },
    get canAnimateHeavy() {
      return !this.isLite && !document.hidden;
    },
    rafThrottle,
    pauseWhenHidden,
    observeVisibility,
    syncHtmlFlags
  };

  window.STUDIO_PERF = perf;
  syncHtmlFlags();

  const resync = () => syncHtmlFlags();
  Object.values(mq).forEach(query => {
    if (typeof query.addEventListener === "function") query.addEventListener("change", resync);
    else if (typeof query.addListener === "function") query.addListener(resync);
  });
})();
