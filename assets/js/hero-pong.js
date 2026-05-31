const initHeroPong = () => {
  const layer = document.querySelector("[data-hero-pong-layer]");
  const playerPaddleEl = document.querySelector("[data-pong-player]");
  const aiPaddleEl = document.querySelector("[data-pong-ai]");
  const ballEl = document.querySelector("[data-pong-ball]");
  const heroPage = document.querySelector(".hero-page");
  if (!layer || !playerPaddleEl || !aiPaddleEl || !ballEl || !heroPage) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const lowEndCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (reducedMotion || saveData || lowEndCpu || coarsePointer) {
    layer.style.display = "none";
    return;
  }

  const state = {
    paddleHeight: 118,
    paddleWidth: 12,
    paddleMargin: 14,
    ballRadius: 7,
    playerY: window.innerHeight * 0.5,
    aiY: window.innerHeight * 0.5,
    ballX: window.innerWidth * 0.5,
    ballY: window.innerHeight * 0.5,
    vx: 4.4,
    vy: 2.7,
    lastTs: 0,
    lastFrameTs: 0,
    arena: heroPage.getBoundingClientRect(),
    blockers: []
  };

  const blockersSelectors = [
    "[data-floating-header]",
    ".hero-title",
    ".hero-subtitle",
    ".hero-search-wrap",
    ".hero-badge"
  ];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const resetBall = direction => {
    const arena = state.arena;
    state.ballX = arena.left + arena.width / 2;
    state.ballY = arena.top + arena.height / 2;
    state.vx = 4.1 * direction;
    state.vy = (Math.random() * 3.2 - 1.6) || 1.1;
  };

  const refreshGeometry = () => {
    state.arena = heroPage.getBoundingClientRect();
    state.blockers = blockersSelectors
      .map(selector => document.querySelector(selector))
      .filter(Boolean)
      .map(node => node.getBoundingClientRect())
      .filter(rect => rect.width > 0 && rect.height > 0);
  };

  const updatePaddles = () => {
    const arena = state.arena;
    const minY = arena.top + state.paddleHeight / 2 + 8;
    const maxY = arena.bottom - state.paddleHeight / 2 - 8;

    state.playerY = clamp(state.playerY, minY, maxY);
    state.aiY = clamp(state.aiY, minY, maxY);

    playerPaddleEl.style.top = `${state.playerY - arena.top}px`;
    aiPaddleEl.style.top = `${state.aiY - arena.top}px`;
  };

  const intersectsRect = rect =>
    state.ballX + state.ballRadius > rect.left &&
    state.ballX - state.ballRadius < rect.right &&
    state.ballY + state.ballRadius > rect.top &&
    state.ballY - state.ballRadius < rect.bottom;

  const bounceFromRect = rect => {
    const overlapLeft = state.ballX + state.ballRadius - rect.left;
    const overlapRight = rect.right - (state.ballX - state.ballRadius);
    const overlapTop = state.ballY + state.ballRadius - rect.top;
    const overlapBottom = rect.bottom - (state.ballY - state.ballRadius);
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft) {
      state.ballX = rect.left - state.ballRadius;
      state.vx = -Math.abs(state.vx);
      return;
    }
    if (minOverlap === overlapRight) {
      state.ballX = rect.right + state.ballRadius;
      state.vx = Math.abs(state.vx);
      return;
    }
    if (minOverlap === overlapTop) {
      state.ballY = rect.top - state.ballRadius;
      state.vy = -Math.abs(state.vy);
      return;
    }
    state.ballY = rect.bottom + state.ballRadius;
    state.vy = Math.abs(state.vy);
  };

  const tick = ts => {
    if (document.hidden) {
      state.lastTs = 0;
      requestAnimationFrame(tick);
      return;
    }

    if (state.lastFrameTs && ts - state.lastFrameTs < 33) {
      requestAnimationFrame(tick);
      return;
    }
    state.lastFrameTs = ts;

    const arena = state.arena;
    if (arena.bottom < 0 || arena.top > window.innerHeight) {
      state.lastTs = 0;
      requestAnimationFrame(tick);
      return;
    }

    const dt = state.lastTs ? Math.min((ts - state.lastTs) / 16.6667, 2) : 1;
    state.lastTs = ts;

    state.aiY += (state.ballY - state.aiY) * 0.08 * dt;
    updatePaddles();

    state.ballX += state.vx * dt;
    state.ballY += state.vy * dt;

    const topBound = arena.top + state.ballRadius + 4;
    const bottomBound = arena.bottom - state.ballRadius - 4;
    if (state.ballY <= topBound) {
      state.ballY = topBound;
      state.vy = Math.abs(state.vy);
    } else if (state.ballY >= bottomBound) {
      state.ballY = bottomBound;
      state.vy = -Math.abs(state.vy);
    }

    const playerRect = {
      left: arena.left + state.paddleMargin,
      right: arena.left + state.paddleMargin + state.paddleWidth,
      top: state.playerY - state.paddleHeight / 2,
      bottom: state.playerY + state.paddleHeight / 2
    };
    const aiRect = {
      left: arena.right - state.paddleMargin - state.paddleWidth,
      right: arena.right - state.paddleMargin,
      top: state.aiY - state.paddleHeight / 2,
      bottom: state.aiY + state.paddleHeight / 2
    };

    if (intersectsRect(playerRect) && state.vx < 0) {
      state.ballX = playerRect.right + state.ballRadius;
      state.vx = Math.abs(state.vx) + 0.12;
      state.vy += ((state.ballY - state.playerY) / (state.paddleHeight / 2)) * 0.7;
    }

    if (intersectsRect(aiRect) && state.vx > 0) {
      state.ballX = aiRect.left - state.ballRadius;
      state.vx = -Math.abs(state.vx) - 0.12;
      state.vy += ((state.ballY - state.aiY) / (state.paddleHeight / 2)) * 0.7;
    }

    state.blockers.forEach(rect => {
      if (intersectsRect(rect)) bounceFromRect(rect);
    });

    if (state.ballX < arena.left - 40) resetBall(1);
    if (state.ballX > arena.right + 40) resetBall(-1);

    ballEl.style.left = `${state.ballX - arena.left}px`;
    ballEl.style.top = `${state.ballY - arena.top}px`;

    requestAnimationFrame(tick);
  };

  const handlePointerMove = event => {
    state.playerY = event.clientY;
  };

  window.addEventListener("mousemove", handlePointerMove, { passive: true });
  window.addEventListener("touchmove", event => {
    const touch = event.touches?.[0];
    if (!touch) return;
    state.playerY = touch.clientY;
  }, { passive: true });
  window.addEventListener("resize", refreshGeometry, { passive: true });
  window.addEventListener("scroll", refreshGeometry, { passive: true });

  const geometryTimer = window.setInterval(refreshGeometry, 280);
  window.addEventListener("beforeunload", () => window.clearInterval(geometryTimer), { once: true });

  refreshGeometry();
  updatePaddles();
  resetBall(Math.random() > 0.5 ? 1 : -1);
  requestAnimationFrame(tick);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroPong);
} else {
  initHeroPong();
}
