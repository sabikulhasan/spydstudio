/* Services page: outcome picker. Maps what the visitor wants to the matching services and
   hands the choice to the contact form (?service= and ?brief=). Without JS the service list
   above it is the whole page, so nothing is lost. */
(() => {
  const root = document.querySelector('[data-chooser]');
  if (!root) return;
  const names = { 'video-ads': 'Video Ads', 'ugc-content': 'UGC Content', websites: 'Websites', marketing: 'Marketing', 'documents-decks': 'Documents & Decks' };
  const picks = [...root.querySelectorAll('.pick')];
  const out = root.querySelector('[data-chooser-result]');
  const contact = new URL('../contact/', location.href);
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function render() {
    const on = picks.filter((p) => p.getAttribute('aria-pressed') === 'true');
    if (!on.length) { out.innerHTML = '<p class="chooser-empty">Your match will show here.</p>'; return; }
    const items = on.map((p) => `<li><a href="../${p.dataset.service}/"><b>${esc(names[p.dataset.service])}</b></a><span>${esc(p.dataset.why)}</span></li>`).join('');
    const list = on.map((p) => p.dataset.brief);
    const brief = `I'd like help with ${list.length > 1 ? list.slice(0, -1).join(', ') + ' and ' + list.at(-1) : list[0]}.`;
    const url = new URL(contact);
    url.searchParams.set('service', on.length === 1 ? on[0].dataset.service : '');
    if (on.length > 1) url.searchParams.delete('service');
    url.searchParams.set('brief', brief);
    const lead = on.length === 1 ? 'Start with' : `${on.length} services, planned together`;
    out.innerHTML = `<p class="chooser-lead">${lead}</p><ul class="chooser-list">${items}</ul>
      <a class="btn btn-primary" href="${esc(url.href)}">Start this project <span class="arrow" aria-hidden="true">→</span></a>`;
  }
  picks.forEach((p) => p.addEventListener('click', () => {
    p.setAttribute('aria-pressed', String(p.getAttribute('aria-pressed') !== 'true'));
    render();
  }));
})();
