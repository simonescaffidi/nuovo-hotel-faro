(function () {
  // Menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
  }

  // Header compatto allo scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mappa Google: caricata solo con consenso "contenuti esterni"
  var map = document.querySelector('.map[data-map-src]');
  function loadMap() {
    if (!map || map.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = map.getAttribute('data-map-src');
    f.title = map.getAttribute('data-map-title');
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('allowfullscreen', '');
    map.innerHTML = '';
    map.appendChild(f);
  }
  if (map) {
    var btn = map.querySelector('[data-map-load]');
    if (btn) btn.addEventListener('click', function () {
      var c = (window.NHFConsent && window.NHFConsent.get()) || {};
      c.external = true; window.NHFConsent && window.NHFConsent.set({ analytics: !!c.analytics, external: true });
      loadMap();
    });
    var c0 = window.NHFConsent && window.NHFConsent.get();
    if (c0 && c0.external) loadMap();
    document.addEventListener('consent:change', function (e) { if (e.detail.external) loadMap(); });
  }

  // Modulo contatti
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var arr = form.querySelector('[name="arrival"]');
    var dep = form.querySelector('[name="departure"]');
    var today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (arr) arr.min = today;
    if (arr && dep) arr.addEventListener('change', function () { dep.min = arr.value || today; });
    if (dep) dep.min = today;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.consent = form.querySelector('[name="consent"]').checked;
      btn.disabled = true; status.className = 'form-status'; status.textContent = form.getAttribute('data-sending');
      fetch('/api/contatti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (r) {
          if (r.ok) { status.className = 'form-status ok'; status.textContent = form.getAttribute('data-ok'); form.reset(); if (window.gtag) window.gtag('event', 'generate_lead'); }
          else { status.className = 'form-status err'; status.textContent = form.getAttribute('data-error'); }
        })
        .catch(function () { status.className = 'form-status err'; status.textContent = form.getAttribute('data-error'); })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
