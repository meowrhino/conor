# How to update the site

> **Golden rule: only touch `data/` and `projects/`.** Everything else is code.

## What's where

```
data/site.json             the name, the domain, the projects and commissions (in order) and the family archive albums
data/about.json            contact details and the bio images
data/bio/, data/familyArchive/, data/assets/   the bio photos, the family archive photos, buttons and titles
projects/<name>/           a project or a commission, one folder each:
  project.json               its title, its kind and its images
  img/                       a project's images (1.webp, 2.webp…), with title.webp and info.webp next to img/
  extra/                     optional: the extra images
```

The **folder name** is also the address: `projects/belladona/` → `conorashlee.com/belladona/`.
Letters, numbers, `-` and `_`, no spaces. Better not to change it once it's published.

## The first time: setting up VS Code

Only once.

1. In VS Code: **File → New Window** and, on the welcome screen, **Clone Git Repository…** →
   **Clone from GitHub**. Sign in, pick your repository and a folder.
2. When it opens, VS Code suggests installing **Live Server** (bottom right): **Install**.
3. **Go Live** appears at the bottom right: that's the preview.

**VS Code helps you with the fields**: hover over one (`"title"`, `"images"`…) and it tells you
what it is; misspell one or put something wrong and it underlines it in red. To see which fields
you can use, press **Ctrl+Space** inside the braces. It knows because of the first line of each
JSON (`"$schema": …`): **don't delete it**.

## Adding a project, step by step

1. **Copy a folder** in `projects/` and give it the new name: `projects/belladona/` → `projects/newone/`.
   Delete its images.
2. **The images**: run them through [imgToWeb](https://meowrhino.github.io/imgToWeb/), **in Chrome or
   Firefox** (Safari can't make `.webp`). They come out numbered (`1.webp`, `2.webp`…) in the order
   you drag them: put them in `img/`. Add `title.webp` (the title on the menu) and `info.webp`.
3. **The text**: open `project.json` and change the title and how many images there are.
4. **On the site**: in `data/site.json`, add the folder name to the `projects` list (or `commissions`),
   where you want it to appear.
5. **Go Live** to see it, then **Upload the changes**.

A **commission** is the same, with `"kind": "commission"` and its images straight in the folder
(`1.webp`, `2.webp`…), no `img/`.

## Adding a family archive album

1. Make a folder `data/familyArchive/ashlee/<album>/` with its photos (`1.webp`, `2.webp`…, from imgToWeb),
   `title.webp` and `info.webp`.
2. In `data/site.json`, under `archive` → `albums`, add `{ "slug": "<album>", "title": "…", "imageCount": 12 }`
   where you want it (`imageCount`: how many photos, no quotes).

## The fields of a project (`project.json`)

| field | what it does |
|---|---|
| `title` | the title |
| `kind` | `"project"` (main menu) or `"commission"` |
| `images` | how many images, no quotes: `27`. Or, if they have their own names, the list in order: `["a.webp", "b.webp"]` |
| `extras` | *optional*: how many extra images, in `extra/` |
| `password` | *optional*: a password to see the project |

## Seeing it before uploading

**Go Live** at the bottom right of VS Code. The site opens in the browser and refreshes every time
you save. If something wouldn't be published (a comma, a misspelled field), it shows on screen and
says where.

## Uploading the changes

1. **Source Control** tab (the three joined dots, on the left).
2. Write what you did (`new project: newone`) and **Commit**. If it asks whether to add all changes: **Yes**.
3. **Sync Changes**.
4. In a couple of minutes it's on the site. On GitHub, next to the last change there's a dot:
   yellow means it's publishing, green that it's done, red that something's wrong.

**Before you start editing**, press **Sync** too, to get whatever has changed.

## If it shows red

The site doesn't break: it stays as it was until it's fixed. Click the red dot, then **Details**, and
read the last message, which says the file and what's wrong:

- **"is not valid JSON, line 12"** → almost always **a comma**: one missing between two things, or
  an extra one after the last. Or an unclosed quote.
- **"\"titel\" is not a field here (misspelled?). The ones there are: title, kind, images…"** → a
  misspelled field: copy it from the list in the message.
- **"can't find projects/newone/img/12.webp"** → `images` says there are more than there are, or one
  is missing.
- **"\"lists\" says \"newone\", and there's no projects/newone/project.json"** → the name in the list
  and the folder name aren't the same.
