import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { redirectHtml, fallbackHtml, validateRoutes, sitemapUrl } from './redirects.mjs';

const routes = validateRoutes(JSON.parse(await readFile(new URL('../data/routes.json', import.meta.url), 'utf8')));
const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
for (const route of routes) {
  const directory = new URL(`.${route}`, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), redirectHtml(route));
}
await writeFile(new URL('404.html', output), fallbackHtml());
await writeFile(new URL('.nojekyll', output), '');
await writeFile(new URL('CNAME', output), await readFile(new URL('../CNAME', import.meta.url)));
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`);
console.log(`Generadas ${routes.length} redirecciones HTML y fallback 404.`);
