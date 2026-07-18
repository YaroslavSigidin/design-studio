(() => {
  const subscribers = new Set();
  let bound = false;
  let lastY = window.scrollY;
  let lastDir = 0;

  const notify = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    if (delta > 0.5) lastDir = 1;
    else if (delta < -0.5) lastDir = -1;
    lastY = y;

    const payload = { y, delta, direction: lastDir, viewportHeight: window.innerHeight };
    subscribers.forEach(fn => {
      try {
        fn(payload);
      } catch {
        /* keep bus alive */
      }
    });
  };

  const onScroll =
    typeof window.STUDIO_PERF?.rafThrottle === "function"
      ? window.STUDIO_PERF.rafThrottle(notify)
      : (() => {
          let frame = 0;
          return () => {
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
              frame = 0;
              notify();
            });
          };
        })();

  const ensureBound = () => {
    if (bound) return;
    bound = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  };

  const subscribe = fn => {
    if (typeof fn !== "function") return () => {};
    ensureBound();
    subscribers.add(fn);
    fn({
      y: window.scrollY,
      delta: 0,
      direction: lastDir,
      viewportHeight: window.innerHeight
    });
    return () => {
      subscribers.delete(fn);
    };
  };

  window.STUDIO_SCROLL = {
    subscribe,
    get y() {
      return window.scrollY;
    },
    get direction() {
      return lastDir;
    }
  };
})();
