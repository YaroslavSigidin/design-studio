const ORIGIN = "https://soglasovano.online";
const INDEXNOW_KEY = "2c408abdfc7183227fa8b2465e0c569a";

const failures = [];
const pass = message => console.log(`PASS ${message}`);
const fail = message => {
  failures.push(message);
  console.error(`FAIL ${message}`);
};

const request = async (path, options = {}) => {
  const url = path.startsWith("http") ? path : `${ORIGIN}${path}`;
  const response = await fetch(url, options);
  const body = await response.text();
  return { response, body };
};

const check = (condition, message) => (condition ? pass(message) : fail(message));

const home = await request("/");
check(home.response.status === 200, "home returns HTTP 200");
check(home.body.includes("<title>Дизайн-студия сайтов и интерфейсов — Согласовано</title>"), "production has the current SEO title");
check(home.body.includes('"@type": ["Organization", "ProfessionalService"]'), "home includes structured organization data");
check(home.body.includes("assets/js/contact.js?v=20260722-leads7d"), "home references the current lead-attribution bundle");

const robots = await request("/robots.txt");
check(robots.response.status === 200, "robots.txt returns HTTP 200");
check(robots.body.includes("Sitemap: https://soglasovano.online/sitemap.xml"), "robots.txt exposes the production sitemap");
check(robots.body.includes("Disallow: /api/"), "robots.txt excludes technical API routes");

const sitemap = await request("/sitemap.xml");
const sitemapUrls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
check(sitemap.response.status === 200, "sitemap.xml returns HTTP 200");
check(sitemapUrls.length === 33, "sitemap contains the expected 33 canonical URLs");
check(!sitemapUrls.includes(`${ORIGIN}/case.html`), "sitemap excludes the empty case template");

const validCase = await request("/case.html?slug=visiflow");
check(validCase.response.status === 200, "published case returns HTTP 200");
check(validCase.body.includes("VISI FLOW — кейс UX/UI и дизайна | Согласовано"), "case metadata is rendered server-side");
check(validCase.body.includes(`${ORIGIN}/case.html?slug=visiflow`), "case canonical URL includes the slug");
check(validCase.body.includes('id="case-structured-data"'), "case includes structured data");

const missingCase = await request("/case.html?slug=production-verifier-missing");
check(missingCase.response.status === 404, "unknown case returns HTTP 404");
check(missingCase.body.includes('content="noindex,nofollow"'), "unknown case is marked noindex");

const health = await request("/api/leads.php?health=1");
let healthData = {};
try {
  healthData = JSON.parse(health.body);
} catch {}
check(health.response.status === 200 && healthData.ok === true && healthData.configured === true, "lead delivery endpoint is configured");

const indexNow = await request(`/${INDEXNOW_KEY}.txt`);
check(indexNow.response.status === 200 && indexNow.body.trim() === INDEXNOW_KEY, "IndexNow ownership key is published");

const httpOrigin = await request("http://soglasovano.online/", { redirect: "manual" });
check([301, 308].includes(httpOrigin.response.status) && httpOrigin.response.headers.get("location") === `${ORIGIN}/`, "HTTP redirects to canonical HTTPS origin");

const wwwOrigin = await request("https://www.soglasovano.online/", { redirect: "manual" });
check([301, 308].includes(wwwOrigin.response.status) && wwwOrigin.response.headers.get("location") === `${ORIGIN}/`, "www redirects to the non-www canonical origin");

if (failures.length) {
  console.error(`\nProduction verification failed (${failures.length} checks).`);
  process.exitCode = 1;
} else {
  console.log("\nProduction verification passed.");
}
