const markImageSkeletonState = (wrapper, state) => {
  wrapper.classList.remove("is-loading", "is-loaded", "is-error");
  wrapper.classList.add(state);
};

const bindImageSkeleton = img => {
  const wrapper = img.closest(".media-skeleton");
  if (!wrapper || wrapper.dataset.skeletonBound === "true") return;

  const finish = state => {
    markImageSkeletonState(wrapper, state);
    wrapper.dataset.skeletonBound = "true";
  };

  if (img.complete && img.naturalWidth > 0) {
    finish("is-loaded");
    return;
  }

  markImageSkeletonState(wrapper, "is-loading");

  img.addEventListener("load", () => finish("is-loaded"), { once: true });
  img.addEventListener("error", () => finish("is-error"), { once: true });
};

const initImageSkeletons = (root = document) => {
  root.querySelectorAll(".media-skeleton img").forEach(bindImageSkeleton);
};

const renderSkeletonImage = ({
  src,
  alt = "",
  loading = "lazy",
  eager = false,
  width = "",
  height = "",
  className = ""
}) => {
  if (!src) return "";

  const attrs = [
    `src="${window.__studioEscapeHtml(src)}"`,
    `alt="${window.__studioEscapeHtml(alt)}"`,
    `loading="${eager ? "eager" : loading}"`,
    'decoding="async"'
  ];

  if (eager) attrs.push('fetchpriority="high"');
  if (width) attrs.push(`width="${window.__studioEscapeHtml(width)}"`);
  if (height) attrs.push(`height="${window.__studioEscapeHtml(height)}"`);

  return `
    <div class="media-skeleton${className ? ` ${className}` : ""}">
      <div class="media-skeleton__shimmer" aria-hidden="true"></div>
      <img ${attrs.join(" ")} />
    </div>
  `;
};

window.STUDIO_MEDIA = {
  initImageSkeletons,
  renderSkeletonImage
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initImageSkeletons());
} else {
  initImageSkeletons();
}
