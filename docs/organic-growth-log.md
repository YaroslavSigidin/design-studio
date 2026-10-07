# Organic growth log

This log records aggregate SEO and conversion experiments. Do not store personal lead data or secrets here.

## 2026-10-07 — baseline

- Production: `https://soglasovano.online/`
- Measurement: Yandex Webmaster connected; Google Search Console property not yet configured when inspected.
- Yandex status: no critical diagnostic errors; recommendation to link installed Metrika counter `110947439`.
- Visibility: minimal and mainly branded; no meaningful non-branded organic click volume; insufficient data for Yandex IKS.
- Technical positives: HTTPS, robots, sitemap, homepage canonical/metadata/schema, real general 404, lead endpoint, and IndexNow key are available.
- Highest-impact known constraints:
  1. Google Search Console ownership and sitemap submission are missing.
  2. Metrika is installed but not linked to Webmaster.
  3. Case URLs use client-rendered query pages with generic source metadata/canonical and soft-404 risk.
  4. `www` does not reliably redirect to the canonical non-www host.
  5. Commercial non-branded query coverage and earned authority are weak.
- Owner constraint: do not change the visible design, layout, interactions, or main copy of the homepage. New target audiences must use separate pages that reuse the existing visual system.
- Outcome target: confirmed organic leads plus sustained top-10 visibility over a rolling 28-day window for an agreed buyer-intent query cluster.

### Next measurement actions

- Connect Google Search Console and submit `sitemap.xml`.
- Link Metrika counter `110947439` to Yandex Webmaster.
- Define the first commercial query cluster and target region from actual query data.

### Next implementation candidates

- Generate static clean case URLs with case-specific source metadata and real 404 behavior.
- Configure canonical `www` redirect.
- Create focused landing pages for validated buyer-intent clusters using the existing visual language.

## 2026-10-08 — canonical consolidation and commercial-page depth

- Bottleneck: Cloudflare resolves root HTML documents to clean paths, while sitemap, canonical, Open Graph and structured-data URLs still used redirecting `.html` aliases. The three main commercial pages also had limited crawler-visible detail about scope and deliverables.
- Hypothesis: consolidating every indexable page on one final URL and adding specific service content will reduce duplicate/canonical ambiguity and improve relevance for the first buyer-intent cluster: `создание лендинга под ключ`, `редизайн сайта / UX-аудит`, `UX/UI-дизайн SaaS и личного кабинета`.
- Changes: switched root-page canonicals, sitemap entries, case URLs and schema references to clean paths; added permanent `.html` redirects; replaced legacy case-query links; expanded the three commercial pages in their existing visual system; added organic-search referrer classification to confirmed lead attribution. The homepage layout, visible copy and interactions were not changed.
- Verification: local SEO audit passes for 92 sitemap pages; titles, descriptions, canonical URLs, H1, schema, image alt text and local links are valid. Legacy case redirects, static case rendering, clean-host middleware and JavaScript syntax checks pass.
- Publication: pending commit/deployment at the time of this entry.
- Watch after publication: indexing/canonical selection for the three commercial pages; non-branded impressions and clicks by page/query; confirmed `organic_search` lead deliveries. Earliest useful technical recheck: 2026-10-15. Content visibility should be evaluated after enough impressions accumulate, not from a fixed ranking promise.
- External measurement still required: add the domain property and sitemap in Google Search Console; link Metrika counter `110947439` in Yandex Webmaster.
