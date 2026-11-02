# CLAUDE.md – nuovo-hotel-faro

Regole del progetto (seguire anche le skill `stack-standard` e `sito-web-standard` di Simone):

- Slug unico: `nuovo-hotel-faro` per repo GitHub (pubblico, resta pubblico), progetto Railway e cartella Drive `Claude/nuovo-hotel-faro`.
- Ogni testo visibile va in **entrambi** `locales/it.json` e `locales/en.json`. Italiano principale, inglese su `/en/...`.
- Footer: la riga "Powered by www.simonescaffidi.it" non va mai rimossa.
- GA4 e Search Console solo da env `GA4_ID` / `GSC_VERIFICATION`; GA4 parte solo dopo consenso (`public/assets/consent.js`).
- Niente font o librerie da CDN sulle pagine pubbliche.
- Email solo via API Brevo (`src/mailer.js`), mai SMTP. Alert errori: `src/alert.js` → info@simonescaffidi.it.
- Prezzi/tariffe: non pubblicati (quelli del vecchio sito erano del 2019). Aggiungerli solo con listino aggiornato dall'hotel.
- Foto: in `public/img` (webp 800/1600). Originali in Drive, cartella "Hotel Faro/Foto 2018".
- Fonte dei testi: dump `hotelfaro.sql` (luglio 2021) in Drive "Hotel Faro/Hotelfaro 2021". Non importare dati clienti/prenotazioni presenti nel dump.
