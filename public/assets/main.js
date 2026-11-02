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

})();
