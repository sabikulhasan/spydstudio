/* Contact form.
   With formEndpoint set in src/site.json (Formspree or Web3Forms), the form posts there and
   goes to /thanks/. Without it, the form prepares a message for WhatsApp or the email app;
   the visitor reviews and sends it there, so nothing is "received" when a button is pressed.
   ?service=video-ads preselects the service; ?message= or ?brief= prefills the message. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const cfg = window.SPYD || {};
  const $ = (id) => document.getElementById(id);
  const status = $('form-status');
  const params = new URLSearchParams(location.search);

  const service = params.get('service');
  if (service && form.service.querySelector(`option[value="${CSS.escape(service)}"]`)) form.service.value = service;
  const prefill = params.get('message') || params.get('brief');
  if (prefill && !form.message.value) form.message.value = prefill.slice(0, 2000);

  /* Brief chips: "Where will it run?" only applies to services that publish to feeds. */
  const platforms = $('cf-platforms');
  const syncPlatforms = () => {
    const list = platforms.dataset.services.split(' ');
    platforms.hidden = Boolean(form.service.value) && !list.includes(form.service.value);
  };
  form.service.addEventListener('change', syncPlatforms);
  // "Starting from scratch" and "Not sure yet" can't be combined with other answers in their group.
  form.querySelectorAll('.chip input').forEach((box) => box.addEventListener('change', () => {
    if (!box.checked) return;
    box.closest('.chips').querySelectorAll('input').forEach((other) => {
      if (other !== box && ('exclusive' in box.dataset || 'exclusive' in other.dataset)) other.checked = false;
    });
  }));
  syncPlatforms();

  /* Draft: kept only in this browser (localStorage), so a visitor who leaves to check something
     doesn't lose what they typed. Saving is visible, and "Clear form" removes it. Links that
     prefill the form (?service=, ?brief=) win over an old draft. */
  const DRAFT = 'spyd-contact-draft';
  const draftStatus = $('draft-status');
  const fields = ['name', 'email', 'phone', 'company', 'service', 'timeline', 'message'];
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch { return null; } },
    set(v) { try { localStorage.setItem(DRAFT, JSON.stringify(v)); return true; } catch { return false; } },
    clear() { try { localStorage.removeItem(DRAFT); } catch { /* blocked */ } },
  };
  const snapshot = () => ({
    ...Object.fromEntries(fields.map((f) => [f, form[f].value])),
    chips: [...form.querySelectorAll('.chip input:checked')].map((i) => `${i.name}:${i.value}`),
  });
  const isEmpty = (d) => !d || (!fields.some((f) => f !== 'service' && f !== 'timeline' && d[f]?.trim()) && !d.chips?.length);
  const showSaved = (text) => { draftStatus.hidden = false; draftStatus.querySelector('[data-draft-text]').textContent = text; };
  const saved = store.get();
  if (!isEmpty(saved) && !service && !prefill) {
    fields.forEach((f) => { if (saved[f] != null) form[f].value = saved[f]; });
    (saved.chips || []).forEach((key) => {
      const [name, ...rest] = key.split(':');
      const box = form.querySelector(`.chip input[name="${CSS.escape(name)}"][value="${CSS.escape(rest.join(':'))}"]`);
      if (box) box.checked = true;
    });
    syncPlatforms();
    showSaved('We kept your draft from last time, on this device only.');
  }
  let saveTimer = 0;
  form.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const d = snapshot();
      if (isEmpty(d)) { store.clear(); draftStatus.hidden = true; return; }
      if (store.set(d)) showSaved('Draft saved on this device.');
    }, 400);
  });
  $('draft-clear').addEventListener('click', () => {
    store.clear();
    form.reset();
    draftStatus.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach((e) => { e.hidden = true; });
    status.textContent = 'Form cleared.';
    form.name.focus();
  });

  if (cfg.bookingUrl) {
    const booking = $('booking-card');
    booking.href = cfg.bookingUrl;
    booking.hidden = false;
  }
  if (cfg.formEndpoint) {
    $('form-actions').innerHTML = '<button class="btn btn-primary" type="submit" data-send="endpoint">Send message <span class="arrow" aria-hidden="true">→</span></button>';
    $('form-note').textContent = 'We reply to the email or number you give us.';
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = 'Copied'; }
    catch { btn.textContent = btn.dataset.copy; }
    setTimeout(() => { btn.textContent = 'Copy address'; }, 2000);
  }));

  /* aria-describedby keeps its helper IDs; error IDs are added and removed individually. */
  function describe(field, id, on) {
    const ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
    if (on) ids.push(id);
    if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
    else field.removeAttribute('aria-describedby');
  }

  const checks = [
    { id: 'cf-name-error', fields: () => [form.name], bad: () => !form.name.value.trim() },
    { id: 'cf-email-error', fields: () => [form.email], bad: () => Boolean(form.email.value.trim()) && !form.email.checkValidity() },
    { id: 'cf-reach-error', fields: () => [form.email, form.phone], bad: () => !form.email.value.trim() && !form.phone.value.trim() },
    { id: 'cf-message-error', fields: () => [form.message], bad: () => !form.message.value.trim() && !form.querySelector('.chip input:checked') },
  ];

  function apply() {
    const invalid = new Set();
    checks.forEach((c) => {
      const bad = c.bad();
      $(c.id).hidden = !bad;
      c.fields().forEach((f) => { describe(f, c.id, bad); if (bad) invalid.add(f); });
    });
    [form.name, form.email, form.phone, form.message].forEach((f) => {
      if (invalid.has(f)) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid');
    });
    return [form.name, form.email, form.phone, form.message].filter((f) => invalid.has(f));
  }

  let attempted = false;
  function validate() {
    attempted = true;
    const bad = apply();
    if (bad.length) {
      bad[0].focus();
      status.textContent = bad.length === 1 ? 'Please correct the highlighted field.' : `Please correct the ${bad.length} highlighted fields.`;
    }
    return !bad.length;
  }
  // After a failed attempt, re-check as fields change (on change, not every keystroke announced).
  form.addEventListener('change', () => { if (attempted) apply(); });

  function summary() {
    const f = form;
    const value = (field) => field.value.trim();
    const details = [
      `Name: ${value(f.name)}`,
      value(f.company) && `Business: ${value(f.company)}`,
      `Service: ${f.service.selectedOptions[0].textContent}`,
      f.timeline.value && `Timeline: ${f.timeline.value}`,
      value(f.email) && `Email: ${value(f.email)}`,
      value(f.phone) && `Phone: ${value(f.phone)}`,
    ].filter(Boolean);
    const picked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].filter((i) => !i.closest('fieldset').hidden).map((i) => i.value);
    const brief = [['Goal', picked('goal')], ['Runs on', picked('platform')], ['We already have', picked('have')]]
      .filter(([, list]) => list.length).map(([label, list]) => `${label}: ${list.join(', ')}`);
    if (brief.length) details.unshift(...brief);
    return ['Hi SPY-D Studio,', '', ...(value(f.message) ? [value(f.message), ''] : []), ...details].join('\n');
  }

  const fallback = $('copy-fallback');
  function showFallback(text) {
    fallback.hidden = false;
    const area = $('cf-prepared');
    area.value = text;
    area.focus();
    area.select();
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      fallback.hidden = true;
      status.textContent = `Message copied. Paste it into WhatsApp or an email to ${cfg.email}.`;
    } catch {
      showFallback(text);
      status.textContent = 'Copying wasn’t allowed by the browser. The message is shown below to select and copy.';
    }
  }

  // Exposed so the handoff URLs can be tested without opening anything.
  window.SPYDContact = {
    whatsappUrl: () => window.SPYDLinks.whatsapp(summary()),
    emailUrl: () => {
      const subject = `Project enquiry${form.company.value.trim() ? ' from ' + form.company.value.trim() : ''}`;
      return `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
    },
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website.value) return; // honeypot: bots fill hidden fields
    if (!validate()) return;
    const mode = e.submitter?.dataset.send || (cfg.formEndpoint ? 'endpoint' : 'whatsapp');
    // The form is never cleared after a handoff: the visitor may need to try another route.
    if (mode === 'copy') { copy(summary()); return; }
    if (mode === 'whatsapp') {
      // window.open with noopener returns null whether or not a popup blocker stopped it,
      // so the status never claims a tab opened.
      window.open(window.SPYDContact.whatsappUrl(), '_blank', 'noopener');
      status.textContent = 'Draft prepared. Review and send it in WhatsApp. If WhatsApp didn’t open, use “Copy prepared message”.';
      return;
    }
    if (mode === 'email') {
      location.href = window.SPYDContact.emailUrl();
      status.textContent = 'Draft prepared. Review and send it in your email app. If it didn’t open, use “Copy prepared message”.';
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(cfg.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!res.ok) throw new Error(res.statusText);
      location.href = new URL('../thanks/', location.href).href;
    } catch {
      button.disabled = false;
      status.textContent = `The message didn't send. Please try again, or email ${cfg.email}.`;
    }
  });
})();
