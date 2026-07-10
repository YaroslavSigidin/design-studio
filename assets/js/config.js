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
  casePageBase: joinPath(studioBasePath, "case.html"),
  contacts: {
    name: "Ярослав Сигидин",
    telegramHandle: "sigidingo",
    telegramUrl: "https://t.me/sigidingo",
    phoneDisplay: "+7 961 971-05-15",
    phoneHref: "tel:+79619710515",
    email: "sigidingo@gmail.com",
    emailHref: "mailto:sigidingo@gmail.com"
  },
  crm: {
    provider: "amocrm",
    endpoint: "",
    timeoutMs: 12000,
    allowFallback: true
  },
  leadChannel: {
    type: "telegram"
  }
};
