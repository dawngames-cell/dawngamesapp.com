import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const base = 'http://127.0.0.1:4173';
const out = path.resolve('_review/screenshots');
fs.mkdirSync(out, { recursive: true });
// Fresh browsers bound memory; failures never overwrite existing review images.
const shots = [
  ['/', '01-desktop-home-hero.png'],
  ['/', '02-mobile-home-hero.png', { mobile: true }],
  ['/', '09-mobile-navigation.png', { mobile: true, menu: true }],
  ['/', '03-dawn-upon-us-section.png', { selector: '#flagship' }],
  ['/games/', '04-games-page.png', { fullPage: true }],
  ['/games/dawn-upon-us/', '05-dawn-upon-us-page.png', { fullPage: true }],
  ['/about/', '06-about-page.png', { fullPage: true }],
  ['/news/', '07-news-page.png', { fullPage: true }],
  ['/contact/', '08-contact-page.png', { fullPage: true }],
  ['/contact/', '10-footer.png', { selector: '.site-footer' }],
  ['/', '11-full-homepage.png', { fullPage: true }],
  ['/games/dawn-upon-us/', '12-mobile-game-page.png', { mobile: true, fullPage: true }],
  ['/games/dawn-upon-us/', '13-mobile-gallery.png', { mobile: true, gallery: true }],
  ['/', '14-desktop-1920.png', { wide: true }],
  [pathToFileURL(path.resolve('_tools/og-template.html')).href, 'og-image.png', { og: true }],
];
const requested = process.argv.slice(2);
for (const [route, name, options = {}] of shots) {
  if (requested.length && !requested.includes(name)) continue;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const viewport = options.og ? { width: 1200, height: 630 } : options.mobile ? { width: 390, height: 844 } : options.wide ? { width: 1920, height: 1080 } : { width: 1440, height: 1000 };
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await page.goto(options.og ? route : base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))));
    if (options.menu) await page.getByRole('button', { name: 'Open menu' }).click();
    if (options.gallery) await page.locator('.gallery-trigger').first().click();
    const destination = options.og ? path.resolve(name) : path.join(out, name);
    const temporary = destination.replace(/\.png$/, '.pending.png');
    if (options.selector) await page.locator(options.selector).screenshot({ path: temporary });
    else await page.screenshot({ path: temporary, fullPage: !!options.fullPage });
    fs.renameSync(temporary, destination);
    console.log(`Saved ${name}`);
  } finally {
    await browser.close();
  }
}
