// One-time, lossless content extraction from the pre-redesign checkpoint.
// This is never run by the production build and never reads a live service.
import fs from 'node:fs';
import path from 'node:path';
const source = process.argv[2];
if (!source || !fs.existsSync(path.join(source, 'devlog.html'))) throw new Error('Supply the pre-V2 source checkpoint directory.');
const read = name => fs.readFileSync(path.join(source, name), 'utf8');
const clean = html => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
const text = s => s.replace(/<[^>]+>/g, '').trim();
const entries = [...clean(read('devlog.html')).matchAll(/<article class="devlog-entry">([\s\S]*?)<\/article>/g)].map(([all, html]) => {
  const n = text(html.match(/class="entry-num">([\s\S]*?)<\/div>/)[1]).replace('Update ', '');
  const title = text(html.match(/class="entry-title">([\s\S]*?)<\/h2>/)[1]);
  const body = html.match(/class="entry-body">([\s\S]*?)<\/div>/)[1].trim();
  return { slug: `update-${n}`, title, category: 'Development', game: 'Dawn Upon Us', date: html.match(/datetime="([^"]+)"/)?.[1] || null, summary: text(body).split(/(?<=\.)\s/).slice(0, 2).join(' '), body, image: null, gallery: [], archived: true };
});
fs.mkdirSync('_content', { recursive: true });
fs.writeFileSync('_content/news.json', JSON.stringify(entries, null, 2) + '\n');
const legacy = {};
for (const name of ['block-drop-dg', 'just-right', 'darknet-idle', 'hacker-life', 'beamer-connect']) {
  let html = clean(read(`${name}.html`));
  let body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];
  body = body.replace(/<nav\b[\s\S]*?<\/nav>/gi, '').replace(/<footer\b[\s\S]*?<\/footer>/gi, '').replace(/<canvas\b[\s\S]*?<\/canvas>/gi, '');
  let css = html.match(/<style>([\s\S]*?)<\/style>/i)[1];
  css = css.replace(/:root/g, '&').replace(/\bbody\b/g, '&');
  // Legacy marketing animations are not needed for portfolio content.
  body = body.replace(/<div class="hero-title">([\s\S]*?)<\/div>/, '<h1 class="hero-title">$1</h1>');
  body = body.replace(/<div class="section-title">([\s\S]*?)<\/div>/g, '<h2 class="section-title">$1</h2>');
  legacy[name] = { body, css };
}
for (const name of ['the-watch', 'the-dawn']) {
  const html = clean(read(`${name}.html`));
  legacy[name] = { body: html.match(/<article>([\s\S]*?)<\/article>/)[1].replace(/<div class="wrap">/, '').replace(/<\/div>\s*$/, '') };
}
const privacy = clean(read('privacy.html')).match(/<div class="container">([\s\S]*?)<\/div>\s*<footer>/)[1];
legacy.privacy = { body: privacy.replace(/<h1>[\s\S]*?<\/h1>/, '') };
fs.writeFileSync('_content/legacy.json', JSON.stringify(legacy, null, 2) + '\n');
console.log(`Preserved ${entries.length} existing development entries and ${Object.keys(legacy).length} legacy content pages.`);
