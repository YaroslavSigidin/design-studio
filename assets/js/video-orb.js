const initVideoOrb = () => {
  const orb = document.querySelector("[data-video-orb]");
  const video = orb?.querySelector("[data-video-orb-media]");
  const closeButton = orb?.querySelector("[data-video-orb-close]");
  const soundButton = orb?.querySelector("[data-video-orb-sound]");
  const toggleButton = orb?.querySelector("[data-video-orb-toggle]");
  if (!orb || !video || !closeButton || !soundButton || !toggleButton) return;
  const appearDelayMs = 10000;

  const SOUND_ON_ICON = `
    <svg class="video-orb__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14h4.2L13 18V6L8.2 10H4v4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <path d="M16.2 9.2c1.7 1.7 1.7 4 0 5.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M18.9 6.6c3.1 3.1 3.1 7.7 0 10.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;

  const SOUND_OFF_ICON = `
    <svg class="video-orb__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14h4.2L13 18V6L8.2 10H4v4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <path d="M17.5 9.4l4.1 4.1M21.6 9.4l-4.1 4.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;

  let userPaused = false;
  let inView = true;
  let appeared = false;

  const updateSoundIcon = () => {
    soundButton.innerHTML = video.muted ? SOUND_OFF_ICON : SOUND_ON_ICON;
    soundButton.setAttribute("aria-label", video.muted ? "Включить звук" : "Выключить звук");
  };

  const setPausedState = paused => {
    orb.classList.toggle("is-paused", paused);
  };

  const safePlay = () => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const canAutoPlay = () =>
    appeared &&
    !userPaused &&
    inView &&
    !document.hidden &&
    !orb.classList.contains("is-hidden") &&
    !orb.classList.contains("is-pending") &&
    !isMobileViewport();

  const syncPlayback = () => {
    if (canAutoPlay()) {
      safePlay();
      setPausedState(false);
      return;
    }
    video.pause();
    if (userPaused) setPausedState(true);
  };

  const isMobileViewport = () =>
    Boolean(window.STUDIO_PERF && !window.STUDIO_PERF.isFull) ||
    window.matchMedia("(max-width: 1100px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  video.muted = true;
  video.playsInline = true;
  video.pause();
  updateSoundIcon();
  setPausedState(false);
  orb.classList.add("is-pending");

  window.setTimeout(() => {
    if (orb.classList.contains("is-hidden")) return;
    // On phones/tablets keep the orb dormant: fixed autoplay video is a major jank source.
    if (isMobileViewport()) {
      orb.classList.add("is-hidden");
      video.pause();
      return;
    }
    orb.classList.remove("is-pending");
    appeared = true;
    syncPlayback();
  }, appearDelayMs);

  document.addEventListener("visibilitychange", syncPlayback);

  window.STUDIO_PERF?.observeVisibility?.(orb, {
    threshold: 0.05,
    rootMargin: "80px 0px",
    enter: () => {
      inView = true;
      syncPlayback();
    },
    leave: () => {
      inView = false;
      syncPlayback();
    }
  });

  closeButton.addEventListener("click", event => {
    event.preventDefault();
    orb.classList.add("is-hidden");
    userPaused = false;
    video.pause();
  });

  soundButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    video.muted = !video.muted;
    updateSoundIcon();
    if (!video.paused) return;
    userPaused = false;
    syncPlayback();
  });

  toggleButton.addEventListener("click", event => {
    event.preventDefault();
    if (orb.classList.contains("is-pending")) return;
    if (video.paused) {
      userPaused = false;
      syncPlayback();
      return;
    }

    userPaused = true;
    video.pause();
    setPausedState(true);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVideoOrb);
} else {
  initVideoOrb();
}
