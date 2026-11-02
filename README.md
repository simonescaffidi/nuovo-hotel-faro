# nuovo-hotel-faro

Sito del **Nuovo Hotel Faro** – Via Libertà 7, Capo d'Orlando (ME). Ricostruzione del vecchio sito WordPress (www.nuovohotelfaro.com, offline), con i testi recuperati dal dump del database del 2021 e le foto dell'archivio dell'hotel.

## Stack
Node 20+, Express 5, EJS server-rendered, CSS custom. Nessun DB. Deploy su Railway (auto-deploy da `main`).

## Pagine
| IT | EN |
|---|---|
| `/` | `/en/` |
| `/hotel` | `/en/hotel` |
| `/camere` | `/en/rooms` |
| `/territorio` | `/en/area` |
| `/dove-siamo` | `/en/getting-here` |
| `/contatti` | `/en/contact` |
| `/privacy` | `/en/privacy` |
| `/cookie` | `/en/cookies` |

I vecchi URL WordPress (`/tariffe-2/`, `/il-faro/`, `/booking/`…) fanno redirect 301 alle nuove pagine.

## Funzioni
- Testi in `locales/it.json` e `locales/en.json`
- Modulo "Richiedi disponibilità" → `POST /api/contatti` → email via Brevo a `CONTACT_EMAIL` (rate limit, honeypot, zod)
- Cookie banner (Accetta / Rifiuta / Personalizza): GA4 e Google Maps solo dopo consenso
- SEO: title/description per pagina, hreflang, canonical, Open Graph, JSON-LD `Hotel`, `sitemap.xml`, `robots.txt`
- `/health` per il healthcheck Railway; alert email su errori 5xx e invio modulo fallito

## Sviluppo
```bash
npm install
cp .env.example .env
npm run dev
npm test
```

Powered by [www.simonescaffidi.it](https://www.simonescaffidi.it)
