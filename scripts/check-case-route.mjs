import assert from "node:assert/strict";
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
