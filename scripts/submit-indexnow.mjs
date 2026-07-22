import { readFile } from "node:fs/promises";

const SITE_ORIGIN = "https://soglasovano.online";
const INDEXNOW_KEY = "2c408abdfc7183227fa8b2465e0c569a";
const KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = "https://yandex.com/indexnow";

const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(match => match[1].trim())
  .filter(url => url.startsWith(`${SITE_ORIGIN}/`));

if (!urls.length) {
  throw new Error("Sitemap does not contain production URLs.");
}

const keyResponse = await fetch(KEY_LOCATION, { redirect: "follow" });
const keyBody = (await keyResponse.text()).trim();
if (!keyResponse.ok || keyBody !== INDEXNOW_KEY) {
  throw new Error(`IndexNow key is not published at ${KEY_LOCATION} (HTTP ${keyResponse.status}).`);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "soglasovano.online",
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  })
});

if (![200, 202].includes(response.status)) {
  const responseBody = (await response.text()).slice(0, 500);
  throw new Error(`IndexNow rejected the submission (HTTP ${response.status}): ${responseBody}`);
}

console.log(`IndexNow accepted ${urls.length} URLs (HTTP ${response.status}).`);
