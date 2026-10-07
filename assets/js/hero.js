/* Home hero: centre-out scale gallery.
   Cards are small near the centre and grow as they travel outward. Wheel input over the
   gallery advances a finite cycle while the page stays put; once the cycle completes, the
   next downward gesture scrolls the page. Horizontal drag and arrow keys drive the same value.
   Geometry follows the reference build spec (BUILD_INSTRUCTIONS.md, step 4.2). */
(() => {
  const rail = document.getElementById('hero-rail');
  if (!rail) return;
  const motion = window.SPYDMotion || { off: false, onChange() {} };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  const media = JSON.parse(document.getElementById('hero-media').textContent);
  const HERO = {
    slots: 24,          // 12 pairs: one left and one right card per level
    start: 2,           // settled progress after the entrance
    end: 24,            // finite forward cycle; after this the page scrolls normally
    wheelGain: 0.0032,  // progress units per wheel pixel
    maxWheelStep: 1.8,  // clamp per wheel event
    maxLag: 3.6,        // max target-to-displayed lag
    settleRate: 8.5, dragRate: 14, entranceRate: 2.8,
    frameW: 468, frameH: 624,
  };

  let shown = motion.off ? HERO.start : 0;
  let target = HERO.start;
  let frame = 0, last = 0, drag = null, entering = !motion.off;

  const cards = [];
  for (let i = 0; i < HERO.slots; i++) {
    const item = media[i % media.length];
    const fig = document.createElement('figure');
    fig.className = 'hero-card';
    fig.setAttribute('aria-hidden', 'true');
    const art = document.createElement('div');
    art.className = 'hero-art';
    const img = new Image();
    img.src = item.src; img.alt = ''; img.draggable = false; img.decoding = 'async';
    img.width = 600; img.height = 800;
    if (i > 8) img.loading = 'lazy';
    art.append(img);
    const cap = document.createElement('figcaption');
    cap.textContent = item.caption;
    fig.append(art, cap);
    rail.append(fig);
    cards.push({ fig, img, cap });
  }

  function draw() {
    const w = rail.clientWidth, h = rail.clientHeight, pairs = HERO.slots / 2;
    if (w <= 0 || h <= 0) return;
    cards.forEach(({ fig, img, cap }, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const level = (((Math.floor(i / 2) + shown / 2) % pairs) + pairs) % pairs;
      if (level >= 6) { fig.style.opacity = '0'; fig.style.visibility = 'hidden'; return; }
      fig.style.visibility = '';
      const distance = 18 * Math.expm1(0.7 * level) * w / 1440;
      const next = 18 * Math.expm1(0.7 * (level + 1)) * w / 1440;
      const gap = Math.min(8 + 4 * Math.min(level / 5, 1), (next - distance) * 0.45);
      const natural = Math.max(1, next - distance - gap);
      const maxW = Math.min(0.336 * w, HERO.frameW), soft = 0.625 * maxW;
      const range = maxW * (1 + 0.5 * clamp((w - 1600) / 320)) - soft;
      const width = natural <= soft ? natural : soft + range * (1 - Math.exp(-(natural - soft) / range));
      const height = Math.min(width / 0.75 * (w <= 600 ? 2 : 1), h * 0.96);
      const left = side > 0 ? w / 2 + distance + gap / 2 : w / 2 - distance - gap / 2 - width;
      const top = (h - height) / 2;
      const sx = width / HERO.frameW, sy = height / HERO.frameH, cover = Math.max(sx, sy);
      const fade = clamp(level / 0.55);
      const radius = 10 + 14 * (1 - clamp(level / 5)) ** 2;
      fig.style.transform = `translate3d(${left}px,${top}px,0) scale(${sx},${sy})`;
      fig.style.borderRadius = `${Math.min(radius, width / 2) / sx}px / ${Math.min(radius, height / 2) / sy}px`;
      fig.style.opacity = String(fade * fade * (3 - 2 * fade));
      fig.style.zIndex = String(Math.floor(level) + 1);
      img.style.transform = `scale(${cover / sx},${cover / sy})`;
      // Captions counter-scale so text stays at reading size; only shown on wide cards.
      const readable = clamp((width - 86) / 84);
      cap.style.transform = `scale(${1 / sx},${1 / sy})`;
      cap.style.top = `${-26 / sy}px`;
      cap.style.width = `${Math.max(width - 8, 0)}px`;
      cap.style.opacity = String(readable * readable * (3 - 2 * readable));
      cap.style.textAlign = side < 0 ? 'right' : 'left';
      cap.style.left = side < 0 ? 'auto' : '0';
      cap.style.right = side < 0 ? '0' : 'auto';
      cap.style.transformOrigin = side < 0 ? '100% 0' : '0 0';
    });
    rail.dataset.progress = shown.toFixed(3);
  }

  function tick(time) {
    frame = 0;
    if (motion.off || document.hidden) { last = 0; draw(); return; }
    const dt = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60;
    last = time;
    const rate = drag ? HERO.dragRate : entering ? HERO.entranceRate : HERO.settleRate;
    shown += (target - shown) * (1 - Math.exp(-rate * dt));
    if (Math.abs(target - shown) < 0.0005) { shown = target; entering = false; last = 0; draw(); return; }
    draw();
    frame = requestAnimationFrame(tick);
  }
  function request() { if (!motion.off && !frame) { last = 0; frame = requestAnimationFrame(tick); } }
  function advance(delta) {
    if (motion.off) return;
    entering = false;
    target = clamp(target + delta, 0, HERO.end);
    target = clamp(target, shown - HERO.maxLag, shown + HERO.maxLag);
    request();
  }

  rail.addEventListener('wheel', (e) => {
    if (motion.off || document.hidden || e.ctrlKey || e.metaKey) return; // keep browser zoom native
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
    if (Math.abs(delta) < 0.01) return;
    const finished = shown >= HERO.end - 0.001 && target >= HERO.end - 0.001;
    const atStart = shown <= 0.001 && target <= 0.001;
    if ((delta > 0 && finished) || (delta < 0 && atStart) || !e.cancelable) return; // release to the page
    e.preventDefault();
    advance(clamp(delta * HERO.wheelGain, -HERO.maxWheelStep, HERO.maxWheelStep));
  }, { passive: false });

  // Horizontal drag moves the gallery; touch-action: pan-y keeps vertical swipes scrolling the page.
  rail.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !e.isPrimary) return;
    const box = rail.getBoundingClientRect();
    entering = false;
    drag = { id: e.pointerId, x: e.clientX, dir: e.clientX < box.left + box.width / 2 ? -1 : 1 };
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id || motion.off) return;
    const dx = e.clientX - drag.x;
    drag.x = e.clientX;
    advance(dx / Math.max(rail.clientWidth, 1) * drag.dir * 7.4);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    rail.addEventListener(type, () => { drag = null; if (type === 'pointercancel') target = shown; });
  }
  rail.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || motion.off) return;
    e.preventDefault();
    advance(e.key === 'ArrowLeft' ? -1 : 1);
  });

  motion.onChange((off) => {
    if (off) { if (frame) cancelAnimationFrame(frame); frame = 0; drag = null; target = shown = Math.max(shown, HERO.start); draw(); }
    else request();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) request(); });
  new ResizeObserver(draw).observe(rail);
  draw();
  request();

  /* Inquiry box: hand the typed brief to the contact form. The text is never overwritten. */
  const form = document.getElementById('hero-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = form.elements.brief.value.trim();
    const url = new URL(form.action, location.href);
    if (text) url.searchParams.set('message', text.slice(0, 500));
    location.href = url.href;
  });
})();
