/* Accessibility check: runs axe-core (WCAG 2.0–2.2 A/AA rules) on every page at phone and desktop
   widths, plus the interactive widgets in their changed states.

   Needs Node, Playwright and axe-core:
     npm i --no-save playwright axe-core      (or use globally installed copies)
     python3 -m http.server 8000              (from the folder that contains spydstudio/ … see README)
     node tools/a11y-check.js http://localhost:8000/spydstudio/
   Exits with code 1 if anything is found. */
const { chromium } = require('playwright');
const axePath = require.resolve('axe-core/axe.min.js');

const base = (process.argv[2] || 'http://localhost:8000/spydstudio/').replace(/\/?$/, '/');
const pages = ['', 'services/', 'services/video-ads/', 'services/ugc-content/', 'services/websites/',
  'services/marketing/', 'services/documents-decks/', 'work/', 'process/', 'about/', 'contact/', 'thanks/'];
// Extra states worth checking: widgets after interaction.
const states = {
  'services/video-ads/': async (pg) => { await pg.click('[data-ratio="16/9"]'); await pg.check('[data-fmt-safe]'); },
  'services/ugc-content/': async (pg) => { await pg.click('[data-hook="result"]'); },
  'contact/': async (pg) => { await pg.click('.chip:has-text("TikTok")'); await pg.click('button[data-send="copy"]'); },
  'services/': async (pg) => { await pg.click('.pick[data-service="websites"]'); await pg.click('.pick[data-service="marketing"]'); },
  'services/websites/': async (pg) => { await pg.click('[data-mm-mode="generic"]'); },
  'services/documents-decks/': async (pg) => { await pg.click('[data-dk="next"]'); },
};

(async () => {
  const browser = await chromium.launch();
  let total = 0;
  for (const width of [390, 1280]) {
    const pg = await browser.newPage({ viewport: { width, height: 900 } });
    for (const path of pages) {
      await pg.goto(base + path, { waitUntil: 'networkidle' });
      // Show everything: reveal animations would otherwise hide content from the colour checks.
      await pg.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.remove('pending')));
      await pg.waitForTimeout(700); // let reveal fades finish, or colours are measured mid-fade
      if (states[path]) await states[path](pg);
      await pg.addScriptTag({ path: axePath });
      const res = await pg.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
      for (const v of res.violations) {
        total += v.nodes.length;
        console.log(`[${width}] /${path} ${v.impact} ${v.id}: ${v.help}`);
        v.nodes.slice(0, 4).forEach((n) => console.log(`     ${n.target.join(' ')}  ${(n.failureSummary || '').split('\n')[1] || ''}`));
      }
    }
    await pg.close();
  }
  await browser.close();
  console.log(total ? `\n${total} issue(s) found.` : 'No axe violations.');
  process.exit(total ? 1 : 0);
})();
