/* Home hero: a short, reversible centre-out zoom driven by native page scroll.
   Cards are small near the centre and grow as they move outward. Nothing intercepts the wheel,
   touch or keys: the page scrolls normally and the gallery reads the scroll position.

   The enhanced scene runs only when the viewport is at least 1024 × 600, motion is on and the
   content fits the sticky stage. Every other case keeps the static collage from the HTML.

     usableHeight = viewportHeight - headerHeight
     stageHeight  = min(860, usableHeight)
     travel       = clamp(0.65 * usableHeight, 360, 640)
     trackHeight  = stageHeight + travel
     p            = clamp((scrollY - (trackTop - headerHeight)) / travel, 0, 1)
     shown        = 2 + 8 * p                                                        */
(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const track = document.getElementById('hero-track');
  const stage = document.getElementById('hero-stage');
  const rail = document.getElementById('hero-rail');
  const collage = document.getElementById('hero-collage');
  const header = document.getElementById('site-header');
  const motion = window.SPYDMotion || { off: false, onChange() {} };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const media = JSON.parse(document.getElementById('hero-media').textContent);

  const HERO = { slots: 24, frameW: 468, frameH: 624, minRail: 220, minW: 1024, minH: 600 };
  let enhanced = false, cards = null, layer = null, raf = 0, lastShown = -1;
  let geo = { start: 0, travel: 1, stage: 0 };

  /* Twenty-four slots keep the paired left/right geometry; they reuse the small inventory, so
     each image downloads once. Built only when the enhanced scene first runs. Each inventory
     record is { src, width, height, focalPoint }; focalPoint is a CSS object-position. */
  function buildCards() {
    // Twelve visible-at-once slots: the full inventory, then again without logo artwork.
    const plain = media.filter((m) => !m.brand);
    const loop = media.concat(Array.from({ length: media.length }, (_, k) => plain[k % plain.length]));
    layer = document.createElement('div');
    layer.className = 'hero-cards';
    cards = [];
    for (let i = 0; i < HERO.slots; i++) {
      const fig = document.createElement('div');
      fig.className = 'hero-card';
      const item = loop[i % loop.length];
      const img = new Image();
      img.src = item.src; // same URL as the static collage, so nothing downloads twice
      img.alt = ''; img.draggable = false; img.decoding = 'async';
      img.width = item.width || 600; img.height = item.height || 800;
      if (item.focalPoint) img.style.objectPosition = item.focalPoint;
      fig.append(img);
      layer.append(fig);
      cards.push(fig);
    }
    rail.append(layer);
  }

  /* One uniform scale per card, so images are never distorted and the radius needs no animation. */
  function draw(shown) {
    const w = rail.clientWidth, h = rail.clientHeight, pairs = HERO.slots / 2;
    if (w <= 0 || h <= 0) return;
    cards.forEach((fig, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const level = (((Math.floor(i / 2) + shown / 2) % pairs) + pairs) % pairs;
      if (level >= 6) { fig.style.visibility = 'hidden'; return; }
      fig.style.visibility = '';
      const distance = 18 * Math.expm1(0.7 * level) * w / 1440;
      const next = 18 * Math.expm1(0.7 * (level + 1)) * w / 1440;
      const gap = Math.min(8 + 4 * Math.min(level / 5, 1), (next - distance) * 0.45);
      const natural = Math.max(1, next - distance - gap);
      const maxW = Math.min(0.336 * w, HERO.frameW), soft = 0.625 * maxW;
      const range = maxW * (1 + 0.5 * clamp((w - 1600) / 320)) - soft;
      let width = natural <= soft ? natural : soft + range * (1 - Math.exp(-(natural - soft) / range));
      width = Math.min(width, h * 0.96 * 0.75);
      const scale = width / HERO.frameW;
      const height = HERO.frameH * scale;
      const left = side > 0 ? w / 2 + distance + gap / 2 : w / 2 - distance - gap / 2 - width;
      const fade = clamp(level / 0.55);
      fig.style.transform = `translate3d(${left.toFixed(1)}px,${((h - height) / 2).toFixed(1)}px,0) scale(${scale.toFixed(4)})`;
      fig.style.opacity = (fade * fade * (3 - 2 * fade)).toFixed(3);
      fig.style.zIndex = String(Math.floor(level) + 1);
    });
  }

  const headerHeight = () => (header ? header.offsetHeight : 72);

  function progress() {
    return clamp((scrollY - geo.start) / geo.travel);
  }

  function update() {
    raf = 0;
    if (!enhanced) return;
    const p = progress();
    const shown = 2 + 8 * p;
    if (Math.abs(shown - lastShown) < 0.0005) return; // nothing changed (e.g. well past the hero)
    lastShown = shown;
    draw(shown);
    hero.dataset.progress = p.toFixed(3);
  }
  const schedule = () => { if (enhanced && !raf) raf = requestAnimationFrame(update); };

  /* Does the copy plus a usable gallery fit the stage? Measured in the static layout's terms. */
  function fits(stageHeight) {
    const style = getComputedStyle(stage);
    const pad = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const gaps = 2 * (parseFloat(style.rowGap) || 0);
    const copy = document.getElementById('hero-copy').offsetHeight;
    const note = document.getElementById('hero-note').offsetHeight;
    return copy + note + pad + gaps + HERO.minRail <= stageHeight;
  }

  /* Switch modes. When the extra scroll track appears or disappears, keep the visitor near the
     same place: past the hero they keep their position relative to the content below; inside it
     they land at the matching side of the hero/work boundary. */
  function setMode(next, stageHeight, travel) {
    const top = track.getBoundingClientRect().top + scrollY;
    const headerH = headerHeight();
    const was = enhanced;
    const oldTravel = geo.travel;
    const oldStart = geo.start;
    const pBefore = was ? progress() : 0;
    const oldBottom = top + track.offsetHeight;
    const pastHero = scrollY >= oldBottom - headerH - 1;

    enhanced = next;
    hero.classList.toggle('is-enhanced', next);
    if (next) {
      if (!cards) buildCards();
      collage.hidden = true;
      layer.hidden = false;
      track.style.height = `${stageHeight + travel}px`;
      stage.style.height = `${stageHeight}px`;
      geo = { start: top - headerH, travel, stage: stageHeight };
    } else {
      if (layer) layer.hidden = true;
      collage.hidden = false;
      track.style.height = '';
      stage.style.height = '';
      delete hero.dataset.progress;
    }

    if (was === next) return;
    const behavior = 'instant';
    if (was && !next) {
      if (pastHero) scrollTo({ top: Math.max(0, scrollY - oldTravel), behavior });
      else if (scrollY > oldStart) {
        // Inside the scene: early half stays at the hero, late half goes to the work below.
        const work = document.getElementById('selected-work');
        if (pBefore >= 0.5 && work) scrollTo({ top: work.getBoundingClientRect().top + scrollY - headerH, behavior });
        else scrollTo({ top: oldStart, behavior });
      }
    } else if (!was && next && pastHero) {
      scrollTo({ top: scrollY + travel, behavior });
    }
  }

  function measure() {
    const vw = innerWidth, vh = innerHeight;
    const usable = vh - headerHeight();
    const stageHeight = Math.min(860, usable);
    const travel = clamp(0.65 * usable, 360, 640);
    const allowed = vw >= HERO.minW && vh >= HERO.minH && !motion.off && fits(stageHeight);
    setMode(allowed, stageHeight, travel);
    lastShown = -1;
    if (enhanced) update();
  }

  let resizeRaf = 0;
  const remeasure = () => { if (!resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; measure(); }); };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', remeasure);
  addEventListener('orientationchange', remeasure);
  if (header) new ResizeObserver(remeasure).observe(header);
  new ResizeObserver(remeasure).observe(document.getElementById('hero-copy'));
  motion.onChange(remeasure);
  document.fonts?.ready.then(remeasure);
  addEventListener('load', remeasure);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { lastShown = -1; schedule(); } });
  measure();
})();
