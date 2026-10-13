(() => {
  const desktop = window.matchMedia("(min-width: 1101px) and (pointer: fine)");
  if (!desktop.matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const base = new URL("./", document.currentScript?.src || window.location.href);
  [
    ["user-cursor.js", "20261008-new-cursor"],
    ["ambient-background.js", "20261012-mobile-performance"],
    ["hero-pong.js", "20261008-paddle-svg"]
  ].forEach(([file, version]) => {
    const script = document.createElement("script");
    script.src = new URL(`${file}?v=${version}`, base).href;
    script.async = true;
    document.head.appendChild(script);
  });
})();
