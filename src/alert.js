// Alert errori via email (sito senza DB: anti-spam 30 min per tipo tenuto in memoria)
const { invia } = require('./mailer');

const SLUG = 'nuovo-hotel-faro';
const ANTISPAM_MS = 30 * 60 * 1000;
const ultimi = new Map();

function oraRoma() {
  return new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'medium' }).format(new Date());
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function alert(tipo, dettagli = '', { forza = false } = {}) {
  const ora = Date.now();
  if (!forza && ultimi.has(tipo) && ora - ultimi.get(tipo) < ANTISPAM_MS) return { inviata: false, motivo: 'antispam' };
  ultimi.set(tipo, ora);
  const progetto = process.env.RAILWAY_PROJECT_ID ? `https://railway.com/project/${process.env.RAILWAY_PROJECT_ID}` : '(locale)';
  const testo = `Progetto: ${SLUG}\nTipo: ${tipo}\nOra: ${oraRoma()}\nRailway: ${progetto}\n\n${dettagli}`;
  console.error(`[ALERT] ${tipo}: ${dettagli}`);
  try {
    return await invia({
      to: process.env.ALERT_EMAIL || 'info@simonescaffidi.it',
      subject: `[ALERT] ${SLUG} – ${tipo}`,
      text: testo,
      html: `<pre style="font-family:monospace">${esc(testo)}</pre>`,
    });
  } catch (e) {
    console.error('[ALERT] invio fallito', e.message);
    return { inviata: false, motivo: e.message };
  }
}

module.exports = { alert, esc };
