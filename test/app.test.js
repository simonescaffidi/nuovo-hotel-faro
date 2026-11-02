const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

let server; let base;
before(() => new Promise((r) => { server = createApp().listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());

test('health', async () => {
  const r = await fetch(`${base}/health`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
});

for (const p of ['/', '/hotel', '/camere', '/territorio', '/dove-siamo', '/contatti', '/privacy', '/cookie', '/en/', '/en/hotel', '/en/rooms', '/en/area', '/en/getting-here', '/en/contact', '/en/privacy', '/en/cookies']) {
  test(`pagina ${p}`, async () => {
    const r = await fetch(base + p);
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.match(html, /Powered by <a href="https:\/\/www\.simonescaffidi\.it"/);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'un solo h1');
    assert.match(html, /hreflang="en"/);
    assert.match(html, p.startsWith('/en') ? /<html lang="en">/ : /<html lang="it">/);
  });
}

test('404', async () => {
  const r = await fetch(`${base}/non-esiste`);
  assert.equal(r.status, 404);
});

test('redirect vecchio URL', async () => {
  const r = await fetch(`${base}/il-faro/`, { redirect: 'manual' });
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), '/territorio');
});

test('sitemap e robots', async () => {
  assert.match(await (await fetch(`${base}/sitemap.xml`)).text(), /<urlset/);
  assert.match(await (await fetch(`${base}/robots.txt`)).text(), /Sitemap:/);
});

test('contatti: niente modulo, email presente', async () => {
  const html = await (await fetch(`${base}/contatti`)).text();
  assert.doesNotMatch(html, /<form/);
  assert.match(html, /mailto:info@nuovohotelfaro\.com/);
});
