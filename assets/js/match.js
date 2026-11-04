/* Websites page: switches the landing page in the message-match illustration. Without JS the
   matched page shows on its own. */
(() => {
  const root = document.querySelector('[data-mm]');
  if (!root) return;
  const stage = root.querySelector('.mm-stage');
  const buttons = [...root.querySelectorAll('[data-mm-mode]')];
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    stage.dataset.mode = btn.dataset.mmMode;
  }));
})();
