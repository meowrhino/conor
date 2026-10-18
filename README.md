# Conor Portfolio

Conor Ashlee-Purle's site ([conorashlee.com](https://conorashlee.com)), by
[meowrhino.studio](https://meowrhino.studio). It follows the studio's recipe
([meowrhino/JAMstack](https://github.com/meowrhino/JAMstack)) since 2026-10-18.

- **To update it: [GUIA.md](GUIA.md).** (In English, for Conor.)
- Handover: [TRASPASO.md](TRASPASO.md) · if the build fails: [CLAUDE.md](CLAUDE.md).

## How it's made

```
data/site.json         name, domain, "lists" (projects, commissions) and "archive" (the family albums)
data/about.json        contact details and bio images
projects/<slug>/       a project (project.json + img/, title.webp, info.webp, extra/) or a commission (project.json + 1.webp…)
data/familyArchive/    the family archive photos; data/bio/, data/assets/ for the rest
schema/                which fields each JSON takes (VS Code, the build and the preview)
build/build.mjs        → dist/: one clean address per page (/, /<slug>/, /<slug>/extra/, /commissions/,
                       /archive/, /archive/<album>/, /about/) with its own meta; the old ?type=&slug= still work
js/house.js            the studio's shape → the old data.json shape (the rest of the JS doesn't change)
js/carga.js            classic script: CASA.loadData() (validates in the preview) and CASA.pageUrl()
js/validar.js          the JSON Schema check, no dependencies (from JAMstack), messages in English
```

- **Build**: `npm ci && node build/build.mjs`. og:image 1200×630 with **sharp**, sitemap, robots.
- **Preview**: Live Server on the folder. Without `data-built` on `<html>`, `carga.js` checks the JSON
  against `schema/` and shows what's wrong on screen; links go to the old pages (`project.html?type=…`).
- **Publishing, one per copy**: ours, `.github/workflows/deploy.yml` to GitHub Pages (only on
  `meowrhino`; on failure, an issue). Conor's copy, Workers Builds (`wrangler.jsonc`).

## 8) Add an album to Family Archive

1. Keep `archive.basePath` in `data/site.json` (currently `ashlee`).
2. Create folder `data/familyArchive/<basePath>/<albumSlug>/`.
3. Add:
   - `1.webp`, `2.webp`, ...
   - `title.webp`
   - `info.webp`
4. Add album entry in `data/site.json` under `archive.albums`.

Important:

- Public album URLs: `/archive/<albumSlug>/` (the old `project.html?type=album&slug=1989` still works).
- Physical files remain under `data/familyArchive/<basePath>/<albumSlug>/`.

