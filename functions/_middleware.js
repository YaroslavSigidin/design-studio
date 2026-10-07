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
  if (!redirect) return next();
  url.protocol = "https:";
  url.hostname = "soglasovano.online";
  return Response.redirect(url.href, 301);
}
