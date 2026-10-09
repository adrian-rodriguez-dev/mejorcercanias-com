# Dominio secundario de MejorCercanías

El dominio principal es https://www.mejorcercanias.es. Este repositorio publica
las redirecciones de mejorcercanias.com y www.mejorcercanias.com en GitHub Pages,
conservando HTTPS y sin duplicar la aplicación.

Se generan páginas físicas para todas las rutas de núcleo, línea y estación del
sitemap público de la web principal. Cada página contiene un canonical hacia
la misma ruta del .es y un meta refresh inmediato. Con JavaScript, la redirección
conserva también todos los parámetros y el fragmento. Las rutas desconocidas
usan el 404 de Pages: conservan el enlace con JS y siguen devolviendo HTTP 404.

GitHub Pages sirve estas páginas con HTTP 200: **no son redirecciones HTTP 301**.
Google considera permanente el meta refresh de cero segundos. Una redirección
301 real requiere un servidor/proxy que la permita; la cuenta actual de IONOS
no tiene un certificado SSL adicional libre para el .com. No se cambia su DNS
ni se contrata ningún producto para esta solución.

## Generación y publicación

Requiere Node 24; no necesita dependencias externas.

```sh
npm run sync
npm test
npm run build
```

`data/routes.json` es una copia del sitemap real, para poder probar y generar
sin acceso a la red. El workflow la actualiza desde el sitemap en cada publicación.
Si la web principal añade nuevas rutas, ejecutar **Publish domain redirects**
desde Actions para incorporarlas al .com. La fuente de Pages debe ser
**GitHub Actions**, el dominio personalizado **mejorcercanias.com** y
**Enforce HTTPS** debe permanecer activado. Los DNS A del dominio y el CNAME de
www apuntan a GitHub Pages.

Referencias: [redirecciones y Google](https://developers.google.com/search/docs/crawling-indexing/301-redirects),
[redirecciones de dominio en IONOS](https://www.ionos.es/ayuda/dominios/configurar-una-redireccion-de-dominios/redireccionar-un-dominio-a-otro-dominio/).
