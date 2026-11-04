/* Share images: renders a 1200×630 JPEG card per page into assets/img/og/, used as that page's
   og:image (build.py falls back to assets/img/og-image.png when a card is missing).
   The headline is the page's own <h1>, read from the built HTML, so cards match the site.

     python3 tools/build.py && node tools/og.js && python3 tools/build.py

   Needs Node and Playwright (npm i --no-save playwright). Re-run when a page headline changes. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const url = (p) => 'file://' + path.join(ROOT, p);
const ed = (name) => `assets/media/editorial/${name}-640.webp`;
// page folder → [label, image, focal point]
const PAGES = {
  '': ['Observe. Understand. Create.', ed('P05-fashion-blue'), '50% 62%'],
  'services/': ['Services', ed('P03-product-flatlay'), '50% 55%'],
  'services/video-ads/': ['Video Ads', ed('P01-product-beige'), '72% 62%'],
  'services/ugc-content/': ['UGC Content', ed('P02-creator'), '55% 46%'],
  'services/websites/': ['Websites', 'assets/media/studio/site-home-640.webp', '50% 0%'],
  'services/marketing/': ['Marketing', ed('P04-coffee'), '50% 62%'],
  'services/documents-decks/': ['Documents & Decks', ed('P06-product-floral'), '50% 55%'],
  'work/': ['Work', ed('P05-fashion-blue'), '50% 62%'],
  'process/': ['Process', ed('P06-product-floral'), '50% 55%'],
  'about/': ['About', ed('P03-product-flatlay'), '50% 55%'],
  'contact/': ['Contact', ed('P02-creator'), '55% 46%'],
};
const slug = (p) => (p ? p.replace(/\/$/, '').replace(/\//g, '-') : 'home');
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const card = (label, headline, img, focal) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: N; font-weight: 900; src: url("${url('assets/fonts/nunito-sans-latin-900-normal.woff2')}"); }
@font-face { font-family: N; font-weight: 600; src: url("${url('assets/fonts/nunito-sans-latin-600-normal.woff2')}"); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0B0B0B; color: #fff; font-family: N, sans-serif; display: grid; grid-template-columns: 1fr 380px; gap: 64px; padding: 72px 72px 72px 96px; overflow: hidden; }
.copy { display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
.logo { width: 230px; }
.label { font-size: 24px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #FF4B00; margin-bottom: 18px; }
h1 { font-size: ${headline.length > 34 ? 54 : 66}px; font-weight: 900; line-height: 1.04; text-wrap: balance; }
.bar { width: 110px; height: 10px; background: #FF4B00; transform: rotate(-7deg); transform-origin: left center; }
.pic { border-radius: 22px; overflow: hidden; }
.pic img { width: 100%; height: 100%; object-fit: cover; object-position: ${focal}; display: block; }
</style></head><body>
<div class="copy"><img class="logo" src="${url('assets/logo/spyd-horizontal-reverse.png')}">
<div><p class="label">${esc(label)}</p><h1>${esc(headline)}</h1></div><span class="bar"></span></div>
<div class="pic"><img src="${url(img)}"></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  fs.mkdirSync(path.join(ROOT, 'assets/img/og'), { recursive: true });
  for (const [folder, [label, img, focal]] of Object.entries(PAGES)) {
    const html = fs.readFileSync(path.join(ROOT, folder, 'index.html'), 'utf8');
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, label])[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    const tmp = path.join(ROOT, 'assets/img/og', '_card.html');
    fs.writeFileSync(tmp, card(label, h1, img, focal));
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, 'assets/img/og', `${slug(folder)}.jpg`), type: 'jpeg', quality: 84 });
    fs.unlinkSync(tmp);
    console.log('og', slug(folder), '←', h1);
  }
  await browser.close();
})();
