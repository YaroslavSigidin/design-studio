// Canonicalize the public host in Functions: Pages _redirects does not support domains.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  const production = url.hostname === "soglasovano.online" || url.hostname === "www.soglasovano.online";
  if (!production) return next();
  let redirect = url.hostname === "www.soglasovano.online";
  if (["/index.html", "/home.html", "/index.php"].includes(url.pathname)) {
    url.pathname = "/";
    redirect = true;
  }
  // Keep one public URL format. Cloudflare Pages serves these files at clean
  // paths, so explicit redirects must agree with canonicals and the sitemap.
  if (
    url.pathname.endsWith(".html") &&
    url.pathname !== "/case.html" &&
    !url.pathname.startsWith("/yandex_")
  ) {
    url.pathname = url.pathname.slice(0, -5);
    redirect = true;
  }
  if (!redirect) return next();
  url.protocol = "https:";
  url.hostname = "soglasovano.online";
  return Response.redirect(url.href, 301);
}
