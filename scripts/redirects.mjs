export const destination = 'https://www.mejorcercanias.es';
export const sitemapUrl = `${destination}/sitemap.xml`;

const slug = '[a-z0-9]+(?:-[a-z0-9]+)*';
const routePattern = new RegExp(`^/(?:${slug}/(?:(?:linea|estacion)/${slug}/)?)?$`);

export function validateRoutes(routes) {
  if (!Array.isArray(routes) || !routes.includes('/')) {
    throw new Error('El listado debe incluir la página de inicio.');
  }
  for (const route of routes) {
    if (typeof route !== 'string' || !routePattern.test(route)) {
      throw new Error(`Ruta SEO inválida: ${String(route)}`);
    }
  }
  if (new Set(routes).size !== routes.length) throw new Error('Rutas duplicadas.');
  return routes;
}

export function routesFromSitemap(xml) {
  const urls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((match) => match[1].trim());
  if (!urls.length) throw new Error('El sitemap no contiene URLs.');
  return validateRoutes(urls.map((value) => {
    const url = new URL(value);
    if (url.origin !== destination || url.search || url.hash) {
      throw new Error(`URL ajena al sitemap canónico: ${value}`);
    }
    return url.pathname;
  }));
}

// El host de destino es fijo; conserva la ruta, parámetros repetidos y fragmento.
export const redirectScript = `location.replace(${JSON.stringify(destination)} + location.pathname + location.search + location.hash);`;

export function redirectHtml(route = '/') {
  validateRoutes(route === '/' ? ['/'] : ['/', route]);
  const target = destination + route;
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MejorCercanías · Nueva dirección</title>
  <link rel="canonical" href="${target}">
  <script>${redirectScript}</script>
  <meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
  <p>MejorCercanías está en <a href="${target}">${target}</a>.</p>
</body>
</html>
`;
}

// Las rutas desconocidas mantienen HTTP 404, pero los navegadores con JS
// pueden continuar en la misma ruta del dominio principal.
export function fallbackHtml() {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>MejorCercanías · Nueva dirección</title>
  <script>${redirectScript}</script>
</head>
<body>
  <p>Continúa en <a href="${destination}/">MejorCercanías</a>.</p>
</body>
</html>
`;
}
