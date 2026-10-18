# Traspaso: la versión nueva a la copia de Conor

Conor ya tiene su copia, `ConorAshlee/website`, que publica `conorashlee.com`
con GitHub Pages (*legacy*); no podemos escribir en ella. Todas las páginas
comparten las mismas meta y las direcciones son `project.html?type=…&slug=…`: las páginas llevan las meta, pero el contenido lo pinta el
JS y Google lo ve vacío. Podemos escribir en su repo (no somos admin).

**Su copia y la nuestra eran iguales** el 2026-10-18 . Lo que haya cambiado desde
entonces hay que traerlo antes.

La nueva la publica su Cloudflare con Workers Builds; el DNS de
`conorashlee.com` ya está en Cloudflare. En su copia la Action de publicar no
corre (lleva `if: github.repository_owner == 'meowrhino'`) y el build, al no
estar en GitHub, publica en la raíz con el `url` de `site.json`.

Tiempo: unos 30 minutos, y un rato con él: **cambia cómo edita** (de `data/data.json` +
`images.json` a una carpeta por proyecto con su `project.json`). Hablarlo antes.

## Antes

- [ ] Que nos deje escribir en `ConorAshlee/website`: Settings → Collaborators → `meowrhino`, con **Write**.

- [ ] `main` de meowrhino al día y sin cambios a medias (`git status` limpio).
- [ ] ¿Ha tocado algo Conor en su copia desde el 2026-10-18 (cuando se trajo su contenido; su último commit era del 2026-07-30)?
      `gh api repos/ConorAshlee/website/commits --jq '.[0:3][].commit.message'`. Si sí, pasar
      sus cambios aquí antes de seguir (`data/data.json` → `data/site.json`, `data/about.json` y `projects/<slug>/project.json`).
- [ ] El DNS de `conorashlee.com` está en Cloudflare (`*.ns.cloudflare.com`). Mirar **en
      qué cuenta**: tiene que ser la de Conor.

## 1. La versión nueva, en una rama de su copia

Las dos copias no comparten historia. Se sube a una rama aparte para que su web
siga igual mientras se prepara Cloudflare:

- [ ] `git push https://github.com/ConorAshlee/website.git main:receta`

## 2. Cloudflare (con Conor, en su cuenta)

- [ ] **Workers & Pages → Create → Import a repository** → `ConorAshlee/website`, rama de
      producción **`receta`**. Lo demás lo lee de `wrangler.jsonc` (instala sharp con
      `npm install`, build `node build/build.mjs`, sale `dist/`).
- [ ] Mirar la web en su `*.workers.dev`: la home, un proyecto (`/belladona/`), un álbum (`/archive/1989/`) y `/about/`.
- [ ] **Settings → Domains & Routes → Add → Custom domain**: `conorashlee.com` (y `www`).
      Cloudflare cambia los registros que apuntaban a GitHub Pages.

## 3. `main` pasa a ser la versión nueva

- [ ] Guardar la de antes: `git push https://github.com/ConorAshlee/website.git <sha-de-su-main>:refs/heads/antes`.
- [ ] `git push --force-with-lease=main:<sha-de-su-main> https://github.com/ConorAshlee/website.git main`
      (desde nuestra `main`).
- [ ] En Cloudflare, rama de producción → **`main`**. Borrar la rama `receta`.
- [ ] Conor, en su repo: Settings → Pages → **Unpublish site** (ya no sirve nada).

## 4. Que nos deje entrar en Cloudflare

- [ ] Manage account → Members → nos invita. Ahí se ve el error entero de un build que falla.

## 5. Comprobar en su dominio

- [ ] La home, `/belladona/`, `/archive/1989/`, `/about/` y un enlace viejo (`/project.html?type=project&slug=belladona`).
- [ ] `view-source:` de un proyecto: su title, canonical y og:image propios (antes, los mismos en todas).
- [ ] `view-source:`: `canonical` y `og:url` con `conorashlee.com`, y **sin**
      `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` dice `Allow` y `/sitemap.xml` tiene las direcciones de su dominio.
- [ ] Compartir un proyecto por WhatsApp: sale su foto (la og).

## 6. Search Console, con su cuenta de Google

- [ ] Dar de alta el dominio (el registro TXT, en el DNS de Cloudflare) y enviar `sitemap.xml`.

## 7. Conor en su ordenador

Con él delante, siguiendo [GUIA.md](GUIA.md) ("La primera vegada"):

- [ ] Clona **su** repositorio, no el de meowrhino (si ya lo tenía, **Sincronizar**: la
      estructura cambia entera).
- [ ] Live Server: **Go Live** y ve la vista previa.
- [ ] Un cambio pequeño (una coma en el about), Confirmar → Sincronizar, y la bolita verde.

## 8. Al acabar

- [ ] Fila de conor en `JAMstack/inventario.md` con las dos direcciones (github.io y su dominio).
- [ ] La copia de meowrhino sigue en github.io con `noindex`: no compite en Google.
