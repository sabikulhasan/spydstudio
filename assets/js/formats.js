/* Video Ads format preview: reframes one illustration between feed shapes. Without JS the
   9:16 version shows on its own, which is still a complete picture. */
(() => {
  const root = document.querySelector('[data-fmt]');
  if (!root) return;
  const frame = root.querySelector('.fmt-frame');
  const where = root.querySelector('[data-fmt-where]');
  const buttons = [...root.querySelectorAll('[data-ratio]')];
  const info = {
    '9/16': ['tall', 'Reels, TikTok, YouTube Shorts and Stories'],
    '4/5': ['portrait', 'Facebook and Instagram feeds'],
    '1/1': ['square', 'Feeds and marketplace placements'],
    '16/9': ['wide', 'YouTube, your website and presentations'],
  };
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const r = btn.dataset.ratio;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    frame.style.setProperty('--r', r);
    frame.dataset.shape = info[r][0];
    where.textContent = info[r][1];
  }));
  // Safe zones describe vertical video, so turning them on switches to 9:16.
  root.querySelector('[data-fmt-safe]').addEventListener('change', (e) => {
    frame.classList.toggle('show-safe', e.target.checked);
    if (e.target.checked && frame.dataset.shape !== 'tall') buttons[0].click();
  });
})();
