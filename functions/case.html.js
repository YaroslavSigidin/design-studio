// Legacy query URLs redirect to complete static pages. Never fetch this route
// through ASSETS: doing so can recurse through Pages routing.
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim() || "";
  const manifestResponse = await env.ASSETS.fetch(new URL("/data/cases.manifest.json", url));
  if (!manifestResponse.ok) return new Response("Service unavailable", { status: 503 });
  const manifest = await manifestResponse.json();
  const project = manifest.projects.find(item => item.id === slug || item.caseKey === slug);
  if (!project) {
    const page = await env.ASSETS.fetch(new URL("/404.html", url));
    return new Response(page.body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" } });
  }
  return Response.redirect(`https://soglasovano.online/case-${encodeURIComponent(project.id)}.html`, 301);
}
