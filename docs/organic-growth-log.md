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

## 2026-10-08 — B2B corporate website landing page

- Barrier: the portfolio contains credible B2B work, but no commercial landing page directly answers the buyer intent `создание корпоративного сайта для B2B-компании`.
- Hypothesis: a dedicated page that explains long-cycle B2B requirements, links relevant cases and attributes its form separately will create a clearer query-to-proof-to-lead path than the generic landing-page offer.
- Change: added `/b2b-corporate-website` using the existing offer-page visual system, with unique copy, Service and FAQ schema, three relevant cases, a source-specific lead form, one contextual internal link and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; desktop rendering and the complete semantic/form structure were reviewed locally. The page reuses the already verified responsive `offer-page.css` system.
- Publication: deployed to production in commit `1ac9a8c`; the page returns HTTP 200 with the intended title, canonical and H1. The full production verifier passed. The primary checkout and its uncommitted owner changes remained untouched.
- Metric: non-branded impressions/clicks for B2B corporate-site queries and confirmed leads with source `SEO — корпоративный B2B-сайт`. First indexing check: 2026-10-15; first performance review after sufficient impressions.

## 2026-10-08 — industrial interface design landing page

- Barrier: the portfolio includes an operator-panel case, but no commercial page answers the distinct buyer intent `дизайн интерфейса для промышленного оборудования` or explains safety-critical states and implementation handoff.
- Hypothesis: a dedicated page for industrial UX/UI will give engineering and product teams a closer query-to-proof path than the broad UX/UI offer and will make those leads separately measurable.
- Change: added `/industrial-interface-design` in the existing offer-page visual system, with unique industrial-process copy, Service and FAQ schema, relevant cases, a source-specific lead form, one contextual editorial link and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; desktop rendering and the full semantic/form structure were reviewed locally. The page reuses the already verified responsive `offer-page.css` system.
- Publication: deployed to production in commit `9bd7ae9`; the page returns HTTP 200 with the intended title, canonical and H1. The full production verifier passed. The primary checkout and its uncommitted owner changes remained untouched.
- Metric: non-branded impressions/clicks for industrial-interface queries and confirmed leads with source `SEO — промышленные интерфейсы`. First indexing check: 2026-10-15; first performance review after sufficient impressions.

## 2026-10-08 — hotel website landing page

- Barrier: the portfolio contains hospitality work, but no commercial page directly answers the buyer intent `создание сайта для отеля / гостиницы` or explains the path from room comparison to booking.
- Hypothesis: a dedicated hospitality page with relevant proof and booking-specific requirements will create a clearer query-to-lead path than the generic landing-page offer.
- Change: added `/hotel-website-development` in the existing offer-page visual system, with unique hospitality copy, Service and FAQ schema, three relevant cases, a source-specific lead form, a contextual link from the Diplomat Hotel case and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; desktop rendering and the complete semantic/form structure were reviewed locally. The page reuses the already verified responsive `offer-page.css` system.
- Publication: deployed to production in commit `2f4d3de`; the page returns HTTP 200 with the intended title, canonical and H1. The full production verifier passed. The primary checkout and its uncommitted owner changes remained untouched.
- Metric: non-branded impressions/clicks for hotel-website queries and confirmed leads with source `SEO — сайт для отеля`. First indexing check: 2026-10-15; first performance review after sufficient impressions.

## 2026-10-08 — WEINTEK proof-to-service path

- Barrier: `/case-weintek-panel` is the strongest proof for the industrial-interface offer, but its snippet title was generic and its final action returned visitors to a general brief instead of the matching service page.
- Hypothesis: a query-specific case title plus direct contextual and final links to `/industrial-interface-design` will strengthen industrial relevance and reduce the gap between proof and the attributed lead form.
- Change: refined the WEINTEK case title for HMI/operator-panel intent, added an in-context service link and changed the final CTA to the industrial-interface request section. The homepage and other cases were not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the static case retains server-rendered metadata and both service links resolve locally.
- Publication: deployed in commit `219b3cb`; production returns HTTP 200 with the new title and both industrial-service links, and the full production verifier passed.
- Metric: impressions/clicks for HMI and operator-panel queries, click-through from the WEINTEK case to `/industrial-interface-design`, and confirmed leads with source `SEO — промышленные интерфейсы`. First evaluation: 2026-10-15.

## 2026-10-08 — Diplomat Hotel proof-to-service path

- Barrier: `/case-diplomat-hotel` is the strongest proof for the hotel-site offer, but its snippet title was generic and the final CTA opened a general brief instead of continuing to the matching attributed form.
- Hypothesis: a hospitality-specific case title and direct final CTA to `/hotel-website-development#request` will strengthen relevance for hotel-site queries and shorten the proof-to-lead path.
- Change: refined the Diplomat Hotel case title for boutique-hotel website intent and changed the final CTA to the hotel landing page request section. The existing contextual service link remains in the case. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the static case retains server-rendered metadata and both hotel-service links resolve locally.
- Publication: deployed in commit `cf32a1e`; production returns HTTP 200 with the new title and both hotel-service links, and the full production verifier passed.
- Metric: impressions/clicks for hotel and boutique-hotel website queries, transitions from the case to `/hotel-website-development`, and confirmed leads with source `SEO — сайт для отеля`. First evaluation: 2026-10-15.

## 2026-10-08 — truthful B2B proof selection

- Barrier: the B2B landing page labelled the Amazon-services project `ggm.pro` as financial consulting and labelled the financial-consulting project `Пифагор и сыновья` as engineering work. This weakened proof relevance and could reduce trust before the CTA.
- Hypothesis: replacing the mismatched proof card and using accurate industry labels will make the B2B offer easier to validate without adding unsupported claims.
- Change: replaced `ggm.pro` with the relevant `ВебОценщик` case and corrected all three proof labels to financial B2B consulting, a business digital service, and an industrial B2B system. The homepage and case content were not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; all three clean case links resolve locally and the existing editorial card structure is unchanged.
- Publication: deployed in commit `7e3865c`; production returns HTTP 200 and exposes the three corrected proof labels, and the full production verifier passed.
- Metric: transitions from `/b2b-corporate-website` to the three proof cases, subsequent request-form engagement, and confirmed leads with source `SEO — корпоративный B2B-сайт`. First evaluation: 2026-10-15.

## 2026-10-08 — Pifagor B2B proof-to-service path

- Barrier: `/case-pifagor-i-synovya` is the clearest corporate B2B-site proof, but its snippet title was generic and its final action opened a general brief rather than the attributed B2B request form.
- Hypothesis: a corporate-site-specific title plus contextual and final links to `/b2b-corporate-website` will strengthen commercial relevance and shorten the path from proof to a measurable lead.
- Change: refined the Pifagor case title for corporate B2B-site intent, added an in-context service link and changed the final CTA to the B2B request section. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the static case retains server-rendered metadata and both B2B-service links resolve locally.
- Publication: deployed in commit `194e7cd`; production exposes the new title and both B2B-service links, and the full production verifier passed.
- Metric: impressions/clicks for corporate B2B-site queries, transitions from the case to `/b2b-corporate-website`, and confirmed leads with source `SEO — корпоративный B2B-сайт`. First evaluation: 2026-10-15.
