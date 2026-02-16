# SEO TODO - Conor Ashlee-Purle

Objetivo: mejorar descubrimiento organico para busquedas tipo `conor ashlee-purle photographer`, `artist photographer commissions`, `portrait photographer`.

## Prioridad 0 - Base tecnica

- [ ] Definir URL canonica del sitio (ej. `https://tudominio.com`).
- [ ] Anadir `meta description` unica en cada HTML:
  - `index.html`
  - `about.html`
  - `project.html`
  - `commission.html`
  - `familyArchive.html`
  - `extra.html`
- [ ] Anadir `link rel="canonical"` en cada pagina.
- [ ] Anadir etiquetas Open Graph y Twitter Card basicas:
  - `og:title`
  - `og:description`
  - `og:image`
  - `og:url`
  - `twitter:card`
- [ ] Crear `robots.txt` en raiz.
- [ ] Crear `sitemap.xml` en raiz con todas las URLs publicas.
- [ ] Alta en Google Search Console y envio de sitemap.

## Prioridad 1 - Contenido indexable

- [ ] Anadir texto HTML real en About (no solo imagenes), con:
  - un `h1` claro
  - 1-2 parrafos de 90-180 palabras con keywords naturales
  - una frase de contacto/comisiones
- [ ] Revisar titulos (`<title>`) para que incluyan nombre + intencion:
  - ejemplo Home: `Conor Ashlee-Purle | Artist & Photographer`
  - ejemplo About: `About Conor Ashlee-Purle | Artist Photographer`
- [ ] Mejorar `alt` de imagenes clave (evitar solo "Bio", "Info", "Extra").

## Prioridad 2 - Datos estructurados

- [ ] Anadir JSON-LD en `about.html` (schema `Person`).
- [ ] Anadir JSON-LD en Home (schema `WebSite` + `Organization` o `Person`, segun marca personal).

## Prioridad 3 - Performance orientada SEO

- [ ] En galerias grandes, usar `loading="lazy"` y `decoding="async"` en imagenes no visibles al inicio.
- [ ] Medir Core Web Vitals (LCP/CLS/INP) y ajustar solo si hay regresiones.

## Copys sugeridos (base)

### About paragraph (EN, SEO-friendly)

`Conor Ashlee-Purle is a photographer and visual artist based in [City]. His practice explores interpersonal relationships and emotional connection through portraiture and long-form photographic projects. This site presents selected work, commissions, and family archive series. Available for editorial commissions, collaborations, and exhibitions.`

### Meta description (About) ejemplo

`Conor Ashlee-Purle is a photographer and visual artist exploring emotional connection through portrait and long-form projects. View work, commissions and contact details.`

## Nota de implementacion

- Priorizar primero `meta + canonical + sitemap + robots + texto real en About`.
- El resto (schema, OG avanzado, CWV fino) se puede hacer en una segunda pasada.
