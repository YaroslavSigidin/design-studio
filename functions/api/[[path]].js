/**
 * Proxy /api/* to Timeweb origin so forms work on Cloudflare Pages worldwide.
 * Browser → Cloudflare (reachable from Vietnam) → Timeweb PHP.
 */
export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  const targetUrl = `https://soglasovano.online${incoming.pathname}${incoming.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete("host");
  headers.set("Host", "soglasovano.online");

  const init = {
    method: context.request.method,
    headers,
    redirect: "manual"
  };

  if (!["GET", "HEAD"].includes(context.request.method)) {
    init.body = context.request.body;
  }

  try {
    const response = await fetch(targetUrl, init);
    const outHeaders = new Headers(response.headers);
    outHeaders.set("Access-Control-Allow-Origin", incoming.origin || "*");
    outHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    outHeaders.set("Access-Control-Allow-Headers", "Content-Type");
    outHeaders.set("Vary", "Origin");

    if (context.request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: outHeaders });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        code: "DELIVERY_FAILED",
        error: "Cloudflare could not reach the lead origin."
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
}
