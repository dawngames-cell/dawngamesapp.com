// Progressive enhancement only: all content and links work without JavaScript.
document.documentElement.classList.add('has-js');
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
let menuOpen = false;
function setMenu(open, restore = false) {
  menuOpen = open;
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  header?.classList.toggle('menu-open', open);
  document.body.classList.toggle('menu-open-body', open);
  if (open) nav?.querySelector('a')?.focus();
  if (restore) toggle?.focus();
}
toggle?.addEventListener('click', () => setMenu(!menuOpen, menuOpen));
nav?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
  if (!menuOpen) return;
  if (e.key === 'Escape') setMenu(false, true);
  if (e.key === 'Tab') {
    const focusable = [toggle, ...nav.querySelectorAll('a')];
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

const dialog = document.querySelector('.lightbox');
const image = dialog?.querySelector('img');
const caption = dialog?.querySelector('figcaption');
let gallery = [], current = 0, opener = null;
function showImage(index) {
  current = (index + gallery.length) % gallery.length;
  const item = gallery[current];
  image.src = item.href;
  image.alt = item.dataset.alt || item.querySelector('img')?.alt || '';
  caption.textContent = item.dataset.caption || '';
  dialog.querySelector('.gallery-count').textContent = `${current + 1} / ${gallery.length}`;
}
document.querySelectorAll('.gallery-trigger').forEach(item => item.addEventListener('click', e => {
  if (!dialog?.showModal) return;
  e.preventDefault();
  opener = item;
  gallery = [...document.querySelectorAll('.gallery-trigger')].filter(el => el.dataset.gallery === item.dataset.gallery);
  showImage(gallery.indexOf(item));
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.querySelector('.lightbox-close').focus();
}));
dialog?.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog?.querySelector('[data-gallery-prev]').addEventListener('click', () => showImage(current - 1));
dialog?.querySelector('[data-gallery-next]').addEventListener('click', () => showImage(current + 1));
dialog?.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { e.preventDefault(); showImage(current + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(current - 1); }
});
dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => { document.body.classList.remove('dialog-open'); opener?.focus(); });

// Optional future self-hosted hero media is opt-in, never an autoplay download.
const ambient = document.querySelector('[data-ambient-video]');
const videoToggle = document.querySelector('.video-toggle');
videoToggle?.addEventListener('click', async () => {
  if (!ambient) return;
  if (ambient.paused) {
    try { await ambient.play(); videoToggle.textContent = 'Pause background video'; }
    catch { videoToggle.textContent = 'Video unavailable'; }
  } else { ambient.pause(); videoToggle.textContent = 'Play background video'; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && ambient) { ambient.pause(); videoToggle.textContent = 'Play background video'; } });

// Keep existing production analytics; previews, tests and local builds stay private.
if (['dawngamesapp.com', 'www.dawngamesapp.com'].includes(location.hostname)) {
  const analytics = document.createElement('script');
  analytics.async = true;
  analytics.src = 'https://gc.zgo.at/count.js';
  analytics.dataset.goatcounter = 'https://dawngamesapp.goatcounter.com/count';
  document.head.append(analytics);
}
