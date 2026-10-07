import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../functions/case.html.js", import.meta.url), "utf8");
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const manifest = JSON.parse(await readFile(new URL("../data/cases.manifest.json", import.meta.url), "utf8"));
const env = { ASSETS: { fetch: async url => {
  const path = new URL(url).pathname;
  assert.notEqual(path, "/case.html", "Legacy route must never fetch itself");
  if (path === "/data/cases.manifest.json") return Response.json(manifest);
  assert.equal(path, "/404.html");
  return new Response('<h1>Страница не найдена</h1>', { status: 200 });
} } };
for (const project of manifest.projects) {
  for (const slug of new Set([project.id, project.caseKey])) {
    const response = await onRequest({ request: new Request(`https://soglasovano.online/case.html?slug=${slug}&utm_source=test`), env });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get("location"), `https://soglasovano.online/case-${project.id}.html`);
  }
}
for (const query of ["", "?slug=missing", "?slug=%3Cscript%3E", "?slug="]) {
  const response = await onRequest({ request: new Request(`https://soglasovano.online/case.html${query}`), env });
  assert.equal(response.status, 404);
  assert.match(response.headers.get("x-robots-tag"), /noindex/);
}
const failure = await onRequest({ request: new Request('https://soglasovano.online/case.html?slug=visiflow'), env: { ASSETS: { fetch: async () => new Response('', { status: 500 }) } } });
assert.equal(failure.status, 503);
console.log(`PASS: ${manifest.projects.length} legacy case redirects, unknown cases, and asset failure.`);

// Static cases must retain their HTML even if the manifest cannot be fetched.
const staticRoot = { dataset: { prerendered: "true" } };
Object.defineProperty(staticRoot, "innerHTML", { set() { throw new Error("Static case content was replaced"); } });
let enhanced = false;
let notified = false;
const browserContext = vm.createContext({
  document: {
    readyState: "loading", addEventListener() {},
    body: { dataset: { caseSlug: "visiflow" } },
    getElementById: id => id === "case-main" ? staticRoot : null,
    querySelector: () => null
  },
  window: { STUDIO_MEDIA: { initImageSkeletons: root => { assert.equal(root, staticRoot); enhanced = true; } },
    dispatchEvent: () => { notified = true; } },
  CustomEvent: class {},
  fetch: () => { throw new Error("Static case requested the manifest"); }
});
vm.runInContext(await readFile(new URL("../assets/js/case-page.js", import.meta.url), "utf8"), browserContext);
await vm.runInContext("initCasePage()", browserContext);
assert.ok(enhanced && notified, "Static page must initialize interactive enhancements");
console.log("PASS: static case retains HTML and initializes without a manifest request.");

const middlewareSource = await readFile(new URL("../functions/_middleware.js", import.meta.url), "utf8");
const { onRequest: canonicalize } = await import(`data:text/javascript;base64,${Buffer.from(middlewareSource).toString("base64")}`);
for (const [url, expected] of [
  ["https://www.soglasovano.online/case-visiflow.html?utm_source=test", "https://soglasovano.online/case-visiflow.html?utm_source=test"],
  ["https://soglasovano.online/home.html?utm_source=test", "https://soglasovano.online/?utm_source=test"],
  ["https://www.soglasovano.online/index.html", "https://soglasovano.online/"]
]) {
  const response = await canonicalize({ request: new Request(url), next: () => { throw new Error("Redirect was skipped"); } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), expected);
}
for (const request of [new Request("https://soglasovano.online/case-visiflow.html"),
  new Request("https://preview.pages.dev/home.html"), new Request("https://www.soglasovano.online/api/leads", { method: "POST" })]) {
  const response = await canonicalize({ request, next: () => new Response("unchanged") });
  assert.equal(await response.text(), "unchanged");
}
console.log("PASS: canonical host, homepage aliases, query preservation, preview and POST passthrough.");
