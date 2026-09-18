import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const read = name => fs.readFileSync(name, 'utf8');
const routes = JSON.parse(read('_content/routes.json'));
const file = route => route === '/' ? 'index.html' : route.endsWith('.html') ? route.slice(1) : `${route.slice(1)}index.html`;
test('domain and advertising authorization preserved', () => {
  assert.equal(read('CNAME').trim(), 'dawngamesapp.com');
  assert.equal(read('app-ads.txt').trim(), 'google.com, pub-5948141758947809, DIRECT, f08c47fec0942fa0');
});
test('every page has unique metadata, canonical, social image and exactly one h1', () => {
  const titles = new Set(), descriptions = new Set();
  for (const route of routes) {
    const html = read(file(route));
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const desc = html.match(/name="description" content="([^"]*)"/)?.[1];
    assert(title && !titles.has(title), `${route}: unique title`);
    assert(desc && !descriptions.has(desc), `${route}: unique description`);
    titles.add(title); descriptions.add(desc);
    assert(html.includes(`rel="canonical" href="https://dawngamesapp.com${route}"`), route);
    assert(html.includes('property="og:image"'), route);
    assert(html.includes('name="twitter:card"'), route);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `${route}: one h1`);
    assert(html.includes('id="main"'), `${route}: main landmark`);
    assert(!html.includes('href="#"'), `${route}: no fake links`);
  }
});
test('all referenced local files and link targets exist', () => {
  for (const route of routes) {
    const html = read(file(route));
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|\/\/|data:)/.test(value)) continue;
      const [pathname, hash] = value.split('#');
      const local = pathname ? new URL(pathname, `https://dawngamesapp.com${route}`).pathname : route;
      let target = path.join('.', local);
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      assert(fs.existsSync(target), `${route}: missing ${value} (${target})`);
      if (hash && path.extname(target) === '.html') assert(read(target).includes(`id="${hash}"`), `${route}: missing anchor ${value}`);
    }
  }
});
test('news preserves actual entries and missing dates, never fabricates posts', () => {
  const news = JSON.parse(read('_content/news.json'));
  assert.equal(news.length, 8);
  assert.equal(news.filter(x => x.date).length, 2);
  assert(news.every(x => x.archived && x.body.includes('<p>')));
});
test('no fabricated releases, active store buttons or gameplay screenshots', () => {
  const game = JSON.parse(read('_content/projects.json'))[0];
  assert.equal(game.store, null); assert.equal(game.release, null); assert.equal(game.trailer, null);
  assert(game.gallery.every(x => /not gameplay/i.test(x.kind)));
  assert(!/headed to steam|co-op survival|low-poly|wishlist coming|AAA/i.test(read('games/dawn-upon-us/index.html')));
});
test('archived Just Right and Beamer Connect projects are not published', () => {
  const projects = JSON.parse(read('_content/projects.json'));
  assert(!projects.some(p => ['just-right', 'beamer-connect'].includes(p.slug)));
  for (const route of routes) assert(!/Just Right|Beamer Connect|just-right|beamer-connect/.test(read(file(route))), route);
  for (const name of ['just-right', 'beamer-connect']) assert(read(`${name}.html`).includes('url=/projects/'));
});
test('preview analytics are guarded and runtime has no framework', () => {
  const script = read('assets/js/site.js');
  assert(script.includes("['dawngamesapp.com', 'www.dawngamesapp.com'].includes(location.hostname)"));
  assert(!JSON.parse(read('package.json')).dependencies);
});
test('sitemap covers all indexable routes, not internal authoring or reviews', () => {
  const xml = read('sitemap.xml');
  assert.equal([...xml.matchAll(/<loc>/g)].length, routes.length);
  for (const route of routes) assert(xml.includes(`https://dawngamesapp.com${route}`));
  assert(!xml.includes('_review'));
  assert(read('_config.yml').includes('tests'));
});
