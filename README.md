# Conor Portfolio - Maintenance Guide

This is a static site (HTML + CSS + JS).  
Main content is managed in `data/data.json` and media folders under `data/`.

There is no CMS/admin panel, so updates are done by editing files directly.

## 1) Required software

1. Install **Visual Studio Code** (VS Code):  
   https://code.visualstudio.com/
2. Open VS Code.
3. Install extension **Live Server** by *Ritwick Dey*:
   - Click the Extensions icon (left sidebar)
   - Search for `Live Server`
   - Install it

## 2) Open and prepare the project in VS Code

1. In VS Code, go to `File -> Open Folder...`
2. Select this repository folder (`conor`).
3. Wait until the folder is fully loaded.

Optional but recommended:

1. In VS Code settings, search for `Live Server > Settings: Port`.
2. Set a fixed port if you want stable local URLs (for example `5500`).

## 3) Run locally with Live Server

1. Open `index.html`.
2. Start Live Server with either:
   - Right click inside `index.html` -> `Open with Live Server`, or
   - Click `Go Live` in the bottom-right VS Code status bar.
3. The site opens in your browser, typically at:
   - `http://127.0.0.1:5500/index.html`
   - or `http://localhost:5500/index.html`

## 4) Main editable data

Edit `data/data.json`:

- `contact`: email, phone, instagram
- `about`: bio/CV image configuration
- `projects`: project list, titles, counts, optional password, optional extras
- `commissions`: commission list and image counts
- `familyArchive`: archive albums and image counts

## 5) Add a new project

1. Choose a unique slug (example: `newProject`).
2. Create `data/projects/<slug>/img/`.
3. Add gallery images:
   - Default mode: `1.webp`, `2.webp`, `3.webp`, ...
   - Custom filenames mode: create `data/projects/<slug>/images.json`
4. Add `title.webp` and `info.webp` in `data/projects/<slug>/`.
5. Optional:
   - `hint.webp` (for password hint image)
   - `extra/` folder with `1.webp`, `2.webp`, ... (extra gallery)
6. Add project entry in `data/data.json` under `projects`.

Example:

```json
{
  "slug": "newProject",
  "title": "Visible Project Title",
  "imageCount": 12,
  "extraCount": 0,
  "password": null
}
```

## 6) Edit an existing project

1. Update metadata in `data/data.json`.
2. Update files in `data/projects/<slug>/`.
3. Keep `imageCount` and `extraCount` aligned with real files.

## 7) Add a commission

1. Create `data/commission/<slug>/`.
2. Add images `1.webp`, `2.webp`, `3.webp`, ...
3. Add commission entry in `data/data.json` under `commissions`.

## 8) Add an album to Family Archive

1. Create folder `data/familyArchive/<archiveSlug>/<albumSlug>/`.
2. Add:
   - `1.webp`, `2.webp`, ...
   - `title.webp`
   - `info.webp`
3. Add album entry in `data/data.json` under `familyArchive[].albums`.

Important:

- Current `familyArchive.js` renders only the first item in `familyArchive`.
- If you plan multiple top-level archives, code changes are needed.

## 9) SEO notes

- SEO tags were added with temporary domain `https://example.com`.
- Replace `example.com` with the real domain when available.
- `robots.txt` and `sitemap.xml` also use `https://example.com` for now.

## 10) Pre-publish checklist

1. Run with Live Server and test:
   - Home
   - About
   - Each project
   - Commission page
   - Family Archive
   - Extra pages (if used)
2. Open browser console and confirm no JS errors.
3. Confirm image counts match `data/data.json`.
4. After final domain is ready, replace `example.com` in:
   - HTML SEO tags
   - `robots.txt`
   - `sitemap.xml`
