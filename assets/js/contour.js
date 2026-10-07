/* Keep one document-space pattern origin; do not copy viewport-specific offsets. */
(() => {
  if (!document.body.classList.contains('home')) return;
  const main = document.getElementById('main');
  const hero = document.querySelector('.hero-stage');
  if (!main || !hero || hero.querySelector('.contour-glow')) return;
  const surfaces = [...document.querySelectorAll('.hero-stage, .directions, #services, .process-home, .faq, .cta-band')];
  const glow = document.createElement('div');
  glow.className = 'contour-glow';
  glow.setAttribute('aria-hidden', 'true');
  hero.prepend(glow);
  let frame = 0, allDirty = true, visible = false;

  function lightState() {
    document.documentElement.dataset.contourActive = String(visible && !document.hidden);
  }
  function align() {
    frame = 0;
    const rootStyle = getComputedStyle(document.body);
    const tileW = parseFloat(rootStyle.getPropertyValue('--contour-w')) || 960;
    const tileH = parseFloat(rootStyle.getPropertyValue('--contour-h')) || 720;
    const targets = allDirty ? surfaces : [hero];
    // Batch layout reads before writing any variables.
    const measurements = targets.map(el => {
      const rect = el.getBoundingClientRect();
      return {el,x:-(rect.left+scrollX)%tileW,y:-(rect.top+scrollY)%tileH};
    });
    measurements.forEach(({el,x,y}) => {
      el.style.setProperty('--contour-x', `${x.toFixed(2)}px`);
      el.style.setProperty('--contour-y', `${y.toFixed(2)}px`);
    });
    allDirty = false;
  }
  function schedule(all = false) {
    allDirty ||= all;
    if (!frame && !document.hidden) frame = requestAnimationFrame(align);
  }
  new ResizeObserver(() => schedule(true)).observe(main);
  addEventListener('resize', () => schedule(true), {passive:true});
  // Only the sticky hero changes its document position while scrolling.
  addEventListener('scroll', () => {
    if (visible && hero.closest('.hero')?.classList.contains('is-enhanced')) schedule();
  }, {passive:true});
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lightState();
    if (visible) schedule(true);
  }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    lightState();
    if (!document.hidden) schedule(true);
  });
  window.SPYDMotion?.onChange(() => schedule(true));
  document.fonts.ready.then(() => schedule(true));
  schedule(true);
})();
