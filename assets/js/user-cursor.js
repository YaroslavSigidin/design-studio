(() => {
  const ASSET_BASE = new URL("../images/ui/", document.currentScript?.src || window.location.href).href;
  const PRESS_SCALE = 0.92;
  const LABEL_TILT_STRENGTH = 25;
  const ARROW_SPRING = { stiffness: 380, damping: 32, mass: 0.6 };
  const LABEL_SPRING = { stiffness: 220, damping: 26, mass: 0.7 };
  const TILT_SPRING = { stiffness: 200, damping: 24, mass: 0.6 };
  const SCALE_SPRING = { stiffness: 500, damping: 28, mass: 0.5 };
  const SETTLE_EPS = 0.02;
  const SETTLE_VEL = 0.02;

  const shouldSkip = () => {
    if (window.STUDIO_PERF && !window.STUDIO_PERF.isFull) return true;
    if (window.matchMedia("(pointer: coarse)").matches) return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    return false;
  };

  const createSpring = (config, initial = 0) => {
    let value = initial;
    let velocity = 0;
    let target = initial;

    return {
      set(next) {
        target = next;
      },
      jump(next) {
        target = next;
        value = next;
        velocity = 0;
      },
      get() {
        return value;
      },
      settled() {
        return Math.abs(velocity) < SETTLE_VEL && Math.abs(value - target) < SETTLE_EPS;
      },
      step(dt) {
        const seconds = Math.min(0.032, Math.max(0.001, dt / 1000));
        const { stiffness, damping, mass } = config;
        const force = -stiffness * (value - target);
        const accel = (force - damping * velocity) / mass;
        velocity += accel * seconds;
        value += velocity * seconds;
        if (Math.abs(velocity) < SETTLE_EPS && Math.abs(value - target) < SETTLE_EPS) {
          value = target;
          velocity = 0;
        }
        return value;
      }
    };
  };

  const initUserCursor = () => {
    if (shouldSkip()) return;
    if (document.getElementById("studioUserCursor")) return;

    const labelOffset = { x: 25, y: 12 };
    const root = document.createElement("div");
    root.id = "studioUserCursor";
    root.className = "studio-user-cursor";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="studio-user-cursor__layer">
        <div class="studio-user-cursor__label">
          <img src="${ASSET_BASE}cursor-you.svg" alt="" />
        </div>
        <div class="studio-user-cursor__arrow">
          <img src="${ASSET_BASE}cursor-arrow.svg" alt="" />
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const labelEl = root.querySelector(".studio-user-cursor__label");
    const arrowEl = root.querySelector(".studio-user-cursor__arrow");

    const arrowX = createSpring(ARROW_SPRING, -9999);
    const arrowY = createSpring(ARROW_SPRING, -9999);
    const labelX = createSpring(LABEL_SPRING, -9999);
    const labelY = createSpring(LABEL_SPRING, -9999);
    const tilt = createSpring(TILT_SPRING, 0);
    const scale = createSpring(SCALE_SPRING, 1);
    const springs = [arrowX, arrowY, labelX, labelY, tilt, scale];

    let hovering = false;
    let raf = 0;
    let lastTs = 0;
    let lastSample = null;
    let running = false;
    let pausedByVisibility = false;

    const setVisible = visible => {
      root.classList.toggle("is-visible", visible);
    };

    const paint = () => {
      const ax = arrowX.get();
      const ay = arrowY.get();
      const lx = labelX.get() + labelOffset.x;
      const ly = labelY.get() + labelOffset.y;
      const s = scale.get();
      const r = tilt.get();
      arrowEl.style.transform = `translate3d(${ax}px, ${ay}px, 0) scale(${s})`;
      labelEl.style.transform = `translate3d(${lx}px, ${ly}px, 0) rotate(${r}deg) scale(${s})`;
    };

    const stopLoop = () => {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
      running = false;
      lastTs = 0;
    };

    const tick = ts => {
      if (pausedByVisibility || !running) {
        raf = 0;
        return;
      }

      const dt = lastTs ? ts - lastTs : 16;
      lastTs = ts;

      springs.forEach(spring => spring.step(dt));
      paint();

      if (springs.every(spring => spring.settled())) {
        stopLoop();
        return;
      }

      raf = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (pausedByVisibility || running) return;
      running = true;
      lastTs = 0;
      raf = window.requestAnimationFrame(tick);
    };

    const onMove = event => {
      const x = event.clientX;
      const y = event.clientY;
      const now = performance.now();
      let vx = 0;
      let vy = 0;
      if (lastSample) {
        const sampleDt = Math.max(1, now - lastSample.t);
        vx = ((x - lastSample.x) / sampleDt) * 1000;
        vy = ((y - lastSample.y) / sampleDt) * 1000;
      }
      lastSample = { x, y, t: now };

      if (!hovering) {
        hovering = true;
        arrowX.jump(x);
        arrowY.jump(y);
        labelX.jump(x);
        labelY.jump(y);
        // Keep the native pointer until the custom cursor has a real position.
        // This avoids a blank/jumping cursor during the first paint and when a
        // user lands directly on an animated section such as Services.
        document.documentElement.classList.add("studio-user-cursor-active");
        setVisible(true);
      } else {
        arrowX.set(x);
        arrowY.set(y);
        labelX.set(x);
        labelY.set(y);
      }

      const speed = Math.hypot(vx, vy);
      const norm = Math.min(1, speed / 1500);
      const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1;
      tilt.set(sign * norm * LABEL_TILT_STRENGTH);
      startLoop();
    };

    const onDown = () => {
      scale.set(PRESS_SCALE);
      startLoop();
    };

    const onUp = () => {
      scale.set(1);
      startLoop();
    };

    const onLeave = () => {
      hovering = false;
      lastSample = null;
      tilt.set(0);
      setVisible(false);
      stopLoop();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    const stopVisibility = window.STUDIO_PERF?.pauseWhenHidden?.({
      start: () => {
        pausedByVisibility = false;
        if (hovering) startLoop();
      },
      stop: () => {
        pausedByVisibility = true;
        stopLoop();
      }
    });

    window.STUDIO_USER_CURSOR = {
      destroy() {
        stopLoop();
        stopVisibility?.();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousedown", onDown);
        window.removeEventListener("mouseup", onUp);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("blur", onLeave);
        root.remove();
        document.documentElement.classList.remove("studio-user-cursor-active");
      }
    };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUserCursor);
  } else {
    initUserCursor();
  }
})();
