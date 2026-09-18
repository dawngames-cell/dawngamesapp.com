# Dawn Games V2 — owner visual review

September 18, 2026. **Local review only. Not pushed or deployed.**

## Result

The existing static website is now an independent game studio presentation, with Dawn Upon Us as its flagship. The supplied white-D/orange-G logo is used directly in the header, mobile mark, footer, icons and social preview. The master JPEG is preserved unchanged. No logo was approximated in CSS.

The design uses near-black surfaces, white typography, deliberate orange actions, a cinematic homepage, accessible mobile navigation and an image gallery. Desktop and mobile layouts are independently composed. Motion respects reduced-motion preferences.

## Created / substantially changed

- Added shared static page generation, content data, CSS and progressive JavaScript in `_tools/`, `_content/` and `assets/`.
- Created `/games/`, `/games/dawn-upon-us/`, `/about/`, `/news/`, eight archived news articles, `/contact/` and `/projects/`.
- Rebuilt the homepage and shared navigation/footer; brought retained app, lore and privacy pages into the new shell.
- Added metadata, canonicals, Open Graph/Twitter previews, structured data, sitemap, robots, manifest, favicon and touch icons.
- Added compatibility redirects for historical URLs and a real 404 page.
- Added content, responsive browser, accessibility, keyboard and reduced-motion tests. No client-side framework or runtime dependency was introduced.
- Added local-only preview tooling, brand/media preparation, screenshot capture and maintenance documentation.

## Content decisions

- Removed Just Right and Beamer Connect from the public portfolio, search metadata and sitemap as requested. Old URLs redirect to the remaining portfolio. Their original source remains recoverable.
- Retained Block Drop DG, Darknet Idle and Hacker: Day in the Life as secondary projects, not the studio's primary identity.
- Retained the eight real development posts as a clearly marked historical archive. Missing dates were not invented. Historical prototype claims are not current game commitments.
- Preserved The Watch and The Dawn lore as fiction, distinct from the corporate studio.
- Retained the real contact email, Discord, App Store link, app advertising authorization and existing game privacy content.
- Existing GoatCounter analytics remain production-domain-only and are disclosed. No analytics run in local preview.
- Current imagery is owned, pre-existing concept artwork, explicitly labeled **not gameplay**. No stock military screenshots or invented gameplay captures were added.

## Approval / artwork still needed

1. Owner approval of the visual design and wording before deployment.
2. Approved gameplay captures and/or trailer when ready. Current concept art is intentionally usable as-is; there are no fake store, release or trailer buttons.
3. Optional transparent/vector logo master for future large-format work. The supplied JPEG is sufficient for the present dark website.
4. Owner/legal review of inherited game policy inconsistencies (local-data versus leaderboard scope, refund wording). These were not silently rewritten.

No specific sponsorship announcement, release platform, date, multiplayer commitment, award or partnership was invented.

## Verification

- Production generation and JavaScript syntax checks: pass.
- Content/link/metadata safety suite: **8/8 pass**.
- Main responsive sweep: **21 routes × 390 / 768 / 1440 / 1920 pixels = 84 successful page checks**. No page-level horizontal overflow, broken images or browser runtime errors in that sweep.
- Full automated accessibility scan: **21 routes, zero detected WCAG A/AA violations**. This is not a certification or substitute for human accessibility testing.
- Additional 320 / 360 / 2560 pixel checks on Home, game and Contact: pass.
- Keyboard skip link, mobile focus loop, Escape/focus return, gallery arrows, reduced motion and no-JavaScript navigation: pass.
- Six historical redirects and local 404 behavior: pass.
- Local mobile Lighthouse on the final logo build: **100 performance / 100 accessibility / 100 best practices / 100 SEO**. LCP 1.4 s, CLS 0, TBT 0 ms; initial transferred resources 178 KiB. Local lab scores are not a guarantee of production network performance.
- Local desktop Lighthouse on the final logo build: **100 / 100 / 100 / 100**, LCP 0.3 s, CLS 0.
- Real contact/social/store/policy external links were checked; tested destinations returned HTTP 200.
- Domain and app-ads files unchanged; no credentials introduced. Source secret-pattern scan found no matches in checked source files.
- Review screenshots are actual Chrome captures, not design mockups. All requested ten views are included, plus full-page and gallery views.

## Review files

- Screenshot gallery: `E:\Game Development\dawngamesapp.com\_review\Screenshots.md`
- Individual PNGs: `E:\Game Development\dawngamesapp.com\_review\screenshots`
- Machine-readable browser/accessibility and Lighthouse reports: `_review/` (not published or committed).
- Preview: `http://127.0.0.1:4173` on this PC, started with `npm run preview`.

## Deployment / recovery

The existing GitHub Pages configuration remains `main` / repository root, with CNAME `dawngamesapp.com` and HTTPS enforced. DNS, hosting and credentials were not changed. Review work is on `studio-v2-review`. **Do not push/merge to the deployment branch until explicit owner approval.**

Recoverable pre-redesign checkpoint: `E:\Game Development\Checkpoints\DawnGamesWebsite_PreV2_20260918` (original source copy and complete Git bundle).

The machine's C: drive is full and Windows approached virtual-memory exhaustion during QA. Browser checks were rerun in bounded batches using task-local E: temporary files; other user applications were not closed and system settings were not changed. An unsuccessful initial Lighthouse tool download left a task-specific npm cache folder on C:; no broad cleanup was performed.
