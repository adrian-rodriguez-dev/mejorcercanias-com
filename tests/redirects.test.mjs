import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import { destination, redirectHtml, redirectScript, fallbackHtml, routesFromSitemap, validateRoutes } from '../scripts/redirects.mjs';

test('conserva rutas, parámetros repetidos, codificación y fragmentos', () => {
  for (const path of [
    '/', '/bilbao/', '/bilbao/linea/c2/?origen=13206',
    '/bilbao/estacion/barakaldo/?destino=13200',
    '/madrid/?linea=C1&linea=C2&texto=San%20Jos%C3%A9#horarios',
    '/ruta-desconocida/?origen=13206#detalle',
    '//example.com/?destino=https%3A%2F%2Fexample.com',
  ]) {
    const url = new URL(`https://mejorcercanias.com${path}`);
    let result;
    vm.runInNewContext(redirectScript, { location: {
      pathname: url.pathname, search: url.search, hash: url.hash,
      replace: (value) => { result = value; },
    } });
    assert.equal(result, destination + url.pathname + url.search + url.hash);
    assert.equal(new URL(result).origin, destination);
  }
});

test('cada ruta real tiene destino estático y canonical propios sin depender de JS', async () => {
  const routes = validateRoutes(JSON.parse(await readFile(new URL('../data/routes.json', import.meta.url), 'utf8')));
  assert.ok(routes.includes('/bilbao/linea/c2/'));
  assert.ok(routes.includes('/bilbao/estacion/barakaldo/'));
  for (const route of routes) {
    const html = redirectHtml(route);
    assert.ok(html.includes(`<link rel="canonical" href="${destination + route}">`));
    assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=${destination + route}">`));
    assert.ok(!html.includes('noindex'));
    assert.ok(html.indexOf('<script>') < html.indexOf('http-equiv="refresh"'));
  }
});

test('rechaza URLs externas, consultas y rutas fuera de núcleo/línea/estación', () => {
  const xml = (value) => `<urlset><url><loc>${value}</loc></url></urlset>`;
  assert.deepEqual(routesFromSitemap(xml(`${destination}/`)), ['/']);
  for (const value of ['https://example.com/', `${destination}/?origen=1`, `${destination}/#horarios`, `${destination}/bilbao/ruta/a-b/`]) {
    assert.throws(() => routesFromSitemap(xml(value)));
  }
  assert.throws(() => validateRoutes(['/', '/']));
  assert.throws(() => validateRoutes(['/', '/../fuera/']));
});

test('el fallback no indexa rutas desconocidas ni las convierte en la portada sin JS', () => {
  const html = fallbackHtml();
  assert.ok(html.includes('content="noindex"'));
  assert.ok(html.includes(redirectScript));
  assert.ok(!html.includes('http-equiv="refresh"'));
});
