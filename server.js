const { createApp } = require('./src/app');
const { alert } = require('./src/alert');

process.on('unhandledRejection', (e) => alert('unhandledRejection', e?.stack || String(e)));
process.on('uncaughtException', (e) => { alert('uncaughtException', e?.stack || String(e)).finally(() => process.exit(1)); });

const port = process.env.PORT || 3000;
createApp().listen(port, () => console.log(`nuovo-hotel-faro in ascolto su :${port}`));
