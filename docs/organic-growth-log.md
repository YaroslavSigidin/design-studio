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
- Verification: pending local checks and production publication.
- Publication: pending.
- Metric: non-branded impressions and clicks for branding and identity queries, transitions from `/branding-design` to the three proof cases, and confirmed delivered leads with source `SEO — брендинг и айдентика` and `traffic_channel=organic_search`. First evaluation: 2026-10-24.
