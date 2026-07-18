const initNotFoundPong = () => {
  const page = document.querySelector("[data-nf-page]");
  const layer = document.querySelector("[data-nf-pong]");
  const playerEl = document.querySelector("[data-nf-player]");
  const aiEl = document.querySelector("[data-nf-ai]");
  const ballEl = document.querySelector("[data-nf-ball]");
  const scorePlayerEl = document.querySelector("[data-nf-score-player]");
  const scoreAiEl = document.querySelector("[data-nf-score-ai]");
  const backBtn = document.querySelector("[data-nf-back]");

  if (!page || !layer || !playerEl || !aiEl || !ballEl || !scorePlayerEl || !scoreAiEl) return;

  backBtn?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "./";
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    layer.style.display = "none";
    return;
  }

  const isNarrow = () => window.innerWidth <= 720;

  const state = {
    paddleHeight: isNarrow() ? 96 : 118,
    paddleWidth: isNarrow() ? 10 : 12,
    paddleMargin: isNarrow() ? 10 : 14,
    ballRadius: isNarrow() ? 6 : 7,
    playerY: 0,
    aiY: 0,
    ballX: 0,
    ballY: 0,
    vx: 0,
    vy: 0,
    lastTs: 0,
    arena: page.getBoundingClientRect(),
    scorePlayer: 0,
    scoreAi: 0,
    serveLockUntil: 0
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const syncScore = () => {
    scorePlayerEl.textContent = String(state.scorePlayer);
    scoreAiEl.textContent = String(state.scoreAi);
  };

  const refreshGeometry = () => {
    state.arena = page.getBoundingClientRect();
    state.paddleHeight = isNarrow() ? 96 : 118;
    state.paddleWidth = isNarrow() ? 10 : 12;
    state.paddleMargin = isNarrow() ? 10 : 14;
    state.ballRadius = isNarrow() ? 6 : 7;
  };

  const updatePaddles = () => {
    const { arena } = state;
    const minY = arena.top + state.paddleHeight / 2 + 8;
    const maxY = arena.bottom - state.paddleHeight / 2 - 8;
    state.playerY = clamp(state.playerY, minY, maxY);
    state.aiY = clamp(state.aiY, minY, maxY);
    playerEl.style.top = `${state.playerY - arena.top}px`;
    aiEl.style.top = `${state.aiY - arena.top}px`;
  };

  const resetBall = direction => {
    const { arena } = state;
    state.ballX = arena.left + arena.width / 2;
    state.ballY = arena.top + arena.height / 2;
    const speed = isNarrow() ? 3.8 : 4.6;
    state.vx = speed * direction;
    state.vy = (Math.random() * 3.4 - 1.7) || 1.2;
    state.serveLockUntil = performance.now() + 420;
  };

  const scorePoint = winner => {
    if (winner === "player") state.scorePlayer += 1;
    else state.scoreAi += 1;
    syncScore();
    resetBall(winner === "player" ? -1 : 1);
  };

  const intersectsRect = rect =>
    state.ballX + state.ballRadius > rect.left &&
    state.ballX - state.ballRadius < rect.right &&
    state.ballY + state.ballRadius > rect.top &&
    state.ballY - state.ballRadius < rect.bottom;

  const tick = ts => {
    if (document.hidden) {
      state.lastTs = 0;
      requestAnimationFrame(tick);
      return;
    }

    const { arena } = state;
    const dt = state.lastTs ? Math.min((ts - state.lastTs) / 16.6667, 2.2) : 1;
    state.lastTs = ts;

    const aiLag = isNarrow() ? 0.1 : 0.085;
    state.aiY += (state.ballY - state.aiY) * aiLag * dt;
    updatePaddles();

    if (ts >= state.serveLockUntil) {
      state.ballX += state.vx * dt;
      state.ballY += state.vy * dt;
    }

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
      state.vx = Math.min(Math.abs(state.vx) + 0.18, 11);
      state.vy += ((state.ballY - state.playerY) / (state.paddleHeight / 2)) * 1.1;
    }

    if (intersectsRect(aiRect) && state.vx > 0) {
      state.ballX = aiRect.left - state.ballRadius;
      state.vx = -Math.min(Math.abs(state.vx) + 0.18, 11);
      state.vy += ((state.ballY - state.aiY) / (state.paddleHeight / 2)) * 1.1;
    }

    if (state.ballX < arena.left - 36) scorePoint("ai");
    if (state.ballX > arena.right + 36) scorePoint("player");

    ballEl.style.left = `${state.ballX - arena.left}px`;
    ballEl.style.top = `${state.ballY - arena.top}px`;

    requestAnimationFrame(tick);
  };

  const setPlayerFromClientY = clientY => {
    state.playerY = clientY;
  };

  window.addEventListener("mousemove", event => setPlayerFromClientY(event.clientY), { passive: true });
  window.addEventListener(
    "touchmove",
    event => {
      const touch = event.touches?.[0];
      if (!touch) return;
      setPlayerFromClientY(touch.clientY);
    },
    { passive: true }
  );
  window.addEventListener("resize", refreshGeometry, { passive: true });

  refreshGeometry();
  state.playerY = state.arena.top + state.arena.height / 2;
  state.aiY = state.playerY;
  updatePaddles();
  syncScore();
  resetBall(Math.random() > 0.5 ? 1 : -1);
  requestAnimationFrame(tick);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNotFoundPong);
} else {
  initNotFoundPong();
}
