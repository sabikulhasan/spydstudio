/* Documents & Decks page: sample deck. The slides are a CSS scroll-snap strip, so they can be
   swiped or scrolled without JS; this adds previous/next buttons, a counter and arrow keys. */
(() => {
  const root = document.querySelector('[data-deck]');
  if (!root) return;
  const track = root.querySelector('.dk-track');
  const slides = [...track.children];
  const count = root.querySelector('[data-dk-count]');
  const prev = root.querySelector('[data-dk="prev"]');
  const next = root.querySelector('[data-dk="next"]');
  root.querySelector('.dk-controls').hidden = false;
  let index = 0;
  const go = (i) => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    const behavior = window.SPYDMotion?.off ? 'instant' : 'smooth';
    track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior });
  };
  const sync = () => {
    // The slide whose left edge is nearest the track's left edge is the current one.
    const x = track.scrollLeft;
    index = slides.reduce((best, s, i) => (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x) ? i : best), 0);
    count.textContent = index + 1;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  };
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  });
  let raf = 0;
  track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; sync(); }); }, { passive: true });
  sync();
})();
