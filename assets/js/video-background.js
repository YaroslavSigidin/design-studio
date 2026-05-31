/**
 * Custom rAF fade for hero video — no CSS transitions on opacity.
 */
const initVideoBackground = () => {
  const video = document.querySelector("[data-hero-video]");
  if (!video) return;

  const FADE_MS = 250;
  const FADE_OUT_BEFORE_END = 0.55;
  const LOOP_DELAY_MS = 100;

  let fadeRaf = null;
  let fadingOutRef = false;

  const readOpacity = () => {
    const value = parseFloat(video.style.opacity);
    return Number.isFinite(value) ? value : 0;
  };

  const cancelFade = () => {
    if (fadeRaf !== null) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
  };

  const fadeTo = (targetOpacity, durationMs, onComplete) => {
    cancelFade();
    const from = readOpacity();
    const start = performance.now();

    const tick = now => {
      const progress = Math.min(1, (now - start) / durationMs);
      video.style.opacity = String(from + (targetOpacity - from) * progress);
      if (progress < 1) {
        fadeRaf = requestAnimationFrame(tick);
        return;
      }
      fadeRaf = null;
      onComplete?.();
    };

    fadeRaf = requestAnimationFrame(tick);
  };

  const fadeIn = onComplete => fadeTo(1, FADE_MS, onComplete);
  const fadeOut = onComplete => fadeTo(0, FADE_MS, onComplete);

  const handleLoopRestart = () => {
    fadingOutRef = false;
    video.style.opacity = "0";
    window.setTimeout(() => {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise?.catch) playPromise.catch(() => {});
      fadeIn();
    }, LOOP_DELAY_MS);
  };

  video.style.opacity = "0";

  video.addEventListener("loadeddata", () => {
    fadingOutRef = false;
    fadeIn();
  });

  video.addEventListener("play", () => {
    if (readOpacity() === 0 && !fadingOutRef) {
      fadeIn();
    }
  });

  video.addEventListener("timeupdate", () => {
    if (fadingOutRef || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const remaining = video.duration - video.currentTime;
    if (remaining <= FADE_OUT_BEFORE_END) {
      fadingOutRef = true;
      fadeOut();
    }
  });

  video.addEventListener("ended", handleLoopRestart);

  if (video.readyState >= 2) {
    fadingOutRef = false;
    fadeIn();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVideoBackground);
} else {
  initVideoBackground();
}
