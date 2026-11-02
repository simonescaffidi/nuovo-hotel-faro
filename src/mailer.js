// Invio email via API Brevo (standard: mai SMTP)
async function invia({ to, subject, html, text, replyTo, attachments }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) { console.error('[MAIL] BREVO_API_KEY mancante'); return { inviata: false, motivo: 'BREVO_API_KEY mancante' }; }
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: process.env.MAIL_FROM_EMAIL, name: process.env.MAIL_FROM_NAME || 'Nuovo Hotel Faro' },
      to: [].concat(to).map((email) => ({ email })),
      subject, htmlContent: html, textContent: text,
      replyTo: replyTo ? { email: replyTo } : undefined,
      attachment: attachments?.map((a) => ({ name: a.name, content: a.base64 })),
    }),
  });
  if (!r.ok) return { inviata: false, motivo: `Brevo ${r.status}: ${await r.text()}` };
  return { inviata: true };
}
module.exports = { invia };
