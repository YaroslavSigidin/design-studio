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

## 2026-10-09 — Vebocenschik B2B proof-to-service path

- Barrier: `/case-vebocenschik` is a relevant proof for explaining a complex B2B service to several roles, but its snippet title was generic and its final action opened a general brief rather than the attributed B2B form.
- Hypothesis: a B2B-service-specific title plus contextual and final links to `/b2b-corporate-website` will improve relevance and shorten the path from proof to a measurable request.
- Change: refined the Vebocenschik case title for B2B service-site intent, added an in-context service link and changed the final CTA to the B2B request section. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the static case retains server-rendered metadata and both B2B-service links resolve locally.
- Publication: deployed in commit `5ae3fdd`; production returns HTTP 200 with the new title and both B2B-service links, and the full production verifier passed.
- Metric: impressions/clicks for B2B service-site queries, transitions from the case to `/b2b-corporate-website`, and confirmed leads with source `SEO — корпоративный B2B-сайт`. First evaluation: 2026-10-16.

## 2026-10-09 — truthful hospitality proof selection

- Barrier: the hotel landing page labelled the ERMITAGE visual-style website as a hospitality project, although the case itself contains no supported hotel context. This could weaken trust before the request form.
- Hypothesis: showing only verifiably relevant hospitality and travel work will produce a smaller but stronger proof set and avoid an unsupported sector claim.
- Change: removed ERMITAGE from `/hotel-website-development`, retained Diplomat Hotel and LEKI TRAVEL, and renamed the proof heading to accurately describe the available hotel and travel experience. The homepage and case pages were not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; both retained clean case links resolve locally and the editorial case-list structure remains valid with two items.
- Publication: deployed in commit `ea25127`; production returns HTTP 200, contains only Diplomat Hotel and LEKI TRAVEL in the proof block, and the full production verifier passed.
- Metric: transitions from `/hotel-website-development` to the two proof cases, request-form engagement, and confirmed leads with source `SEO — сайт для отеля`. First evaluation: 2026-10-16.

## 2026-10-09 — travel company website landing page

- Barrier: the portfolio contains a relevant LEKI TRAVEL case, but no commercial page directly answers the distinct buyer intent `создание сайта для туристической компании / туроператора` or explains catalogue, tour-card and enquiry requirements.
- Hypothesis: a dedicated travel page connected to the relevant case and a separately attributed form will create a clearer query-to-proof-to-lead path than the hotel or generic landing-page offers.
- Change: added `/travel-company-website` in the existing editorial offer-page visual system, with unique travel-specific copy, Service and FAQ schema, the LEKI TRAVEL proof, a source-specific lead form, a contextual link from the case and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the new page has unique metadata, canonical, H1, Service and FAQ schema, and its contextual case links resolve locally. It reuses the previously verified responsive editorial offer-page system.
- Publication: deployed in commit `cef76f0`; production returns HTTP 200 with the intended title, canonical, H1, LEKI TRAVEL proof and attributed form, and the full production verifier passed.
- Metric: non-branded impressions/clicks for travel-company and tour-operator website queries, transitions between the landing page and LEKI TRAVEL case, and confirmed leads with source `SEO — сайт для туристической компании`. First evaluation: 2026-10-16.

## 2026-10-09 — fintech interface design landing page

- Barrier: the portfolio contains a focused VOLT PAY payment-product case, but no commercial page answers the buyer intent `дизайн финтех-приложения / платёжного интерфейса` or explains transaction states, KYC and implementation handoff.
- Hypothesis: a dedicated fintech page connected to truthful proof and a separately attributed form will create a more relevant query-to-proof-to-lead path than the broad UX/UI offer.
- Change: added `/fintech-interface-design` in the existing editorial offer-page visual system, with unique fintech-specific copy, Service and FAQ schema, the VOLT PAY proof, a source-specific lead form, a contextual link from the case and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the page has unique metadata, canonical, H1, Service and FAQ schema, and both directions of the VOLT PAY proof path resolve locally. It reuses the verified responsive editorial offer-page system.
- Publication: deployed in commit `a36c34a`; production returns HTTP 200 with the intended title, canonical, H1, VOLT PAY proof and attributed form, the linked case exposes both fintech links, and the full production verifier passed.
- Metric: non-branded impressions/clicks for fintech-app and payment-interface queries, transitions between the landing page and VOLT PAY case, and confirmed leads with source `SEO — дизайн финтех-интерфейса`. First evaluation: 2026-10-16.

## 2026-10-09 — mobile application design landing page

- Barrier: the portfolio contains a focused MIROX APP mobile-product case, but no commercial page answers the broad buyer intent `дизайн мобильного приложения` or explains flows, non-ideal states and implementation handoff.
- Hypothesis: a dedicated mobile-app page connected to truthful proof and a separately attributed form will create a clearer query-to-proof-to-lead path than the broad UX/UI offer.
- Change: added `/mobile-app-design` in the existing editorial offer-page visual system, with unique mobile-product copy, Service and FAQ schema, the MIROX APP proof, a source-specific lead form, a contextual link from the case and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the page has unique metadata, canonical, H1, Service and FAQ schema, and both directions of the MIROX APP proof path resolve locally. It reuses the verified responsive editorial offer-page system.
- Publication: deployed in commit `bb2b329`; production returns HTTP 200 with the intended title, canonical, H1, MIROX APP proof and attributed form, the linked case exposes both mobile-service links, and the full production verifier passed.
- Metric: non-branded impressions/clicks for mobile-app design queries, transitions between the landing page and MIROX APP case, and confirmed leads with source `SEO — дизайн мобильного приложения`. First evaluation: 2026-10-16.

## 2026-10-09 — Mobile-first article to mobile-app service path

- Barrier: `/blog/mobile-first/` answers a closely related informational query but ended in a generic audit request and did not link to the new commercial mobile-app offer.
- Hypothesis: a contextual editorial link and a specific end-of-article action to `/mobile-app-design` will strengthen topical internal linking and move relevant readers toward the matching proof and attributed form.
- Change: linked the article conclusion to the mobile-app service, replaced its generic final content CTA with the specific mobile-app next step, updated the truthful `dateModified` and sitemap last-modified date. The article's existing generic audit form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; both editorial links resolve locally, the article retains valid BlogPosting schema, and the sitemap modification date matches the update.
- Publication: deployed in commit `884ea43`; production returns HTTP 200, exposes the updated BlogPosting date and both links to `/mobile-app-design`, while the target page also returns HTTP 200 and the full production verifier passed.
- Metric: transitions from `/blog/mobile-first/` to `/mobile-app-design`, subsequent MIROX APP views and confirmed leads with source `SEO — дизайн мобильного приложения`. First evaluation: 2026-10-16.

## 2026-10-09 — MIROX SaaS proof-to-service path

- Barrier: `/case-mirox` is a detailed SaaS product-design proof, but its snippet title was generic and the final action opened a general brief instead of the attributed UX/UI service form.
- Hypothesis: a SaaS-specific title plus contextual and final links to `/ux-ui-design` will strengthen commercial relevance and shorten the path from proof to a measurable request.
- Change: refined the MIROX case title for SaaS UX/UI intent, added an in-context service link, changed the final CTA to the UX/UI request section and refreshed the sitemap modification date. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the static case retains server-rendered metadata and both links to the canonical UX/UI service resolve locally.
- Publication: deployed in commit `98fe840`; production returns HTTP 200 with the SaaS-specific title and both UX/UI service links, the target page also returns HTTP 200, and the production verifier passed.
- Metric: impressions/clicks for SaaS UX/UI queries, transitions from the MIROX case to `/ux-ui-design`, and confirmed leads with source `SEO — UX/UI`. First evaluation: 2026-10-16.

## 2026-10-09 — VISI FLOW B2B AI proof-to-service path

- Barrier: `/case-visiflow` is featured as relevant proof on the UX/UI service page, but its snippet title was generic and its final action opened a general brief rather than the attributed UX/UI form.
- Hypothesis: a B2B AI-platform-specific title plus contextual and final links to `/ux-ui-design` will strengthen product-design relevance and shorten the path from proof to a measurable request.
- Change: refined the VISI FLOW title for B2B AI-platform UX/UI intent, added an in-context service link, changed the final CTA to the UX/UI request section and refreshed the sitemap modification date. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs`, `git diff --check` and the production verifier passed; the static case retains server-rendered metadata and both links to the canonical UX/UI service resolve. The verifier's VISI FLOW title assertion was updated to match the intentional new metadata.
- Publication: deployed in commit `4fbee09`; production returns HTTP 200 with the B2B AI-platform title and both UX/UI service links, while the target page also returns HTTP 200.
- Metric: impressions/clicks for B2B AI-platform UX/UI queries, transitions from VISI FLOW to `/ux-ui-design`, and confirmed leads with source `SEO — UX/UI`. First evaluation: 2026-10-16.

## 2026-10-10 — Octoclick AdTech proof-to-service path

- Barrier: `/case-octoclick` is featured as relevant proof on the UX/UI service page, but its snippet title was generic and its final action opened a general brief rather than the attributed UX/UI form.
- Hypothesis: an AdTech-platform-specific title plus contextual and final links to `/ux-ui-design` will strengthen product-redesign relevance and shorten the path from proof to a measurable request.
- Change: refined the Octoclick title for AdTech UX/UI redesign intent, added an in-context service link, changed the final CTA to the UX/UI request section and refreshed the sitemap modification date. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the static case retains server-rendered metadata and both links to the canonical UX/UI service resolve locally.
- Publication: deployed in commit `18470bf`; production returns HTTP 200 with the AdTech redesign title and both UX/UI service links, the target page also returns HTTP 200, and the production verifier passed.
- Metric: impressions/clicks for AdTech and product-redesign UX/UI queries, transitions from Octoclick to `/ux-ui-design`, and confirmed leads with source `SEO — UX/UI`. First evaluation: 2026-10-17.
## 2026-10-10 — durable generated case SEO paths

- Barrier: the static case generator rebuilt pages from `data/cases.manifest.json` with one generic title and one generic brief CTA, so a routine content regeneration had already erased four previously deployed query-specific titles and proof-to-service links.
- Hypothesis: storing SEO titles and service paths in the case source data, rendering them in both static and client paths, and testing generated output will prevent future releases from silently breaking commercial relevance and conversion routes.
- Change: added optional `seoTitle` and `serviceLink` source fields for ten proven cases; updated the shared case renderer and static generator to use them; regenerated affected pages; extended the SEO checker to fail if a future build loses the configured title, contextual link or final CTA. The homepage was not changed.
- Verification: a clean `node scripts/build-seo.mjs` regeneration followed by `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs`, `node --check assets/js/case-page.js` and `git diff --check` passed. The new regression assertions verify every configured title, contextual service link and final CTA in generated HTML.
- Publication: deployed in commit `cc40f2f`; the full production verifier passed and all ten configured case pages returned the expected direct service CTA. The generated-case checks now protect future builds.
- Metric: zero generated-case SEO regressions on future builds; stable case-to-service transitions and confirmed attributed leads across the connected commercial pages. First regression review: 2026-10-17.

## 2026-10-10 — service hierarchy for Yandex quick links

- Barrier: the site has distinct commercial service pages, but the homepage navigation linked only to an on-page `#services` anchor, so Yandex did not have a clear internal hierarchy from the main page to a services section and its subsections.
- Hypothesis: a crawlable `/services` hub linked from the existing navigation, with short descriptive anchors to the principal commercial pages, will give Yandex the internal-link structure it requires to form quick links for the branded result.
- Change: added `/services` in the existing editorial visual system, linked nine established service pages with concise names, added CollectionPage/ItemList schema, pointed the unchanged “Услуги” navigation label on the homepage to the hub, and added the hub to the sitemap. No homepage copy or visual styling changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; all 99 sitemap URLs have unique metadata, canonical, H1 and valid local links. The page rendered locally without console errors and exposed all nine service links in the DOM.
- Publication: deployed from an isolated clean worktree; the owner's unrelated changes in the primary checkout were not included.
- Metric: formation of service quick links in Yandex Webmaster under Search appearance → Quick links, plus branded-result impressions and clicks. First evaluation after recrawl: 2026-10-24.
## 2026-10-10 — case-story editorial cleanup

- Barrier: case narratives were visually fragmented by generic utility labels such as “Контекст”, “Исследование” and “Решения”; several passages also mixed Russian and English jargon, changed authorial voice or read as disconnected process notes instead of a coherent story.
- Hypothesis: removing redundant labels and editing every case into a consistent sequence of meaningful chapter headings and substantive paragraphs will make proof easier to read and increase trust before the service CTA.
- Change: removed utility labels from the shared case renderer and all 31 generated case pages, renamed the narrative section to “История проекта”, aligned block headings, corrected inconsistent first-person wording and jargon, rewrote the weakest passages, and expanded the incomplete Diplomat Hotel story into four connected chapters. No homepage copy or visual styling changed.
- Verification: the static generator rebuilt all 31 cases; `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. An additional content audit checked 119 chapters for sequence length, distinct meaningful headings and substantive text; rendered VISI FLOW has zero utility labels and no console errors.
- Publication: not deployed pending owner approval.
- Metric: scroll depth through “История проекта”, transitions from case pages to matching service pages, and attributed request submissions. First evaluation after publication: 2026-10-24.
## 2026-10-10 — direct attributed form on the services hub

- Barrier: `/services` collects commercial visitors and exposes nine service routes, but its only conversion action sent undecided users back to the homepage, adding an avoidable page transition before they could describe the project.
- Hypothesis: placing the existing verified lead form directly on the services hub will shorten the service-discovery-to-request path and preserve a distinct source for confirmed organic attribution.
- Change: replaced the homepage-link CTA on `/services` with the shared accessible lead form, source `SEO — каталог услуг`, service `Подбор услуги`, privacy consent and the existing confirmed-delivery scripts. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local browser verification found one initialized attributed form, both honeypot fields and no console errors. No test lead was sent.
- Publication: deployed in commit `b675cc3`; production exposes the attributed form and delivery scripts on `/services`, and the full production verifier passed.
- Metric: confirmed delivered leads with source `SEO — каталог услуг`, separated by `traffic_channel=organic_search`; supporting indicator is form engagement on `/services`. First evaluation: 2026-10-24.

## 2026-10-10 — branding and identity landing page

- Barrier: the studio offers branding and has three relevant identity cases, but no commercial page answers the distinct buyer intent `разработка фирменного стиля / создание айдентики` or connects that intent to proof and an attributed request form.
- Hypothesis: a focused branding page with clear deliverables, an honest process, relevant cases and a separate lead source will create a shorter query-to-proof-to-request path than the generic services catalogue.
- Change: added `/branding-design` in the established editorial offer-page visual system, with unique commercial copy, Service and FAQ schema, PAZL KOD, IT SCHOOL and ЗАОЗЕРНАЯ proof, a source-specific lead form, a services-hub link and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local desktop and 390 px browser checks found one H1, one initialized attributed form, no horizontal overflow and no console errors. The production verifier also passed.
- Publication: deployed in commit `fbcde0f`; production returns HTTP 200 with the intended title, canonical, Service/FAQ schema, three proof links and attributed form.
- Metric: non-branded impressions and clicks for branding and identity queries, transitions from `/branding-design` to the three proof cases, and confirmed delivered leads with source `SEO — брендинг и айдентика` and `traffic_channel=organic_search`. First evaluation: 2026-10-24.

## 2026-10-10 — e-commerce website landing page

- Barrier: the portfolio contains a complete Paradam e-commerce case, but no commercial page answers the buyer intent `создание интернет-магазина под ключ` or connects catalogue, checkout and integration requirements to proof and a separately attributed request.
- Hypothesis: a dedicated e-commerce page connected in both directions with the Paradam case will create a clearer query-to-proof-to-request path than the generic landing-page offer.
- Change: added `/ecommerce-website-development` in the established editorial offer-page visual system, with unique e-commerce copy, Service and FAQ schema, Paradam proof, a source-specific lead form, a services-hub link, a durable case-to-service path and a sitemap entry. The homepage was not changed.
- Verification: `node scripts/build-seo.mjs`, `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs`, `node --check assets/js/case-page.js` and `git diff --check` passed; local desktop and 390 px browser checks found one H1, one initialized attributed form, no horizontal overflow and no console errors.
- Publication: deployed in commit `cec6204`; production returns HTTP 200 with the intended title, canonical, Service/FAQ schema, Paradam proof and attributed form. The case exposes both the contextual service link and direct request CTA, and the full production verifier passed.
- Metric: non-branded impressions and clicks for internet-store development queries, transitions between the landing page and Paradam case, and confirmed delivered leads with source `SEO — интернет-магазин` and `traffic_channel=organic_search`. First evaluation: 2026-10-24.

## 2026-10-10 — UX audit landing page

- Barrier: two detailed articles answer informational UX-audit questions and the portfolio proves complex product work, but no commercial page explains the audit deliverable or provides a separately attributed path for buyers searching for a UX audit service.
- Hypothesis: a dedicated `/ux-audit` offer with explicit scope, deliverables, relevant product proof and its own form source will bridge informational demand and a lower-friction commercial first step.
- Change: added `/ux-audit` in the established editorial offer-page visual system, with unique audit-specific copy, Service and FAQ schema, three relevant product cases, a source-specific lead form, a services-hub link and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local desktop and 390 px browser checks found one H1, three proof links, one initialized attributed form, no horizontal overflow and no console errors.
- Publication: deployed in commit `98f5b47`; production returns HTTP 200 with the intended title, canonical, Service/FAQ schema, three proof links and attributed form, and the full production verifier passed.
- Metric: non-branded impressions and clicks for UX-audit queries, transitions from `/ux-audit` to the three product cases, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-24.

## 2026-10-11 — design system development landing page

- Barrier: the site has two detailed design-system articles and several product cases with component-system work, but no commercial page answers the buyer intent `разработка дизайн-системы` or explains scope, handoff and a measurable request path.
- Hypothesis: a dedicated design-system offer with clear deliverables, truthful product proof and its own form source will connect existing topical authority to a high-intent B2B service.
- Change: added `/design-system-development` in the established editorial offer-page visual system, with unique service copy, Service and FAQ schema, Octoclick, VISI FLOW and MIROX proof, a source-specific lead form, a services-hub link and a sitemap entry. The homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local desktop and 390 px browser checks found one H1, three proof links, one initialized attributed form, no horizontal overflow and no console errors.
- Publication: deployed in commit `5774b1b`; production returns HTTP 200 with the intended title, canonical, Service/FAQ schema, three proof links and attributed form. The full production verifier passed after one transient timeout on the `www` redirect check.
- Metric: non-branded impressions and clicks for design-system development queries, transitions from `/design-system-development` to the three product cases, and confirmed delivered leads with source `SEO — дизайн-система` and `traffic_channel=organic_search`. First evaluation: 2026-10-25.

## 2026-10-12 — design-system article to commercial service path

- Barrier: `/blog/design-system-scale/` is the site's deepest informational resource on design systems, but it ended in a generic audit request and did not link to the matching commercial design-system offer.
- Hypothesis: a contextual editorial link and a specific end-of-article action to `/design-system-development` will transfer topical relevance and move qualified readers toward proof and the attributed service form.
- Change: linked the article conclusion to the design-system service, replaced its generic final CTA with the specific commercial next step, updated the truthful `dateModified` and sitemap modification date. The article's original general request form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local browser checks found both service links, the updated BlogPosting date, a visible mobile CTA and no console errors.
- Publication: deployed in commit `93a98b7`; production returns HTTP 200 with the updated BlogPosting date and both links to `/design-system-development`, the target page also returns HTTP 200, and the full production verifier passed.
- Metric: transitions from `/blog/design-system-scale/` to `/design-system-development`, subsequent case views, and confirmed delivered leads with source `SEO — дизайн-система` and `traffic_channel=organic_search`. First evaluation: 2026-10-26.

## 2026-10-12 — UX-audit checklist to commercial service path

- Barrier: `/blog/ux-audit-checklist-60/` directly answers the informational query around self-service UX audits, but its conclusion offered only a generic task discussion and did not link to the matching commercial UX-audit page.
- Hypothesis: a contextual service link and a specific CTA to `/ux-audit` will move readers who have outgrown the checklist toward relevant proof and the separately attributed audit form.
- Change: linked the checklist conclusion to the UX-audit service, replaced its generic final CTA with the specific audit next step, updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local browser checks found both UX-audit links, the updated BlogPosting date, visible mobile links and no console errors.
- Publication: deployed in commit `ffb3332`; production returns HTTP 200 with the updated BlogPosting date and both links to `/ux-audit`, the target page also returns HTTP 200, and the full production verifier passed.
- Metric: transitions from `/blog/ux-audit-checklist-60/` to `/ux-audit`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-26.

## 2026-10-12 — e-commerce CJM article to store-development path

- Barrier: `/blog/cjm-ecommerce-guide/` directly addresses the customer journey of an online store, but its conclusion offered only a generic task discussion and did not connect readers to the matching internet-store development service.
- Hypothesis: a contextual service link and a specific CTA to `/ecommerce-website-development` will move commercially relevant readers from journey planning to the Paradam proof and attributed store-development form.
- Change: linked the CJM article conclusion to the e-commerce service, replaced its generic final CTA with a store-specific next step, updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local browser checks found both e-commerce service links, the updated BlogPosting date, visible mobile links and no console errors.
- Publication: deployed in commit `a95bef9`; production returns HTTP 200 with the updated BlogPosting date and both links to `/ecommerce-website-development`, the target page also returns HTTP 200, and the full production verifier passed.
- Metric: transitions from `/blog/cjm-ecommerce-guide/` to `/ecommerce-website-development`, subsequent Paradam case views, and confirmed delivered leads with source `SEO — интернет-магазин` and `traffic_channel=organic_search`. First evaluation: 2026-10-26.

## 2026-10-12 — UI-kit article to design-system service path

- Barrier: `/blog/ui-kit-vs-design-system-small-product/` helps product teams choose between a UI-kit and a design system, but its only next step was a generic audit request and it did not link to the matching commercial design-system offer.
- Hypothesis: a contextual service link and a specific CTA to `/design-system-development` will move readers whose UI-kit has outgrown ad hoc rules toward relevant proof and the separately attributed service form.
- Change: linked the practical recommendation to the design-system service, replaced the generic final CTA with a design-system-specific next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the article retains valid BlogPosting schema, exposes both design-system links in rendered content and the sitemap modification date matches the update.
- Publication: deployed in commit `e2663ff`; production returns HTTP 200 with the updated BlogPosting date and both links to `/design-system-development`, the target page remains available, and the full production verifier passed.
- Metric: transitions from `/blog/ui-kit-vs-design-system-small-product/` to `/design-system-development`, subsequent case views, and confirmed delivered leads with source `SEO — дизайн-система` and `traffic_channel=organic_search`. First evaluation: 2026-10-26.

## 2026-10-12 — Nielsen heuristics article to UX-audit path

- Barrier: `/blog/nielsen-heuristics-landing-audit/` attracts readers evaluating interface problems before traffic launch, but it ended with a generic discussion CTA and did not connect the diagnostic method to the commercial UX-audit service.
- Hypothesis: a contextual link and an audit-specific CTA to `/ux-audit` will move readers with active conversion-risk concerns toward relevant proof and the separately attributed request form.
- Change: connected the article conclusion to the UX-audit service, replaced the generic final CTA with an audit-specific next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the article retains valid BlogPosting schema, exposes both UX-audit links in rendered content and the sitemap modification date matches the update.
- Publication: deployed in commit `17312e8`; production returns HTTP 200 with the updated BlogPosting date and both links to `/ux-audit`, the target page remains available, and the full production verifier passed.
- Metric: transitions from `/blog/nielsen-heuristics-landing-audit/` to `/ux-audit`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-26.

## 2026-10-13 — Figma design-system guide to commercial service path

- Barrier: `/blog/figma-design-system-from-zero/` explains how to assemble a component library, but it ended with a generic discussion CTA and did not connect implementation-focused readers to the commercial design-system service.
- Hypothesis: a contextual service link and a design-system-specific CTA will move teams that need rules, documentation and rollout support toward relevant proof and the separately attributed request form.
- Change: connected the article conclusion to `/design-system-development`, replaced the generic final CTA with a service-specific next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the article retains valid BlogPosting schema, exposes both design-system links in rendered content and the sitemap modification date matches the update.
- Publication: deployed in commit `a4f6f1e`; production returns HTTP 200 with the updated BlogPosting date and both links to `/design-system-development`, the target page remains available, and the full production verifier passed.
- Metric: transitions from `/blog/figma-design-system-from-zero/` to `/design-system-development`, subsequent case views, and confirmed delivered leads with source `SEO — дизайн-система` and `traffic_channel=organic_search`. First evaluation: 2026-10-27.

## 2026-10-13 — UX-audit article to commercial audit path

- Barrier: `/blog/ux-audit/` explains a complete audit process for teams avoiding a full redesign, but its only next step was a generic discussion form and it did not link to the matching commercial UX-audit service.
- Hypothesis: a contextual service link and an audit-specific CTA will move readers with an active need from methodology to relevant proof and the separately attributed request form.
- Change: connected the article conclusion to `/ux-audit`, replaced the generic final CTA with an audit-specific next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; the article retains valid BlogPosting schema, exposes both UX-audit links in rendered content and the sitemap modification date matches the update.
- Publication: deployed in commit `4235c83`; production returns HTTP 200 with the updated BlogPosting date and both links to `/ux-audit`, the target page remains available, and the full production verifier passed.
- Metric: transitions from `/blog/ux-audit/` to `/ux-audit`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-27.

## 2026-10-13 — form-UX article to commercial audit path

- Barrier: `/blog/pain-free-forms-design/` addresses form abandonment and validation problems, but its only next step was a generic discussion form and it did not connect readers to the UX-audit service that diagnoses conversion barriers.
- Hypothesis: a contextual audit link and a form-specific CTA will move readers with active completion problems toward relevant proof and the separately attributed UX-audit request form.
- Change: connected the article conclusion to `/ux-audit`, replaced the generic final CTA with a form-specific audit next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed; local rendering exposes both UX-audit links, retains valid BlogPosting schema and matches the updated sitemap date.
- Publication: deployed in commit `153af35`; production returns HTTP 200 with the updated BlogPosting date and both links to `/ux-audit`, the target page remains available, and the full production verifier passed.
- Metric: transitions from `/blog/pain-free-forms-design/` to `/ux-audit`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-27.

## 2026-10-13 — landing-page proof to service path

- Barrier: `/landing-page` presents SOLOMADOM, Бокстар and ggm.pro as relevant proof, but all three case pages ended with a generic brief and did not return readers to the attributed landing-page service form.
- Hypothesis: durable case-specific titles plus contextual and final links back to `/landing-page#request` will strengthen landing-development relevance and shorten the proof-to-request path.
- Change: added truthful landing-specific SEO titles and durable service links for all three proof cases in the case source manifest, then refreshed their sitemap modification dates. The homepage was not changed.
- Verification: a clean `node scripts/build-seo.mjs` regeneration followed by `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs`, `node --check assets/js/case-page.js` and `git diff --check` passed. All three static cases expose the contextual service link and final CTA; rendered Бокстар confirms both links and the landing-specific title.
- Publication: deployed in commit `5ae1dce`; all three production cases return HTTP 200 with the contextual `/landing-page` link and final `/landing-page#request` CTA, and the full production verifier passed.
- Metric: transitions from the three proof cases to `/landing-page#request` and confirmed delivered leads with source `SEO — лендинг` and `traffic_channel=organic_search`. First evaluation: 2026-10-27.

## 2026-10-13 — branding proof to service path

- Barrier: `/branding-design` presents IT SCHOOL, PAZL KOD and ЗАОЗЕРНАЯ as relevant identity proof, but all three case pages ended with a generic brief and did not return readers to the attributed branding service form.
- Hypothesis: durable case-specific titles plus contextual and final links back to `/branding-design#request` will strengthen branding relevance and shorten the proof-to-request path.
- Change: added truthful branding-specific SEO titles and durable service links for all three proof cases in the case source manifest, then refreshed their sitemap modification dates. The homepage was not changed.
- Verification: a clean `node scripts/build-seo.mjs` regeneration followed by `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs`, `node --check assets/js/case-page.js` and `git diff --check` passed. All three static cases expose the contextual service link and final CTA; rendered PAZL KOD confirms both links and the branding-specific title.
- Publication: deployed in commit `2a31453`; all three production cases return HTTP 200 with the contextual `/branding-design` link and final `/branding-design#request` CTA, and the full production verifier passed.
- Metric: transitions from the three proof cases to `/branding-design#request` and confirmed delivered leads with source `SEO — брендинг и айдентика` and `traffic_channel=organic_search`. First evaluation: 2026-10-27.

## 2026-10-13 — pricing UX article quality and audit path

- Barrier: `/blog/pricing-ux/` ended with more than thirty near-identical generic paragraphs, which diluted the useful answer and separated readers with an active pricing-conversion problem from the matching UX-audit service.
- Hypothesis: replacing the duplicated conclusion with a concise validation sequence and a specific path to `/ux-audit#request` will improve content usefulness and move commercially relevant readers toward an attributed audit request.
- Change: removed the repeated conclusion, added a concrete baseline-and-testing sequence, linked it to the UX-audit service, replaced the generic CTA with a pricing-specific audit next step, and updated the truthful `dateModified` and sitemap modification date. The article form remains available and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the duplicated tail is gone, the concise conclusion is readable, both UX-audit links resolve correctly, and the original attributed article form remains available.
- Publication: deployed in commit `da710cc`; production returns HTTP 200 with the concise conclusion, both UX-audit links, updated BlogPosting date and no repeated generic paragraph, and the full production verifier passed.
- Metric: transitions from `/blog/pricing-ux/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-27.

## 2026-10-14 — accessibility checklist quality and audit path

- Barrier: `/blog/accessibility-checklist/` ended with more than twenty repeated generic paragraphs, diluting the checklist and leaving readers with accessibility failures without a direct path to the relevant UX-audit service.
- Hypothesis: replacing the duplicated tail with a browser-level validation sequence and a specific CTA to `/ux-audit#request` will improve usefulness and move commercially relevant readers toward an attributed audit request.
- Change: removed the repeated conclusion, added a practical end-to-end accessibility verification sequence, linked it to the UX-audit service, replaced the generic CTA with an accessibility-specific audit next step, and updated the truthful `dateModified` and sitemap modification date. The article form remains available and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the duplicated tail is gone, the end-to-end checklist is readable, both UX-audit links resolve correctly, and the original attributed article form remains available.
- Publication: deployed in commit `3012865`; production returns HTTP 200 with the concise accessibility conclusion, both UX-audit links, updated BlogPosting date and no repeated generic paragraph, and the full production verifier passed.
- Metric: transitions from `/blog/accessibility-checklist/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-28.

## 2026-10-14 — onboarding article quality and audit path

- Barrier: `/blog/ux-onboarding/` ended with more than twenty repeated generic paragraphs, diluting its answer and leaving product teams with activation drop-off without a direct path to the relevant UX-audit service.
- Hypothesis: replacing the duplicated tail with a measurable activation sequence and a specific CTA to `/ux-audit#request` will improve usefulness and move commercially relevant readers toward an attributed audit request.
- Change: removed the repeated conclusion, added a practical baseline-and-experiment sequence for onboarding, linked it to the UX-audit service, replaced the generic CTA with an activation-specific audit next step, and updated the truthful `dateModified` and sitemap modification date. The article form remains available and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the duplicated tail is gone, the activation sequence is readable, both UX-audit links resolve correctly, and the original attributed article form remains available.
- Publication: deployed in commit `10d6937`; production returns HTTP 200 with the concise onboarding conclusion, both UX-audit links, updated BlogPosting date and no repeated generic paragraph, and the full production verifier passed.
- Metric: transitions from `/blog/ux-onboarding/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-28.

## 2026-10-14 — activation metrics to UX-audit path

- Barrier: `/blog/activation-metrics/` gives product teams a detailed activation framework, but its conclusion offered only a generic discussion form and did not connect readers with measurable drop-off to the matching UX-audit service.
- Hypothesis: a contextual audit link and activation-specific CTA to `/ux-audit#request` will move readers with an active funnel problem toward relevant proof and the separately attributed audit form.
- Change: connected the article conclusion to the UX-audit service, replaced the generic CTA with an activation-specific next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms both UX-audit links resolve correctly, the activation-specific CTA is readable, and the original attributed article form remains available.
- Publication: deployed in commit `92da2cf`; production returns HTTP 200 with both UX-audit links and the updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/activation-metrics/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-28.

## 2026-10-14 — business UX metrics to audit path

- Barrier: `/blog/ux-metrics-business-impact/` explains how UX affects CR, AOV, CAC and retention, but its conclusion offered only a generic discussion form and did not connect readers with a measurable business decline to the matching UX-audit service.
- Hypothesis: a contextual audit link and metric-specific CTA to `/ux-audit#request` will move readers with an active conversion or retention problem toward relevant proof and the separately attributed audit form.
- Change: connected the article conclusion to the UX-audit service, replaced the generic CTA with a business-metric-specific next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms both UX-audit links resolve correctly, the business-metric-specific CTA is readable, and the original attributed article form remains available.
- Publication: deployed in commit `c6eb470`; production returns HTTP 200 with both UX-audit links and the updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/ux-metrics-business-impact/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-28.
## 2026-10-15 — product metrics article to UX-audit path

- Barrier: `/blog/product-metrics/` explains how to detect product friction with metrics, but ended with a generic discussion form and did not connect an unexplained metric change to the relevant UX-audit service.
- Hypothesis: a contextual audit link and a metric-specific CTA will move readers with an active product-conversion problem toward relevant proof and the separately attributed UX-audit request form.
- Change: connected the article conclusion to `/ux-audit`, replaced the generic final CTA with a metric-specific audit next step, and updated the truthful `dateModified` and sitemap modification date. The original article form remains available below, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the contextual link and final CTA resolve to the UX-audit page, the BlogPosting date is current, and the original attributed article form remains available.
- Publication: deployed in commit `b59a16b`; production returns HTTP 200 with the updated BlogPosting date and both links to `/ux-audit`, the target page remains available, and the full production verifier passed.
- Metric: transitions from `/blog/product-metrics/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-29.
## 2026-10-16 — analytics article to UX-audit path

- Barrier: `/blog/analytics-for-designers/` explains how conversion, drop-off and success rate reveal product friction, but did not connect a diagnosed funnel problem to the relevant UX-audit service.
- Hypothesis: a contextual audit link will move readers with an active conversion problem toward the separately attributed UX-audit request form.
- Change: added a funnel-specific transition from the article conclusion to `/ux-audit#request`, then updated the truthful `dateModified` and sitemap modification date. The original article form remains available, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the funnel-specific link resolves to the UX-audit request, the article remains readable, and the original attributed form remains available.
- Publication: deployed in commit `71a593d`; production returns HTTP 200 with the contextual `/ux-audit#request` link and updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/analytics-for-designers/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-30.
## 2026-10-16 — audience-offer article to landing-page path

- Barrier: `/blog/target-audience-designer-services/` has direct commercial intent around segments and offers, but did not connect the completed offer to the landing-page service that can turn it into a request flow.
- Hypothesis: a contextual transition to `/landing-page#request` will move readers who have selected an audience and offer toward the separately attributed landing-page request form.
- Change: added a contextual next step from the article's offer examples to the landing-page service, then updated the truthful `dateModified` and sitemap modification date. The original article form remains available, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the contextual link resolves to the landing-page request, the article remains readable, and the original attributed form remains available.
- Publication: deployed in commit `7baad5d`; production returns HTTP 200 with the contextual `/landing-page#request` link and updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/target-audience-designer-services/` to `/landing-page#request` and confirmed delivered leads with source `SEO — лендинг` and `traffic_channel=organic_search`. First evaluation: 2026-10-30.
## 2026-10-16 — dark-patterns article to UX-audit path

- Barrier: `/blog/dark-patterns/` helps teams identify manipulative mechanics, but did not connect its practical checklist to an independent UX audit of the affected scenario.
- Hypothesis: a contextual transition to `/ux-audit#request` will move teams with a trust or compliance concern toward the separately attributed audit request form.
- Change: added an ethics-specific next step from the dark-pattern checklist to the UX-audit request, then updated the truthful `dateModified` and sitemap modification date. The original article form remains available, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the ethics-specific link resolves to the UX-audit request, the checklist remains readable, and the original attributed form remains available.
- Publication: deployed in commit `89b1319`; production returns HTTP 200 with the contextual `/ux-audit#request` link and updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/dark-patterns/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-10-30.
## 2026-10-19 — design-critique article to UX-audit path

- Barrier: `/blog/design-critique/` gives teams a structured review checklist, but did not offer an independent next step when internal discussion cannot identify the user-facing barrier.
- Hypothesis: a contextual transition to `/ux-audit#request` will move teams stuck in subjective review toward the separately attributed audit request form.
- Change: added a review-specific next step from the critique checklist to an independent UX audit, then updated the truthful `dateModified` and sitemap modification date. The original article form remains available, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the review-specific link resolves to the UX-audit request, the checklist remains readable, and the original attributed form remains available.
- Publication: deployed in commit `afffa9f`; production returns HTTP 200 with the contextual `/ux-audit#request` link and updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/design-critique/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-11-02.
## 2026-10-19 — customer-interview article to UX-audit path

- Barrier: `/blog/customer-interview-ux-25-questions/` gives teams a practical research script, but did not connect repeated interview findings to verification of the affected product scenario.
- Hypothesis: a contextual transition to `/ux-audit#request` will move teams with validated user pain toward the separately attributed audit request form.
- Change: added a research-specific next step from interview findings to a UX audit, then updated the truthful `dateModified` and sitemap modification date. The original article form remains available, and the homepage was not changed.
- Verification: `python3 scripts/check-seo.py`, `node scripts/check-case-route.mjs` and `git diff --check` passed. Local rendering confirms the research-specific link resolves to the UX-audit request, the article remains readable, and the original attributed form remains available.
- Publication: deployed in commit `a1c1895`; production returns HTTP 200 with the contextual `/ux-audit#request` link and updated BlogPosting date, and the full production verifier passed.
- Metric: transitions from `/blog/customer-interview-ux-25-questions/` to `/ux-audit#request`, subsequent case views, and confirmed delivered leads with source `SEO — UX-аудит` and `traffic_channel=organic_search`. First evaluation: 2026-11-02.
# 2026-10-19 — статья о хэнд‑оффе → услуга дизайн‑системы

- **Барьер:** статья `/blog/design-handoff/` давала чек‑лист передачи макетов, но не связывала повторяющиеся расхождения компонентов, состояний и токенов с услугой, которая устраняет причину проблемы.
- **Гипотеза:** контекстный переход на `/design-system-development#request` приведёт команды, теряющие качество между дизайном и кодом, к отдельно атрибутированной форме заявки на дизайн‑систему.
- **Изменение:** после чек‑листа добавлен один релевантный следующий шаг к услуге разработки дизайн‑системы; обновлены достоверные `dateModified` и дата страницы в sitemap. Главная страница не менялась.
- **Проверки:** `git diff --check`, `python3 scripts/check-seo.py` (103 страницы), `node scripts/check-case-route.mjs` и браузерная проверка статьи, перехода и целевой формы прошли локально.
- **Публикация:** коммит `9e6944b` отправлен в `main`; production отвечает `200`, содержит новый переход и `dateModified=2026-10-19`; `node scripts/verify-production.mjs` прошёл полностью.
- **Метрика:** переходы из `/blog/design-handoff/` к `/design-system-development#request` и подтверждённые доставленные лиды с источником `SEO — дизайн-система` и органической атрибуцией. Первая оценка — 2026-11-02.
# 2026-10-19 — статья о дизайн‑токенах → услуга дизайн‑системы

- **Барьер:** `/blog/design-tokens-explained/` объясняла внедрение токенов, но завершалась общей заявкой на аудит и не вела к коммерческой услуге разработки дизайн‑системы.
- **Гипотеза:** CTA, связанный с переходом от разрозненных стилей к токенам, компонентам и правилам, направит читателей с активной задачей в отдельно атрибутированную форму `/design-system-development#request`.
- **Изменение:** общий финальный CTA заменён на следующий шаг к разработке дизайн‑системы; обновлены достоверные `dateModified` и дата страницы в sitemap. Исходная форма статьи сохранена, главная страница не менялась.
- **Проверки:** `git diff --check`, `python3 scripts/check-seo.py` (103 страницы) и `node scripts/check-case-route.mjs` прошли; локальный браузер подтвердил единственный CTA на `/design-system-development#request` и сохранённую исходную форму статьи.
- **Публикация:** коммит `3b50f50` отправлен в `main`; production отвечает `200`, содержит новый CTA и `dateModified=2026-10-19`; полный `node scripts/verify-production.mjs` прошёл.
- **Метрика:** переходы из `/blog/design-tokens-explained/` к `/design-system-development#request` и подтверждённые доставленные лиды с источником `SEO — дизайн-система` и органической атрибуцией. Первая оценка — 2026-11-02.
# 2026-10-19 — статья о React-компонентах → услуга дизайн‑системы

- **Барьер:** `/blog/designing-react-components/` объясняла варианты, состояния и edge cases компонентов, но завершалась общей заявкой на аудит и не связывала расхождение дизайна и React с услугой разработки дизайн‑системы.
- **Гипотеза:** CTA о единой системе компонентов для дизайнеров и разработчиков направит команды с растущим техническим долгом в отдельно атрибутированную форму `/design-system-development#request`.
- **Изменение:** общий финальный CTA заменён на следующий шаг к разработке дизайн‑системы; обновлены достоверные `dateModified` и дата страницы в sitemap. Исходная форма статьи сохранена, главная страница не менялась.
- **Проверки:** `git diff --check`, `python3 scripts/check-seo.py` (103 страницы) и `node scripts/check-case-route.mjs` прошли; локальный браузер подтвердил CTA на `/design-system-development#request`, читаемый текст и сохранённую исходную форму статьи.
- **Публикация:** коммит `22a9aef` отправлен в `main`; production отвечает `200`, содержит новый CTA и `dateModified=2026-10-19`; полный `node scripts/verify-production.mjs` прошёл.
- **Метрика:** переходы из `/blog/designing-react-components/` к `/design-system-development#request` и подтверждённые доставленные лиды с источником `SEO — дизайн-система` и органической атрибуцией. Первая оценка — 2026-11-02.
# 2026-10-19 — checklist передачи макетов → услуга дизайн‑системы

- **Барьер:** `/blog/developer-handoff-spec-redlines-checklist/` давала готовый checklist для передачи макетов, но завершалась общей заявкой на аудит и не предлагала системное решение для повторяющихся ручных пояснений.
- **Гипотеза:** handoff‑специфичный CTA к общей библиотеке компонентов, состояний и правил направит команды с регулярными потерями при передаче в отдельно атрибутированную форму `/design-system-development#request`.
- **Изменение:** общий финальный CTA заменён на следующий шаг к разработке дизайн‑системы; обновлены достоверные `dateModified` и дата страницы в sitemap. Исходная форма статьи сохранена, главная страница не менялась.
- **Проверки:** `git diff --check`, `python3 scripts/check-seo.py` (103 страницы) и `node scripts/check-case-route.mjs` прошли; локальный браузер подтвердил CTA на `/design-system-development#request`, читаемый checklist и сохранённую исходную форму статьи.
- **Публикация:** коммит `eb82272` отправлен в `main`; production отвечает `200`, содержит новый CTA и `dateModified=2026-10-19`; полный `node scripts/verify-production.mjs` прошёл.
- **Метрика:** переходы из `/blog/developer-handoff-spec-redlines-checklist/` к `/design-system-development#request` и подтверждённые доставленные лиды с источником `SEO — дизайн-система` и органической атрибуцией. Первая оценка — 2026-11-02.
# 2026-10-20 — checklist доступности → UX‑аудит

- **Барьер:** `/blog/accessible-ui-checklist/` помогала выявить проблемы контраста, фокуса, клавиатуры и скринридера, но завершалась общей заявкой и не давала профильного пути для приоритизации системных нарушений.
- **Гипотеза:** CTA от найденных проблем доступности к проверке ключевых сценариев направит команды с активным риском в отдельно атрибутированную форму `/ux-audit#request`.
- **Изменение:** общий финальный CTA заменён на следующий шаг к UX‑аудиту; обновлены достоверные `dateModified` и дата страницы в sitemap. Исходная форма статьи сохранена, главная страница не менялась.
- **Проверки:** `git diff --check`, `python3 scripts/check-seo.py` (103 страницы) и `node scripts/check-case-route.mjs` прошли; локальный браузер подтвердил CTA на `/ux-audit#request`, читаемый checklist и сохранённую исходную форму статьи.
- **Публикация:** коммит `2e1dea3` отправлен в `main`; production отвечает `200`, содержит новый CTA и `dateModified=2026-10-20`; полный `node scripts/verify-production.mjs` прошёл.
- **Метрика:** переходы из `/blog/accessible-ui-checklist/` к `/ux-audit#request` и подтверждённые доставленные лиды с источником `SEO — UX-аудит` и органической атрибуцией. Первая оценка — 2026-11-03.
# 2026-10-20 — ошибки Auto Layout → услуга дизайн‑системы

- **Барьер:** `/blog/figma-auto-layout-10-mistakes/` помогала исправлять отдельные контейнеры, но завершалась общей заявкой и не связывала повторение ошибок по библиотеке с отсутствием единых правил компоновки.
- **Гипотеза:** CTA от повторяющихся Auto Layout‑ошибок к общей системе компонентов и ограничений направит команды с масштабной проблемой в отдельно атрибутированную форму `/design-system-development#request`.
- **Изменение:** общий финальный CTA заменён на следующий шаг к разработке дизайн‑системы; обновлены достоверные `dateModified` и дата страницы в sitemap. Исходная форма статьи сохранена, главная страница не менялась.
- **Проверки:** `git diff --check`, `python3 scripts/check-seo.py` (103 страницы) и `node scripts/check-case-route.mjs` прошли; локальный браузер подтвердил CTA на `/design-system-development#request`, читаемый материал и сохранённую исходную форму статьи.
- **Публикация:** ожидает выполнения.
- **Метрика:** переходы из `/blog/figma-auto-layout-10-mistakes/` к `/design-system-development#request` и подтверждённые доставленные лиды с источником `SEO — дизайн-система` и органической атрибуцией. Первая оценка — 2026-11-03.
