// El contenido a la manera del estudio (JAMstack) → el de antes
//
// El contenido vive así: data/site.json ("lists": los proyectos y los encargos,
// en orden; "archive": el archivo familiar), data/about.json (contacto y bio) y
// cada proyecto o encargo en projects/<slug>/project.json con sus imágenes al
// lado. "images" es cuántas hay (1.webp … N.webp) o la lista de sus nombres.
//
// El resto del JS sigue trabajando con la forma del data.json de antes; toOld()
// pasa de una a otra. La usan el navegador (carga.js) y el build: sin DOM ni disco.

export const slugsOf = (site, list) => site.lists?.[list]?.projects || [];

const count = (p) => (Array.isArray(p.images) ? p.images.length : p.images);

export function toOld(site, about, projects) {
  return {
    contact: about.contact,
    about: about.bio,
    projects: slugsOf(site, 'projects').map((slug) => {
      const p = projects[slug];
      return {
        slug,
        title: p.title,
        imageCount: count(p),
        ...(p.extras ? { extraCount: p.extras } : {}),
        password: p.password ?? null,
        ...(Array.isArray(p.images) ? { images: p.images } : {}),
      };
    }),
    commissions: slugsOf(site, 'commissions').map((slug) => ({ slug, title: projects[slug].title, imageCount: count(projects[slug]) })),
    familyArchive: site.archive,
  };
}
