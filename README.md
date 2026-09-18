# Dawn Games — studio website V2

Static, multi-page website for **dawngamesapp.com**. This review is not deployed.

## Stack and hosting

- HTML, CSS and small progressive-enhancement JavaScript. No browser framework or runtime dependencies.
- Node 22+ generates reusable pages from local content. Generated HTML is committed alongside the source.
- Existing GitHub Pages setup was inspected: `main`, repository root, legacy Pages build, HTTPS enforced, CNAME `dawngamesapp.com`.
- Domain, DNS, Pages settings, secrets and credentials were not changed.
- `_config.yml` keeps authoring, test and review files out of the Jekyll deployment. Underscore-prefixed source directories are excluded by default.
- No GitHub Actions workflow was introduced. Publishing still uses the existing repository-root workflow; it does not require Node on GitHub Pages.

## Local development

```text
npm ci
npm run build
npm run check
npm test
npm run preview
```

Open `http://127.0.0.1:4173`. The preview binds only to localhost.

In another terminal, with the preview running:

```text
npm run test:browser
npm run test:extended
node _tools/capture.mjs
```

Browser tests use installed Chrome through Playwright. `@playwright/test` and `@axe-core/playwright` are development-only dependencies. There was no existing test/build/lint system; this change adds syntax, content/link, responsive and browser interaction tests. The project contains no TypeScript.

If C: is full, set the process `TEMP`, `TMP` and `npm_config_cache` to a task-local directory on E: before running test utilities. Do not delete unrelated cache or user files.

## Source map

| File | Responsibility |
| --- | --- |
| `_content/site.json` | Domain, real contacts, brand slots, hero media |
| `_content/projects.json` | Reusable games/projects, facts, gallery, optional trailer/store/release |
| `_content/news.json` | Eight original published development entries, preserved dates and text |
| `_content/legacy.json` | Preserved original portfolio/lore/privacy source, not publicly deployed |
| `_tools/build.mjs` | Shared navigation, footer, page templates, static routes, SEO, sitemap |
| `assets/css/site.css` | Responsive studio design and scoped legacy-page adjustments |
| `assets/css/no-script.css` | Accessible mobile navigation when JavaScript is disabled |
| `assets/js/site.js` | Menu, native-dialog gallery, optional media, production-only existing analytics |
| `_tools/media.py` | Optimize existing owned artwork to WebP; needs Pillow |
| `_tools/og-template.html` | Editable 1200 × 630 social-preview template |
| `_tools/capture.mjs` | Real browser screenshots and social-preview export |
| `_tools/serve.mjs` | Local-only static preview; refuses internal source/test paths |
| `tests/` | Content/link/metadata tests and responsive browser checks |

## Brand and media

The owner supplied the new white-D/orange-G artwork during review. The exact JPEG is preserved as `assets/brand/dawn-games-master.jpg`. `_tools/brand.py` mechanically crops the full lockup and existing DG mark, resizes them, and creates favicon/touch-icon derivatives. Nothing was redrawn, traced, generated or restyled. The source has a black background; the website blends that against its dark surface rather than pretending the supplied JPEG was transparent.

The full logo is used at desktop sizes; the DG mark is used for compact mobile navigation and icons. Both are wired through `brand.fullLogo` / `brand.mark` in `_content/site.json`. A future transparent PNG/SVG master can replace these paths without a header redesign. Rebuild and rerun screenshot review after changing either image. `python _tools/brand.py` regenerates the current approved derivatives; it requires Pillow.

All Dawn Upon Us imagery in this version is **existing concept/world artwork, explicitly not gameplay**. No external stock/game images were scraped. Original image files are preserved. Replace or expand `projects[0].gallery` with approved real gameplay captures, correct dimensions, honest captions and optimized WebP/AVIF files.

`hero.image`, `hero.video` and `hero.videoPoster` reserve the hero-media architecture. Optional self-hosted video is deliberately opt-in with a play/pause control, not an autoplay bandwidth cost. Use an approved local MP4 path. No unconfigured video is requested.

`trailer`, `store`, and `release` are null until approved. The template renders a trailer and store CTA only when configured; there are no dead wishlist buttons or release/platform promises. Add release content only after it is confirmed.

## Content policy

- Dawn Upon Us: open-world/tactical, in development, Unity, 8 km development map. No invented player counts, release dates, awards, publishers, multiplayer or store availability.
- Eight existing devlog entries remain an explicitly **historical archive**. Only two had dates; six remain undated. Old prototype claims are not treated as current feature commitments.
- Add news items to `_content/news.json` with title, slug, category, date (or null), summary, trusted article HTML, optional image/gallery and `archived: false` for approved new announcements. Article HTML is authored locally, never accepted from visitors. Review new content before publishing.
- Existing Block Drop DG, Darknet Idle and Hacker: Day in the Life portfolio pages remain accessible with their game information and privacy text.
- **Just Right and Beamer Connect were removed at the owner’s request.** Their old URLs redirect to the remaining portfolio; original source is preserved in the checkpoint and non-public content archive.
- The Watch and The Dawn lore remain clearly marked as in-world fiction, separate from the studio identity.
- Existing product-specific game privacy wording is retained, not silently rewritten as legal advice. Owner/legal review is recommended for older policy inconsistencies, including local-data/leaderboard scope and refund wording.

## Contact, privacy and security

- Existing `dawngames@dawngamesapp.com` and Discord invite are retained. Contact categories use mailto subjects, not a fake form or nonexistent submission service.
- Email remains intentionally readable/copyable and usable without JS. No claim is made that it is bot-proof; obfuscation would not reliably prevent scraping.
- Existing GoatCounter analytics run only on `dawngamesapp.com` / `www.dawngamesapp.com`, never local preview. The website privacy section now discloses this separately from mobile-game policies.
- External links use HTTPS. New tab links use `noopener noreferrer`.
- No API keys, private environment values or deployment credentials were introduced.
- `CNAME`, `app-ads.txt`, original media and existing store links are preserved.
- Historic `.html` entry URLs have static redirect pages with canonical destinations and a no-JS fallback. GitHub Pages cannot set custom HTTP 301 status for these files; they are client/meta-refresh compatibility redirects.

## Approval and deployment gate

**Do not push or deploy this branch until the owner explicitly approves the screenshots.**

After approval, the normal maintainer workflow is: rebuild, test, review the generated files, merge the approved review branch into `main`, and push through the existing GitHub workflow. GitHub Pages then publishes the root. Do not change DNS or Pages settings.

Checkpoint: `E:\Game Development\Checkpoints\DawnGamesWebsite_PreV2_20260918` contains both a source copy and a full Git bundle. Recovery does not require overwriting this working tree; restore into a separate directory first.
