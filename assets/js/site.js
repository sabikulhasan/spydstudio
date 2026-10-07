/* Shared behaviour for every page: header, mobile menu, reveals, FAQ, motion control. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  /* Motion: the OS preference, plus any panel's pause button, switch motion off site-wide. */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new Set();
  const motion = {
    off: reduced.matches,
    set(off) {
      motion.off = off;
      root.dataset.motion = off ? 'off' : 'on';
      $$('[data-motion-toggle]').forEach((b) => {
        b.setAttribute('aria-pressed', String(off));
        b.textContent = off ? 'Play motion' : 'Pause motion';
      });
      if (off) $$('.reveal.pending').forEach((e) => e.classList.remove('pending'));
      listeners.forEach((fn) => fn(off));
    },
    onChange(fn) { listeners.add(fn); },
  };
  window.SPYDMotion = motion;
  reduced.addEventListener('change', (e) => motion.set(e.matches));
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-motion-toggle]');
    if (toggle) motion.set(reduced.matches || !motion.off);
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

  /* Reveals start hidden only once the observer exists, so content survives JS failure. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.remove('pending'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => {
      const box = el.getBoundingClientRect();
      if (!motion.off && box.top > innerHeight) el.classList.add('pending');
      io.observe(el);
    });

    /* Looping panels pause offscreen and on hidden tabs. */
    const loopIo = new IntersectionObserver((entries) => entries.forEach((e) => {
      e.target.classList.toggle('paused', !e.isIntersecting);
    }));
    $$('[data-loop]').forEach((el) => loopIo.observe(el));
  }
  document.addEventListener('visibilitychange', () => root.classList.toggle('tab-hidden', document.hidden));

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

  motion.set(motion.off);
})();
