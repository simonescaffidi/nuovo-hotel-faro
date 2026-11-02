// Consenso cookie (Accetta / Rifiuta / Personalizza). GA4 e Google Maps solo dopo consenso.
(function () {
  var KEY = 'nhf_consent';
  var VERSION = 1;
  var box = document.getElementById('consent');
  if (!box) return;
  var prefs = box.querySelector('.consent-prefs');
  var btnSave = box.querySelector('[data-consent="save"]');
  var btnCustom = box.querySelector('[data-consent="customize"]');

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return v && v.v === VERSION ? v : null; } catch (e) { return null; }
  }
  function write(c) {
    c.v = VERSION; c.ts = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* storage non disponibile */ }
    apply(c);
    document.dispatchEvent(new CustomEvent('consent:change', { detail: c }));
  }
  function show() {
    var c = read() || {};
    box.querySelector('[name="analytics"]').checked = !!c.analytics;
    box.querySelector('[name="external"]').checked = !!c.external;
    box.hidden = false;
  }
  function hide() { box.hidden = true; prefs.hidden = true; btnSave.hidden = true; btnCustom.hidden = false; }

  var gaLoaded = false;
  function loadGA() {
    var id = document.body.getAttribute('data-ga');
    if (!id || gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function apply(c) {
    if (c.analytics) loadGA();
    else if (gaLoaded) { location.reload(); }
  }

  box.addEventListener('click', function (e) {
    var a = e.target.getAttribute('data-consent');
    if (!a) return;
    if (a === 'accept') { write({ analytics: true, external: true }); hide(); }
    if (a === 'reject') { write({ analytics: false, external: false }); hide(); }
    if (a === 'customize') { prefs.hidden = false; btnSave.hidden = false; btnCustom.hidden = true; }
    if (a === 'save') {
      write({ analytics: box.querySelector('[name="analytics"]').checked, external: box.querySelector('[name="external"]').checked });
      hide();
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-open]')) { e.preventDefault(); show(); }
  });

  window.NHFConsent = { get: read, set: write };
  var current = read();
  if (current) apply(current); else show();
})();
