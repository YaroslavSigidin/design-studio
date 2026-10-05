(() => {
  const scene = document.querySelector(".ambient-scene");
  if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (document.documentElement.classList.contains("studio-perf-lite")) return;

  let frame = 0;
  let targetX = 0;
  let targetY = 0;

  const render = () => {
    frame = 0;
    scene.style.setProperty("--ambient-x", `${targetX.toFixed(1)}px`);
    scene.style.setProperty("--ambient-y", `${targetY.toFixed(1)}px`);
  };

  window.addEventListener("pointermove", event => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 18;
    targetY = (event.clientY / window.innerHeight - 0.5) * 14;
    if (!frame) frame = window.requestAnimationFrame(render);
  }, { passive: true });
})();
