import { mkdir, writeFile } from 'node:fs/promises';
import { routesFromSitemap, sitemapUrl } from './redirects.mjs';

const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Sitemap: HTTP ${response.status}`);
const routes = routesFromSitemap(await response.text());
const directory = new URL('../data/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('routes.json', directory), `${JSON.stringify(routes, null, 2)}\n`);
console.log(`Sincronizadas ${routes.length} rutas del sitemap canónico.`);
