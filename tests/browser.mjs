import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:4173';
const routes = JSON.parse(fs.readFileSync('_content/routes.json', 'utf8'));
fs.mkdirSync('_review', { recursive: true });
let browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [], report = { widths: [390, 768, 1440, 1920], pages: [], interactions: [], accessibility: [], network: {} };
try {
  let context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1 });
  let page = await context.newPage();
  let errors = [], requests = [];
  for (const width of report.widths) {
    // A fresh browser per breakpoint bounds the resource use of this long sweep.
    await context.close();
    await browser.close();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    context = await browser.newContext();
    for (const route of routes) {
      // Isolate documents and release decoded images between route checks.
      // A single long-lived renderer accumulated resources during the 84-page run.
      await context.close();
      context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1, viewport: { width, height: width < 800 ? 1000 : 1080 } });
      page = await context.newPage();
      errors = []; requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('request', req => requests.push(req.url()));
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 15)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(100);
      const checks = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        broken: [...document.images].filter(i => i.getAttribute('src') && i.complete && !i.naturalWidth).map(i => i.src),
        overflow: [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.right > innerWidth + 2 && s.position !== 'absolute' && s.position !== 'fixed' && !e.closest('.screenshots-scroll'); }).slice(0, 7).map(e => `${e.tagName}.${e.className}`)
      }));
      const result = { route, width, status: response.status(), ...checks, errors: [...errors] };
      report.pages.push(result);
      if (response.status() !== 200 || checks.scrollWidth > width + 1 || checks.broken.length || errors.length) failures.push(result);
      if (width === 1440 && ['/', '/games/', '/games/dawn-upon-us/', '/about/', '/news/', '/contact/', '/projects/'].includes(route)) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        report.accessibility.push({ route, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
      }
      if (requests.some(url => /goatcounter|gc\.zgo|fonts\.google|unsplash/.test(url))) failures.push({ route, width, unexpectedExternalRequest: requests });
    }
    console.log(`Checked all ${routes.length} routes at ${width}px.`);
  }
  await context.close();
  await browser.close();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open menu' }).click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  assert(await page.locator('.menu-toggle').evaluate(e => e === document.activeElement));
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('#primary-nav a[href="/games/"]').click();
  await page.waitForURL('**/games/');
  report.interactions.push('Mobile menu opens, Escape closes/restores focus, navigation works.');
  await page.goto(base + '/games/dawn-upon-us/');
  const opener = page.locator('.gallery-trigger').first();
  await opener.click();
  assert(await page.locator('dialog').evaluate(d => d.open));
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.gallery-count').textContent(), '2 / 3');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('.gallery-count').textContent(), '1 / 3');
  await page.keyboard.press('Escape');
  assert(await opener.evaluate(e => e === document.activeElement));
  report.interactions.push('Gallery opens, both arrow keys work, Escape closes and returns focus.');
  for (const [old, next] of Object.entries({ '/games.html': '/games/', '/apps.html': '/projects/', '/dawn-upon-us.html': '/games/dawn-upon-us/', '/devlog.html': '/news/', '/just-right.html': '/projects/', '/beamer-connect.html': '/projects/' })) {
    await page.goto(base + old); await page.waitForURL(base + next); report.interactions.push(`${old} → ${next}`);
  }
  const missing = await page.goto(base + '/missing-review-page/');
  assert.equal(missing.status(), 404); report.interactions.push('Custom 404 returns a genuine 404 status locally.');
  await context.close();
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const fallback = await noJS.newPage();
  await fallback.goto(base); assert(await fallback.locator('h1').isVisible());
  report.interactions.push('Primary content is server-rendered and available without JavaScript.');
  await noJS.close();
} catch (e) { failures.push({ interaction: e.message }); }
finally {
  report.failures = failures;
  fs.writeFileSync('_review/browser-results.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checks: report.pages.length, failures, accessibility: report.accessibility.filter(x => x.violations.length), interactions: report.interactions }, null, 2));
  await browser.close();
}
if (failures.length || report.accessibility.some(a => a.violations.length)) process.exitCode = 1;
