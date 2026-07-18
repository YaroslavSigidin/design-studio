const initHeroPong = () => {
  const layer = document.querySelector("[data-hero-pong-layer]");
  const playerPaddleEl = document.querySelector("[data-pong-player]");
  const aiPaddleEl = document.querySelector("[data-pong-ai]");
  const ballEl = document.querySelector("[data-pong-ball]");
  const heroPage = document.querySelector(".hero-page");
  if (!layer || !playerPaddleEl || !aiPaddleEl || !ballEl || !heroPage) return;

  const perf = window.STUDIO_PERF;
  if (!perf?.canAnimateHeavy) {
    layer.style.display = "none";
    return;
  }

  const MIN_SPEED = 6.2;
  const MAX_SPEED = 14;
  const BASE_SPEED = 7.4;

  const state = {
    paddleHeight: 118,
    paddleWidth: 12,
    paddleMargin: 14,
    ballRadius: 7,
    playerY: window.innerHeight * 0.5,
    aiY: window.innerHeight * 0.5,
    ballX: window.innerWidth * 0.5,
    ballY: window.innerHeight * 0.5,
    vx: BASE_SPEED,
    vy: 3.6,
    lastTs: 0,
    arena: heroPage.getBoundingClientRect(),
    blockers: [],
    stuckFrames: 0,
    running: false,
    frame: 0
  };

  const blockersSelectors = [
    "[data-floating-header]",
    ".hero-title",
    ".hero-subtitle",
    ".hero-search-wrap",
    ".hero-partners",
    ".studio-stats",
    ".hero-badge"
  ];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const enforceSpeed = () => {
    const speed = Math.hypot(state.vx, state.vy);
    if (!Number.isFinite(speed) || speed < 0.01) {
      state.vx = BASE_SPEED * (Math.random() > 0.5 ? 1 : -1);
      state.vy = Math.random() * 4 - 2 || 2;
      return;
    }
    if (speed < MIN_SPEED) {
      const scale = MIN_SPEED / speed;
      state.vx *= scale;
      state.vy *= scale;
      return;
    }
    if (speed > MAX_SPEED) {
      const scale = MAX_SPEED / speed;
      state.vx *= scale;
      state.vy *= scale;
    }
  };

  const resetBall = direction => {
    const arena = state.arena;
    state.ballX = arena.left + arena.width / 2;
    state.ballY = arena.top + arena.height / 2;
    state.vx = BASE_SPEED * direction;
    state.vy = Math.random() * 5.2 - 2.6 || 2.2;
    state.stuckFrames = 0;
    enforceSpeed();
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

    const playerTop = state.playerY - arena.top - state.paddleHeight / 2;
    const aiTop = state.aiY - arena.top - state.paddleHeight / 2;
    playerPaddleEl.style.transform = `translate3d(0, ${playerTop.toFixed(2)}px, 0)`;
    aiPaddleEl.style.transform = `translate3d(0, ${aiTop.toFixed(2)}px, 0)`;
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

    if (minOverlap === overlapLeft && state.vx > 0) {
      state.ballX = rect.left - state.ballRadius - 0.5;
      state.vx = -Math.abs(state.vx);
      return;
    }
    if (minOverlap === overlapRight && state.vx < 0) {
      state.ballX = rect.right + state.ballRadius + 0.5;
      state.vx = Math.abs(state.vx);
      return;
    }
    if (minOverlap === overlapTop && state.vy > 0) {
      state.ballY = rect.top - state.ballRadius - 0.5;
      state.vy = -Math.abs(state.vy);
      return;
    }
    if (minOverlap === overlapBottom && state.vy < 0) {
      state.ballY = rect.bottom + state.ballRadius + 0.5;
      state.vy = Math.abs(state.vy);
      return;
    }

    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
      const goLeft = overlapLeft <= overlapRight;
      state.ballX = goLeft ? rect.left - state.ballRadius - 1 : rect.right + state.ballRadius + 1;
      state.vx = Math.abs(state.vx || BASE_SPEED) * (goLeft ? -1 : 1);
    } else {
      const goUp = overlapTop <= overlapBottom;
      state.ballY = goUp ? rect.top - state.ballRadius - 1 : rect.bottom + state.ballRadius + 1;
      state.vy = Math.abs(state.vy || BASE_SPEED * 0.55) * (goUp ? -1 : 1);
    }
  };

  const renderBall = () => {
    const x = state.ballX - state.arena.left - state.ballRadius;
    const y = state.ballY - state.arena.top - state.ballRadius;
    ballEl.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  };

  const tick = ts => {
    if (!state.running) {
      state.frame = 0;
      return;
    }

    const arena = state.arena;
    const dt = state.lastTs ? Math.min((ts - state.lastTs) / 16.6667, 2.4) : 1;
    state.lastTs = ts;

    state.aiY += (state.ballY - state.aiY) * 0.11 * dt;
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
      state.vx = Math.abs(state.vx) + 0.28;
      state.vy += ((state.ballY - state.playerY) / (state.paddleHeight / 2)) * 1.05;
    }

    if (intersectsRect(aiRect) && state.vx > 0) {
      state.ballX = aiRect.left - state.ballRadius;
      state.vx = -Math.abs(state.vx) - 0.28;
      state.vy += ((state.ballY - state.aiY) / (state.paddleHeight / 2)) * 1.05;
    }

    let hitBlocker = false;
    for (let i = 0; i < state.blockers.length; i += 1) {
      const rect = state.blockers[i];
      if (!intersectsRect(rect)) continue;
      bounceFromRect(rect);
      hitBlocker = true;
      break;
    }

    if (hitBlocker) {
      state.stuckFrames += 1;
      if (state.stuckFrames > 18) resetBall(state.vx >= 0 ? 1 : -1);
    } else {
      state.stuckFrames = 0;
    }

    enforceSpeed();

    if (state.ballX < arena.left - 40) resetBall(1);
    if (state.ballX > arena.right + 40) resetBall(-1);

    renderBall();
    state.frame = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (state.running || !perf.canAnimateHeavy) return;
    state.running = true;
    state.lastTs = 0;
    refreshGeometry();
    updatePaddles();
    state.frame = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    state.running = false;
    state.lastTs = 0;
    if (state.frame) {
      window.cancelAnimationFrame(state.frame);
      state.frame = 0;
    }
  };

  window.addEventListener(
    "mousemove",
    event => {
      state.playerY = event.clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (!state.running) return;
      refreshGeometry();
      updatePaddles();
    },
    { passive: true }
  );

  const onScroll = perf.rafThrottle(() => {
    if (!state.running) return;
    refreshGeometry();
  });
  window.addEventListener("scroll", onScroll, { passive: true });

  refreshGeometry();
  updatePaddles();
  resetBall(Math.random() > 0.5 ? 1 : -1);
  renderBall();

  perf.pauseWhenHidden({ start, stop });
  perf.observeVisibility(heroPage, {
    enter: start,
    leave: stop,
    threshold: 0.08
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroPong);
} else {
  initHeroPong();
}
