const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { LOCALES, ROUTES } = require('./i18n');
const { invia } = require('./mailer');
const { alert, esc } = require('./alert');

const HOTEL = {
  name: 'Nuovo Hotel Faro',
  street: 'Via Libertà, 7',
  zip: '98071',
  city: "Capo d'Orlando",
  province: 'ME',
  phone: '+39 0941 902466',
  phoneHref: '+390941902466',
  email: 'info@nuovohotelfaro.com',
  facebook: 'https://www.facebook.com/nuovohotelfaro',
  lat: 38.16408,
  lng: 14.746972,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nuovo+Hotel+Faro+Via+Libert%C3%A0+7+Capo+d%27Orlando',
  mapsEmbed: 'https://www.google.com/maps?q=38.16408,14.746972&z=16&output=embed',
};

function createApp() {
  const app = express();
  const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://www.nuovohotelfaro.com').replace(/\/$/, '');
  const GA4_ID = process.env.GA4_ID || '';
  const GSC_VERIFICATION = process.env.GSC_VERIFICATION || '';

  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.disable('x-powered-by');

  // Healthcheck prima di ogni altro middleware
  app.get('/health', (req, res) => res.json({ ok: true }));

  // Redirect www/https gestiti da Railway; qui solo host canonico se impostato
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", 'https://www.googletagmanager.com'],
        'connect-src': ["'self'", 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com'],
        'img-src': ["'self'", 'data:', 'https://*.google-analytics.com', 'https://www.googletagmanager.com'],
        'frame-src': ['https://www.google.com', 'https://maps.google.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d', index: false }));
  app.use(express.json({ limit: '20kb' }));

  function render(res, lang, key, view, extra = {}) {
    const t = LOCALES[lang];
    const page = t.pages[key];
    const alt = lang === 'it' ? 'en' : 'it';
    res.render(view, {
      t, lang, key, page, HOTEL, PUBLIC_URL, GA4_ID, GSC_VERIFICATION,
      path: ROUTES[key] ? ROUTES[key][lang] : null,
      altPath: ROUTES[key] ? ROUTES[key][alt] : (alt === 'en' ? '/en/' : '/'),
      routes: ROUTES,
      year: new Date().getFullYear(),
      ...extra,
    });
  }

  // Pagine
  for (const [key, paths] of Object.entries(ROUTES)) {
    for (const lang of ['it', 'en']) {
      app.get(paths[lang], (req, res) => render(res, lang, key, key));
    }
  }
  app.get('/en', (req, res) => res.redirect(301, '/en/'));

  // Redirect vecchi URL WordPress
  const legacy = {
    '/home': '/', '/hotel/': '/hotel', '/camere/': '/camere', '/tariffe': '/camere', '/tariffe/': '/camere', '/tariffe-2': '/camere', '/tariffe-2/': '/camere',
    '/booking': '/contatti', '/booking/': '/contatti', '/contatti/': '/contatti', '/contacts': '/contatti', '/dove-siamo/': '/dove-siamo',
    '/territorio/': '/territorio', '/privacy-policy': '/privacy', '/privacy-policy/': '/privacy', '/foto': '/hotel', '/foto/': '/hotel',
    '/offerte': '/contatti', '/offerte-2': '/hotel', '/last-minute': '/contatti', '/about-us': '/hotel',
  };
  const legacyTerritorio = ['il-faro', 'il-castello-il-santuario', 'la-madonna-il-santuario', 'museo-fondazione-villa-piccolo', 'castello-bastione', 'terme-romane-bagnoli', 'le-cave-del-mercadante', 'fontana-di-drago', 'parco-dei-nebrodi'];
  for (const [from, to] of Object.entries(legacy)) app.get(from, (req, res) => res.redirect(301, to));
  for (const s of legacyTerritorio) app.get([`/${s}`, `/${s}/`], (req, res) => res.redirect(301, '/territorio'));

  // SEO
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${PUBLIC_URL}/sitemap.xml\n`);
  });
  app.get('/sitemap.xml', (req, res) => {
    const urls = Object.values(ROUTES).map((p) => `  <url>\n    <loc>${PUBLIC_URL}${p.it}</loc>\n    <xhtml:link rel="alternate" hreflang="it" href="${PUBLIC_URL}${p.it}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${PUBLIC_URL}${p.en}"/>\n  </url>\n  <url>\n    <loc>${PUBLIC_URL}${p.en}</loc>\n    <xhtml:link rel="alternate" hreflang="it" href="${PUBLIC_URL}${p.it}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${PUBLIC_URL}${p.en}"/>\n  </url>`).join('\n');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);
  });

  // Modulo richiesta disponibilità
  const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });
  const schema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(150),
    phone: z.string().trim().max(30).optional().default(''),
    arrival: z.string().trim().max(20).optional().default(''),
    departure: z.string().trim().max(20).optional().default(''),
    guests: z.string().trim().max(10).optional().default(''),
    message: z.string().trim().max(3000).optional().default(''),
    consent: z.literal(true),
    lang: z.enum(['it', 'en']).optional().default('it'),
    website: z.string().max(0).optional().default(''), // honeypot
  });

  app.post('/api/contatti', formLimiter, async (req, res) => {
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ ok: false });
    const d = parsed.data;
    const righe = [
      ['Nome', d.name], ['Email', d.email], ['Telefono', d.phone], ['Arrivo', d.arrival], ['Partenza', d.departure],
      ['Ospiti', d.guests], ['Lingua', d.lang], ['Messaggio', d.message],
    ];
    const text = righe.map(([k, v]) => `${k}: ${v}`).join('\n');
    const html = `<h2>Nuova richiesta dal sito</h2><table cellpadding="6">${righe.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>`;
    try {
      const r = await invia({
        to: process.env.CONTACT_EMAIL || HOTEL.email,
        subject: `Richiesta disponibilità – ${d.name}${d.arrival ? ` (${d.arrival})` : ''}`,
        text, html, replyTo: d.email,
      });
      if (!r.inviata) {
        alert('modulo-contatti', `Invio richiesta fallito: ${r.motivo}\n\n${text}`);
        return res.status(502).json({ ok: false });
      }
      return res.json({ ok: true });
    } catch (e) {
      alert('modulo-contatti', `Eccezione invio: ${e.message}\n\n${text}`);
      return res.status(502).json({ ok: false });
    }
  });

  // Test alert (protetto da token)
  app.post('/admin/alert-test', async (req, res) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token || req.get('x-admin-token') !== token) return res.status(404).end();
    const r = await alert('test', 'Alert di prova manuale', { forza: true });
    res.json(r);
  });

  // 404
  app.use((req, res) => {
    const lang = req.path.startsWith('/en') ? 'en' : 'it';
    res.status(404);
    render(res, lang, 'notFound', 'notfound', { altPath: lang === 'it' ? '/en/' : '/' });
  });

  // Errori
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    alert('errore-5xx', `${req.method} ${req.originalUrl}\n${err.stack || err.message}`);
    res.status(500).send('Errore interno. / Internal error.');
  });

  return app;
}

module.exports = { createApp, HOTEL };
