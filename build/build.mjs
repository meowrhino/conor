/* ============================================================
   build.mjs — data/ + projects/ + the HTML templates → dist/, the site
   as it gets published.        node build/build.mjs

   One clean address per page, each with its own title, description,
   og:image and canonical (before, they all shared the same ones):
     /                 index.html          /about/           about.html
     /<slug>/          project.html        /<slug>/extra/    extra.html
     /commissions/     commission.html     /archive/         familyArchive.html
     /archive/<album>/ project.html (album)
   The old addresses (project.html?type=…&slug=…) keep working. The text on
   this site lives inside images, so each page also carries, visually hidden,
   its title and links to the rest: what Google and screen readers read.

   If something is wrong (a comma, a misspelled field, a missing image) it
   stops and says what, and nothing is published.
   ============================================================ */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugsOf, toOld } from '../js/house.js';
import { leerJSON, validar } from '../js/validar.js';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'dist');
const at = (...p) => join(ROOT, ...p);
const fail = (msg) => { console.error(`\n✗ ${msg}\n\nNothing has been published: the site stays as it was.\n`); process.exit(1); };

/* ---------- read and check ---------- */

const read = (rel) => {
  if (!existsSync(at(rel))) fail(`can't find ${rel}`);
  try { return leerJSON(readFileSync(at(rel), 'utf8'), rel); } catch (e) { fail(e.message); }
};
const schema = (t) => JSON.parse(readFileSync(at('schema', `${t}.json`), 'utf8'));
const site = read('data/site.json');
const about = read('data/about.json');
const errors = [...validar(site, schema('site'), 'data/site.json'), ...validar(about, schema('about'), 'data/about.json')];
const slugs = errors.length ? [] : [...slugsOf(site, 'projects'), ...slugsOf(site, 'commissions')];
const projects = {};
for (const slug of slugs) {
  const rel = `projects/${slug}/project.json`;
  if (projects[slug]) { errors.push(`data/site.json: "${slug}" is twice in "lists"`); continue; }
  if (!existsSync(at(rel))) { errors.push(`data/site.json: "lists" says "${slug}", and there's no ${rel}`); continue; }
  const p = projects[slug] = read(rel);
  const before = errors.length;
  errors.push(...validar(p, schema('project'), rel));
  if (errors.length > before) continue;
  const dir = p.kind === 'project' ? `projects/${slug}/img` : `projects/${slug}`;
  const files = Array.isArray(p.images) ? p.images : Array.from({ length: p.images }, (_, i) => `${i + 1}.webp`);
  for (const f of files) if (!existsSync(at(dir, f))) errors.push(`${rel}: can't find ${dir}/${f}`);
  for (let i = 1; i <= (p.extras || 0); i++) if (!existsSync(at('projects', slug, 'extra', `${i}.webp`))) errors.push(`${rel}: can't find projects/${slug}/extra/${i}.webp`);
}
for (const a of errors.length ? [] : site.archive.albums) {
  const dir = `data/familyArchive/${site.archive.basePath}/${a.slug}`;
  for (let i = 1; i <= a.imageCount; i++) if (!existsSync(at(dir, `${i}.webp`))) { errors.push(`data/site.json: album "${a.slug}": can't find ${dir}/${i}.webp`); break; }
}
if (errors.length) fail(errors.join('\n✗ '));
const data = toOld(site, about, projects);

/* Where it's published, depending on where it's built (JAMstack, patrones §5):
   in the GitHub Action (our copy), meowrhino.github.io/<repo>/ and not
   indexed; anywhere else (Cloudflare, in Conor's copy), the root with the
   domain from site.json → "url", indexed if there's one. */
const github = process.env.GITHUB_ACTIONS === 'true';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/');
const BASE = github ? `/${repo}` : '';
const SITE = github ? `https://${owner}.github.io${BASE}` : String(site.url || '').replace(/\/+$/, '');
const INDEX = !github && !!site.url;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

/* ---------- the share image, with sharp ---------- */

let sharp = null;
try { sharp = (await import('sharp')).default; } catch (e) {
  console.warn(`⚠ no sharp (${e.code || e.message}): links are shared with the logo. Fix: npm ci`);
}
const firstImage = (slug) => {
  const p = projects[slug];
  const f = Array.isArray(p.images) ? p.images[0] : '1.webp';
  return p.kind === 'project' ? `projects/${slug}/img/${f}` : `projects/${slug}/${f}`;
};
const ogs = new Map();
const sources = [...slugs.map((s) => [s, firstImage(s)]), ...site.archive.albums.map((a) => [`archive-${a.slug}`, `data/familyArchive/${site.archive.basePath}/${a.slug}/1.webp`])];
for (const [key, src] of sources) {
  if (!sharp) break;
  const cached = at('.cache', 'og', `${key}.jpg`);
  try {
    if (!(existsSync(cached) && statSync(cached).mtimeMs >= statSync(at(src)).mtimeMs)) {
      mkdirSync(dirname(cached), { recursive: true });
      await sharp(at(src)).resize(1104, 534, { fit: 'contain', background: '#000000' })
        .extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#000000' })
        .flatten({ background: '#000000' }).jpeg({ quality: 85, mozjpeg: true }).toFile(cached);
    }
    ogs.set(key, cached);
  } catch (e) {
    console.warn(`⚠ ${src}: sharp can't read it (${e.message})`);
  }
}
const ogUrl = (key) => (ogs.has(key) ? `${SITE}/og/${key}.jpg` : `${SITE}/data/navicon/navicon.png`);

/* ---------- the pages ---------- */

function swap(html, find, replace, file) {
  if (!find.test(html)) fail(`can't find ${find} in ${file}: the build needs it to write the pages.`);
  return html.replace(find, replace);
}
const meta = (html, prop, value, file) => swap(html, new RegExp(`(<meta property="${prop}" content=")[^"]*(")`), `$1${esc(value)}$2`, file);

// what Google and screen readers read: the title and the links (the site's text is in its images)
const sr = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
const nav = () => [
  ...data.projects.map((p) => `<a href="${BASE}/${encodeURIComponent(p.slug)}/">${esc(p.title)}</a>`),
  `<a href="${BASE}/commissions/">commissions</a>`, `<a href="${BASE}/archive/">family archive</a>`, `<a href="${BASE}/about/">about</a>`,
].join(' ');

function page(file, { path, title, image, depth, type, slug, robots }) {
  const url = `${SITE}/${path}`;
  const fullTitle = title ? `${title} — ${site.title}` : site.title;
  let html = readFileSync(at(file), 'utf8');
  html = swap(html, /<html lang="en">/, '<html lang="en" data-built>', file);
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`, file);
  html = swap(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(url)}">`, file);
  html = meta(html, 'og:title', fullTitle, file);
  html = meta(html, 'og:url', url, file);
  html = meta(html, 'og:image', image, file);
  html = swap(html, /(<meta charset="[^"]*">)/i, `$1${depth ? `\n    <base href="${'../'.repeat(depth)}">` : ''}`
    + `\n    <meta name="robots" content="${robots || (INDEX ? 'index,follow' : 'noindex')}">`
    + (type ? `\n    <script>window.__TYPE__ = ${JSON.stringify(type)}; window.__SLUG__ = ${JSON.stringify(slug)};</script>` : ''), file);
  return swap(html, /(<body[^>]*>)/, `$1\n    <div style="${sr}"><h1>${esc(fullTitle)}</h1><nav>${nav()}</nav></div>`, file);
}

/* ---------- write dist/ ---------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const f of ['style.css', 'js', 'data', 'projects', 'gate.js', 'noise.js', 'loader.js', 'home.js', 'about.js', 'commission.js', 'familyArchive.js', 'extra.js', 'project.js'])
  cpSync(at(f), join(OUT, f), { recursive: true, filter: (x) => !x.endsWith('.DS_Store') });
// the old addresses keep working (project.html?type=…), already built
for (const f of ['project.html', 'about.html', 'commission.html', 'familyArchive.html', 'extra.html'])
  writeFileSync(join(OUT, f), readFileSync(at(f), 'utf8').replace('<html lang="en">', '<html lang="en" data-built>'));
mkdirSync(join(OUT, 'og'), { recursive: true });
for (const [key, cached] of ogs) cpSync(cached, join(OUT, 'og', `${key}.jpg`));
const write = (path, html) => { mkdirSync(join(OUT, path), { recursive: true }); writeFileSync(join(OUT, path, 'index.html'), html); };

const first = data.projects[0]?.slug;
writeFileSync(join(OUT, 'index.html'), page('index.html', { path: '', image: ogUrl(first), depth: 0 }));
write('about', page('about.html', { path: 'about/', title: 'about', image: ogUrl(first), depth: 1 }));
write('commissions', page('commission.html', { path: 'commissions/', title: 'commissions', image: ogUrl(slugsOf(site, 'commissions')[0]), depth: 1 }));
write('archive', page('familyArchive.html', { path: 'archive/', title: 'family archive', image: ogUrl(`archive-${site.archive.albums[0]?.slug}`), depth: 1 }));
for (const p of data.projects) {
  write(p.slug, page('project.html', { path: `${encodeURIComponent(p.slug)}/`, title: p.title, image: ogUrl(p.slug), depth: 1, type: 'project', slug: p.slug }));
  if (p.extraCount) write(`${p.slug}/extra`, page('extra.html', { path: `${encodeURIComponent(p.slug)}/extra/`, title: `${p.title} (extra)`, image: ogUrl(p.slug), depth: 2, type: 'extra', slug: p.slug }));
}
for (const a of site.archive.albums) {
  write(`archive/${a.slug}`, page('project.html', { path: `archive/${encodeURIComponent(a.slug)}/`, title: a.title, image: ogUrl(`archive-${a.slug}`), depth: 2, type: 'album', slug: a.slug }));
}
writeFileSync(join(OUT, '404.html'), page('index.html', { path: '', image: ogUrl(first), depth: 0, robots: 'noindex' })
  .replace(/<head>/, `<head>\n    <base href="${BASE}/">`));
const urls = ['', 'about/', 'commissions/', 'archive/', ...data.projects.map((p) => `${encodeURIComponent(p.slug)}/`),
  ...site.archive.albums.map((a) => `archive/${encodeURIComponent(a.slug)}/`)].map((p) => `${SITE}/${p}`);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), INDEX ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`✓ dist/: ${urls.length} pages · ${data.projects.length} projects, ${data.commissions.length} commissions, ${site.archive.albums.length} albums${INDEX ? ` · indexed (${SITE})` : ' · not indexed'}`);
