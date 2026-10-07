/* Home services: five ordinary buttons choose which service panel is shown.
   Without JavaScript all five panels stay visible in normal flow and the buttons stay hidden.
   Selecting a service never moves the scroll position or keyboard focus, and pauses any clip
   playing in the panel being hidden. */
(() => {
  const group = document.querySelector('[data-svc-buttons]');
  const wrap = document.querySelector('[data-svc-panels]');
  if (!group || !wrap) return;
  const buttons = [...group.querySelectorAll('button')];
  const panels = buttons.map((b) => document.getElementById(b.getAttribute('aria-controls')));

  function select(index) {
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((p, i) => {
      // Only the selected service's clip may play: stop and rewind the outgoing one.
      if (i !== index) p.querySelectorAll('video').forEach((v) => { if (!v.paused) v.pause(); if (v.currentTime) v.currentTime = 0; });
      p.hidden = i !== index;
    });
  }

  buttons.forEach((b, i) => b.addEventListener('click', () => select(i)));
  group.hidden = false;
  wrap.classList.add('is-enhanced');
  select(Math.max(0, buttons.findIndex((b) => b.getAttribute('aria-pressed') === 'true')));
})();
