/** Пути к ресурсам студии с поддержкой локального сервера и GitHub Pages. */
const detectStudioBasePath = () => {
  const pathname = window.location.pathname || "/";

  if (pathname.endsWith("/")) return pathname;

  const slashIndex = pathname.lastIndexOf("/");
  return slashIndex >= 0 ? pathname.slice(0, slashIndex + 1) : "/";
};

const joinPath = (base, suffix) => `${base.replace(/\/+$/, "")}/${suffix.replace(/^\/+/, "")}`;

const studioBasePath = detectStudioBasePath();

window.STUDIO_CONFIG = {
  basePath: studioBasePath,
  assetBasePath: studioBasePath,
  manifest: joinPath(studioBasePath, "data/cases.manifest.json"),
  studioHome: studioBasePath,
  studioCases: `${studioBasePath}#cases`,
  casePageBase: joinPath(studioBasePath, "case.html")
};
