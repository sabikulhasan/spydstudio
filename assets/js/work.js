/* Work grid: reads assets/data/work.json and renders lite YouTube cards.
   Only a thumbnail loads until someone selects a card; then the privacy-enhanced
   player replaces it. Used on /work/ (with filters) and on service pages
   (data-service filters to one service, data-limit caps the count). */
(() => {
  const grids = [...document.querySelectorAll('[data-work]')];
  if (!grids.length) return;
  const dataUrl = new URL('../data/work.json', document.currentScript.src);
  const NAMES = { 'video-ads': 'Video Ads', 'ugc-content': 'UGC Content', websites: 'Websites', marketing: 'Marketing', 'documents-decks': 'Documents & Decks' };
  const cfg = window.SPYD || {};
  const contactUrl = new URL('../../contact/', document.currentScript.src).href;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  function card(item) {
    const fig = el('article', 'work-card');
    fig.dataset.service = item.service;
    const frame = el('div', 'work-frame' + (item.vertical ? ' is-vertical' : ''));
    const play = el('button', 'work-play');
    play.type = 'button';
    play.setAttribute('aria-label', `Play video: ${item.title}`);
    const thumb = new Image();
    thumb.src = `https://i.ytimg.com/vi/${encodeURIComponent(item.id)}/hqdefault.jpg`;
    thumb.alt = '';
    thumb.loading = 'lazy';
    thumb.width = 480; thumb.height = 360;
    const icon = el('span', 'work-icon');
    icon.setAttribute('aria-hidden', 'true');
    play.append(thumb, icon);
    play.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.id)}?autoplay=1&rel=0`;
      iframe.title = item.title;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
      iframe.focus();
    });
    frame.append(play);
    const meta = el('div', 'work-meta');
    const tags = el('div', 'work-tags');
    tags.append(el('span', 'tag', NAMES[item.service] || item.service));
    if (item.format) tags.append(el('span', 'tag', item.format));
    if (item.concept) tags.append(el('span', 'tag tag-concept', 'Concept'));
    meta.append(el('h3', 'work-title', item.title), el('p', 'muted', item.client || (item.concept ? 'Self-initiated work' : '')), tags);
    fig.append(frame, meta);
    return fig;
  }

  function empty(grid, filtered) {
    const box = el('div', 'work-empty');
    box.append(el('h3', '', filtered ? 'Nothing in this category yet.' : 'Portfolio coming soon.'));
    box.append(el('p', 'muted', 'We are adding finished pieces here. Until then, see recent posts on Facebook or ask us for examples relevant to your business.'));
    const row = el('div', 'btn-row');
    const fb = el('a', 'btn btn-ghost', 'See us on Facebook');
    fb.href = cfg.facebook || '#'; fb.target = '_blank'; fb.rel = 'noopener';
    const ask = el('a', 'btn btn-primary', 'Ask for examples');
    ask.href = contactUrl;
    row.append(ask, fb);
    box.append(row);
    grid.replaceChildren(box);
  }

  function render(grid, items, filter) {
    let list = filter && filter !== 'all' ? items.filter((i) => i.service === filter) : items;
    if (grid.dataset.limit) list = list.slice(0, Number(grid.dataset.limit));
    if (!list.length) return empty(grid, Boolean(filter && filter !== 'all'));
    grid.replaceChildren(...list.map(card));
  }

  fetch(dataUrl)
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .catch(() => ({ items: [] }))
    .then(({ items = [] }) => {
      grids.forEach((grid) => render(grid, items, grid.dataset.service));
      const filters = document.querySelector('[data-work-filters]');
      if (!filters) return;
      const main = document.querySelector('.work-grid[data-work]:not([data-service])');
      filters.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        filters.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        render(main, items, btn.dataset.filter);
      });
    });
})();
