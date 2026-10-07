/* Shared behaviour for every page: header, mobile menu, reveals, FAQ, motion control. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  /* Motion. The OS reduced-motion preference is authoritative: under it the page shows a status
     instead of a button that cannot work. Otherwise a visitor can pause motion, and the choice
     is remembered across pages. Listeners receive the new state and re-read the scroll position. */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const KEY = 'spyd-motion';
  const stored = () => { try { return localStorage.getItem(KEY) === 'paused'; } catch { return false; } };
  const listeners = new Set();
  const motion = {
    paused: stored(),
    get os() { return reduced.matches; },
    get off() { return reduced.matches || motion.paused; },
    sync() {
      root.dataset.motion = motion.off ? 'off' : 'on';
      $$('[data-motion-toggle]').forEach((b) => {
        b.hidden = reduced.matches;
        b.setAttribute('aria-pressed', String(motion.paused));
        b.textContent = motion.paused ? 'Resume motion' : 'Pause motion';
      });
      $$('[data-motion-status]').forEach((s) => { s.hidden = !reduced.matches; });
      if (motion.off) $$('.reveal.pending').forEach((e) => e.classList.remove('pending'));
      listeners.forEach((fn) => fn(motion.off));
    },
    setPaused(paused) {
      motion.paused = paused;
      try { if (paused) localStorage.setItem(KEY, 'paused'); else localStorage.removeItem(KEY); } catch { /* private mode */ }
      motion.sync();
    },
    onChange(fn) { listeners.add(fn); },
  };
  window.SPYDMotion = motion;
  reduced.addEventListener('change', () => motion.sync());
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-motion-toggle]') && !reduced.matches) motion.setPaused(!motion.paused);
  });

  /* Header height feeds the sticky offsets of pinned sections. */
  const header = $('#site-header');
  const measure = () => root.style.setProperty('--header-h', header.offsetHeight + 'px');
  if (header) {
    new ResizeObserver(measure).observe(header);
    measure();
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu: modal dialog, background scroll lock, focus returns to the opener. */
  const menu = $('#mobile-menu');
  const opener = $('#menu-open');
  if (menu && opener) {
    opener.addEventListener('click', () => {
      document.body.style.overflow = 'hidden';
      menu.showModal();
      opener.setAttribute('aria-expanded', 'true');
    });
    menu.addEventListener('close', () => {
      document.body.style.overflow = '';
      opener.setAttribute('aria-expanded', 'false');
      opener.focus({ preventScroll: true });
    });
    $('#menu-close').addEventListener('click', () => menu.close());
    $$('a', menu).forEach((a) => a.addEventListener('click', () => menu.close()));
    // Close if the viewport grows past the mobile layout while open.
    matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches && menu.open) menu.close(); });
  }

  /* Back to top. */
  const top = $('#back-top');
  if (top) top.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: motion.off ? 'instant' : 'smooth' });
    $('.skip-link')?.focus({ preventScroll: true });
  });

  /* Reveals start hidden only once scripts run, so content survives JS failure. Anything whose top
     is above the bottom of the screen is shown, including sections skipped by a jump or anchor. */
  if ('IntersectionObserver' in window) {
    let pending = $$('.reveal').filter((el) => !motion.off && el.getBoundingClientRect().top > innerHeight);
    pending.forEach((el) => el.classList.add('pending'));
    let raf = 0;
    const check = () => {
      raf = 0;
      pending = pending.filter((el) => {
        if (motion.off || el.getBoundingClientRect().top < innerHeight - 40) { el.classList.remove('pending'); return false; }
        return true;
      });
      if (!pending.length) removeEventListener('scroll', onRevealScroll);
    };
    const onRevealScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    if (pending.length) { addEventListener('scroll', onRevealScroll, { passive: true }); addEventListener('resize', onRevealScroll); }

    /* Process connector: highlights once when the section first comes into view. */
    const flowIo = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-lit'); flowIo.unobserve(e.target); }
    }), { threshold: 0.4 });
    $$('[data-flow]').forEach((el) => flowIo.observe(el));
  }

  /* FAQ: one answer open at a time; native click and keyboard behaviour. */
  $$('[data-faq]').forEach((list) => {
    const items = $$('details', list);
    items.forEach((item) => item.addEventListener('toggle', () => {
      if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
    }));
  });

  /* Contact details from src/site.json, for links built in JS. */
  window.SPYDLinks = {
    whatsapp(text) {
      const cfg = window.SPYD || {};
      return `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text || cfg.whatsappMessage || '')}`;
    },
  };

  motion.sync();
})();
