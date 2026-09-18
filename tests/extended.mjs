import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
let browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = 'http://127.0.0.1:4173';
const report = { accessibility: [], extraSizes: [], keyboard: [], reducedMotion: null };
const routes = JSON.parse(fs.readFileSync('_content/routes.json', 'utf8'));
try {
  for (const route of routes) {
    await browser.close();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: 'networkidle' });
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    report.accessibility.push({ route, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    await context.close();
  }
  await browser.close();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const width of [320, 360, 2560]) {
    await page.setViewportSize({ width, height: width > 1000 ? 1080 : 900 });
    for (const route of ['/', '/games/dawn-upon-us/', '/contact/']) {
      await page.goto(base + route);
      const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      assert(size.content <= width + 1, `${route} overflows at ${width}px`);
      report.extraSizes.push({ route, width, ...size });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.keyboard.press('Tab');
  assert(await page.locator('.skip-link').evaluate(e => e === document.activeElement));
  await page.keyboard.press('Enter');
  assert(await page.locator('#main').evaluate(e => e === document.activeElement));
  report.keyboard.push('Skip link targets main content.');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('#primary-nav a').last().focus();
  await page.keyboard.press('Tab');
  assert(await page.locator('.menu-toggle').evaluate(e => e === document.activeElement));
  await page.keyboard.press('Shift+Tab');
  assert(await page.locator('#primary-nav a').last().evaluate(e => e === document.activeElement));
  report.keyboard.push('Open mobile navigation contains forward/reverse tab focus.');
  await page.keyboard.press('Escape');
  report.reducedMotion = await page.locator('.hero-content').evaluate(e => getComputedStyle(e).animationName);
  assert.equal(report.reducedMotion, 'none');
  await page.close();
  await browser.close();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const offline = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJS = await offline.newPage(); await noJS.goto(base);
  assert(await noJS.locator('#primary-nav').isVisible());
  await noJS.locator('#primary-nav a[href="/games/"]').click();
  await noJS.waitForURL('**/games/');
  report.keyboard.push('No-JavaScript mobile navigation remains visible and functional.');
  await offline.close();
} catch (e) { report.failure = e.message; process.exitCode = 1; }
finally {
  fs.writeFileSync('_review/extended-results.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, accessibility: report.accessibility.filter(x => x.violations.length) }, null, 2));
  if (report.accessibility.some(x => x.violations.length)) process.exitCode = 1;
  await browser.close();
}
