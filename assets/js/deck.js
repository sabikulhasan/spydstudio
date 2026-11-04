/* Documents & Decks page: sample deck. The slides are a CSS scroll-snap strip, so they can be
   swiped or scrolled without JS; this adds previous/next buttons, a counter and arrow keys.
   The current slide is tracked with an IntersectionObserver on the strip, so nothing forces a
   layout at load or while scrolling; positions are only read when a button is pressed. */
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
  const show = (i) => {
    index = i;
    count.textContent = i + 1;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  };
  const go = (i) => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, i))];
    const behavior = window.SPYDMotion?.off ? 'instant' : 'smooth';
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior });
  };
  // The current slide is the first one mostly inside the strip, except at the very end of the
  // strip, where the last slide can't reach the left edge and is treated as current.
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target, e.intersectionRatio));
    const atEnd = (seen.get(slides[slides.length - 1]) || 0) > 0.99 && track.scrollLeft > 0
      && track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    const first = slides.findIndex((s) => (seen.get(s) || 0) >= 0.6);
    if (atEnd) show(slides.length - 1); else if (first !== -1) show(first);
  }, { root: track, threshold: [0, 0.6, 0.99, 1] });
  slides.forEach((s) => io.observe(s));
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  });
  show(0);
})();
