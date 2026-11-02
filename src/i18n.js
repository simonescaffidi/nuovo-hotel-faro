// Lingue IT (default, senza prefisso) / EN (/en/...)
const it = require('../locales/it.json');
const en = require('../locales/en.json');

const LOCALES = { it, en };

// chiave pagina -> percorso per lingua
const ROUTES = {
  home: { it: '/', en: '/en/' },
  hotel: { it: '/hotel', en: '/en/hotel' },
  camere: { it: '/camere', en: '/en/rooms' },
  territorio: { it: '/territorio', en: '/en/area' },
  'dove-siamo': { it: '/dove-siamo', en: '/en/getting-here' },
  contatti: { it: '/contatti', en: '/en/contact' },
  privacy: { it: '/privacy', en: '/en/privacy' },
  cookie: { it: '/cookie', en: '/en/cookies' },
};

module.exports = { LOCALES, ROUTES };
