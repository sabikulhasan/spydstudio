/* Contact form.
   With formEndpoint set in src/site.json (Formspree or Web3Forms), the form posts there and
   goes to /thanks/. Without it, the message opens in WhatsApp or the email app, ready to send.
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

  function showError(field, errorId, show) {
    const err = $(errorId);
    err.hidden = !show;
    if (field) {
      field.toggleAttribute('aria-invalid', show);
      if (show) field.setAttribute('aria-describedby', errorId); else field.removeAttribute('aria-describedby');
    }
    return show;
  }

  function validate() {
    const name = form.name.value.trim(), email = form.email.value.trim(), phone = form.phone.value.trim();
    const bad = [];
    if (showError(form.name, 'cf-name-error', !name)) bad.push(form.name);
    if (showError(form.email, 'cf-email-error', Boolean(email) && !form.email.checkValidity())) bad.push(form.email);
    if (showError(null, 'cf-reach-error', !email && !phone)) bad.push(form.email);
    if (showError(form.message, 'cf-message-error', !form.message.value.trim())) bad.push(form.message);
    if (bad.length) bad[0].focus();
    return !bad.length;
  }

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
    return ['Hi SPY-D Studio,', '', value(f.message), '', ...details].join('\n');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website.value) return; // honeypot: bots fill hidden fields
    if (!validate()) return;
    const mode = e.submitter?.dataset.send || (cfg.formEndpoint ? 'endpoint' : 'whatsapp');
    if (mode === 'whatsapp') { window.open(window.SPYDLinks.whatsapp(summary()), '_blank', 'noopener'); status.textContent = 'WhatsApp opened in a new tab with your message.'; return; }
    if (mode === 'email') {
      const subject = `Project enquiry${form.company.value.trim() ? ' from ' + form.company.value.trim() : ''}`;
      location.href = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
      status.textContent = 'Your email app should open with the message ready to send.';
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
