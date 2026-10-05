const initHeroVideo = () => {
  const video = document.querySelector("[data-hero-video]");
  if (!(video instanceof HTMLVideoElement)) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fadeDuration = 250;
  let animationFrame = 0;
  let fadingOut = false;

  const fadeTo = targetOpacity => {
    window.cancelAnimationFrame(animationFrame);
    const startOpacity = Number.parseFloat(video.style.opacity || getComputedStyle(video).opacity) || 0;
    const startTime = performance.now();

    const step = now => {
      const progress = Math.min((now - startTime) / fadeDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      video.style.opacity = String(startOpacity + (targetOpacity - startOpacity) * eased);
      if (progress < 1) animationFrame = window.requestAnimationFrame(step);
    };

    animationFrame = window.requestAnimationFrame(step);
  };

  if (reduceMotion) {
    video.style.opacity = "1";
    video.addEventListener("loadeddata", () => {
      video.currentTime = 0;
      video.pause();
    }, { once: true });
    return;
  }

  const startPlayback = () => {
    fadingOut = false;
    fadeTo(1);
    video.play().catch(() => {
      video.style.opacity = "1";
    });
  };

  video.addEventListener("loadeddata", startPlayback, { once: true });
  video.addEventListener("timeupdate", () => {
    if (!Number.isFinite(video.duration)) return;
    if (video.duration - video.currentTime <= 0.55 && !fadingOut) {
      fadingOut = true;
      fadeTo(0);
    }
  });
  video.addEventListener("ended", () => {
    window.cancelAnimationFrame(animationFrame);
    video.style.opacity = "0";
    window.setTimeout(() => {
      video.currentTime = 0;
      startPlayback();
    }, 100);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroVideo);
} else {
  initHeroVideo();
}
