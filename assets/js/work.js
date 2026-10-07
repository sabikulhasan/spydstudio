/* Work cards are rendered into the HTML by tools/build.py from assets/data/work.json, so the
   projects are readable without JavaScript. This script adds:
   - service filters on /work/ (with a message and reset when a category is empty), and
   - click-to-play: a privacy-enhanced YouTube player or native <video> loads only after a
     visitor selects it. Opening one player closes any other. */
(() => {
  const playing = new Map(); // frame -> original children

  function close(frame) {
    const original = playing.get(frame);
    if (!original) return;
    frame.querySelectorAll('video').forEach((v) => v.pause());
    frame.replaceChildren(...original);
    playing.delete(frame);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.work-play');
    if (!btn) return;
    const frame = btn.closest('.work-frame');
    [...playing.keys()].forEach((f) => { if (f !== frame) close(f); });
    playing.set(frame, [...frame.childNodes]);
    let player;
    if (btn.dataset.youtube) {
      player = document.createElement('iframe');
      player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.youtube)}?autoplay=1&rel=0`;
      player.title = btn.dataset.title || 'Video';
      player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      player.allowFullscreen = true;
    } else if (btn.dataset.video) {
      player = document.createElement('video');
      player.src = btn.dataset.video;
      player.controls = true;
      player.playsInline = true;
      player.preload = 'none';
      const poster = frame.querySelector('img');
      if (poster) player.poster = poster.currentSrc || poster.src;
      player.setAttribute('aria-label', btn.dataset.title || 'Video');
      player.addEventListener('error', () => {
        const note = document.createElement('p');
        note.className = 'work-error';
        note.textContent = 'This video could not be loaded.';
        frame.replaceChildren(...playing.get(frame), note);
        playing.delete(frame);
      });
    } else return;
    frame.classList.add('is-playing');
    frame.replaceChildren(player);
    player.focus();
    if (player.play) player.play().catch(() => { /* the visitor can press play in the controls */ });
  });

  const filters = document.querySelector('[data-work-filters]');
  const grid = document.querySelector('.work-grid[data-work]');
  if (!filters || !grid) return;
  const cards = [...grid.querySelectorAll('.work-card')];
  const empty = document.createElement('div');
  empty.className = 'work-empty work-empty-filter';
  empty.hidden = true;
  empty.innerHTML = '<p>Nothing in this category yet.</p><button class="btn btn-ghost" type="button" data-filter="all">Show all work</button>';
  grid.after(empty);

  function apply(filter) {
    filters.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    let shown = 0;
    cards.forEach((c) => { c.hidden = filter !== 'all' && c.dataset.service !== filter; if (!c.hidden) shown++; });
    empty.hidden = shown > 0;
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (btn && (filters.contains(btn) || empty.contains(btn))) apply(btn.dataset.filter);
  });
  filters.hidden = false;
})();
