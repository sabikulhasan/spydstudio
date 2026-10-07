/* Home services showcase: a pinned scene driven by one scroll-progress value.
   0–0.08 scene settles · 0.08–0.72 services advance · 0.72–0.82 lists fade ·
   0.82–0.96 dotted workflow appears · 0.96–1 hold and release.
   On narrow screens and with reduced motion the scene is not pinned; buttons switch services. */
(() => {
  const section = document.getElementById('showcase');
  if (!section) return;
  const motion = window.SPYDMotion || { off: false, onChange() {} };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const $$ = (s) => [...section.querySelectorAll(s)];
  const scene = section.querySelector('.scene');
  const finale = section.querySelector('.finale');
  const thumbs = section.querySelector('.scene-thumbs');
  const backgrounds = $$('.scene-bg');
  const services = $$('.scene-services [data-index]');
  const details = $$('.scene-details [data-index]');
  const buttons = $$('.scene-switch button');
  const lists = $$('.scene-fade');
  const count = services.length;
  const PHASE = { enter: 0.08, advanceEnd: 0.72, fadeEnd: 0.82, finaleEnd: 0.96 };
  const compact = matchMedia('(max-width: 899px)');
  let active = -1, raf = 0;

  function setActive(i) {
    if (i === active) return;
    active = i;
    backgrounds.forEach((el, k) => el.classList.toggle('is-active', k === i));
    services.forEach((el, k) => el.classList.toggle('is-active', k === i));
    details.forEach((el, k) => { el.hidden = k !== i; });
    buttons.forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-pressed', String(k === i)); });
  }

  function setFinale(amount) {
    finale.style.opacity = String(amount);
    finale.classList.toggle('is-live', amount > 0.9);
    // Hidden layers must not take focus.
    if (amount > 0.9) { finale.removeAttribute('inert'); scene.querySelector('.scene-main').setAttribute('inert', ''); }
    else { finale.setAttribute('inert', ''); scene.querySelector('.scene-main').removeAttribute('inert'); }
  }

  function update() {
    raf = 0;
    const pinned = !compact.matches && !motion.off;
    section.classList.toggle('is-pinned', pinned);
    if (!pinned) {
      setFinale(0);
      lists.forEach((el) => { el.style.opacity = ''; });
      thumbs.style.transform = '';
      if (active < 0) setActive(0);
      return;
    }
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    const box = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - scene.offsetHeight);
    const p = clamp((header - box.top) / travel);
    const advance = clamp((p - PHASE.enter) / (PHASE.advanceEnd - PHASE.enter));
    setActive(Math.min(count - 1, Math.floor(advance * count)));
    const fade = 1 - clamp((p - PHASE.advanceEnd) / (PHASE.fadeEnd - PHASE.advanceEnd));
    lists.forEach((el) => { el.style.opacity = String(fade); });
    thumbs.style.transform = `translateY(${-p * 260}px)`;
    backgrounds.forEach((el) => { el.style.transform = `scale(${1.02 + p * 0.05})`; });
    setFinale(clamp((p - PHASE.fadeEnd) / (PHASE.finaleEnd - PHASE.fadeEnd)));
    section.dataset.progress = p.toFixed(3);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

  buttons.forEach((b, k) => b.addEventListener('click', () => setActive(k)));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  compact.addEventListener('change', schedule);
  motion.onChange(schedule);
  setActive(0);
  update();
})();
