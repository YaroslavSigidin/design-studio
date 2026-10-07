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

