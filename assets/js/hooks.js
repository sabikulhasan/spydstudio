/* UGC page: swaps the opening caption of one illustration between hook types.
   Without JS the "Problem" opening shows on its own. */
(() => {
  const root = document.querySelector('[data-hooks]');
  if (!root) return;
  const data = JSON.parse(document.getElementById('hook-data').textContent);
  const line = root.querySelector('[data-hook-line]');
  const why = root.querySelector('[data-hook-why]');
  const label = root.querySelector('[data-hook-label]');
  const buttons = [...root.querySelectorAll('[data-hook]')];
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const h = data[btn.dataset.hook];
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    line.textContent = h.line;
    label.textContent = h.label + ':';
    why.textContent = h.why;
    // Restart the caption entrance so the change is visible.
    const box = line.parentElement;
    box.classList.remove('is-new'); void box.offsetWidth; box.classList.add('is-new');
  }));
})();
