/* carga.js — lee data/site.json, data/about.json y projects/<slug>/project.json
   y los pasa a la forma del data.json de antes (js/house.js). Script clásico:
   deja window.CASA para el resto de scripts.

   Las páginas que escribe el build llevan data-built en <html>. Sin él es la
   vista previa (Live Server, sin build): cada JSON se revisa con su esquema
   (schema/) como hace el build, lo que esté mal sale en pantalla, y los enlaces
   van a las páginas de siempre (project.html?type=…), porque las direcciones
   limpias (/allEars/, /about/…) solo existen en dist/. */
(function () {
  const BUILT = document.documentElement.hasAttribute('data-built');
  const ROOT = new URL('.', document.baseURI).href;
  const cache = new Map();

  function get(path) {
    if (!cache.has(path)) {
      cache.set(path, fetch(ROOT + path, { cache: BUILT ? 'default' : 'no-store' }).then(async (res) => {
        if (!res.ok) throw new Error(`no encuentro ${path}`);
        const { leerJSON } = await import(ROOT + 'js/validar.js');
        try { return leerJSON(await res.text(), path); } catch (e) { showErrors([e.message]); throw e; }
      }));
    }
    return cache.get(path);
  }

  function showErrors(errors) {
    let box = document.getElementById('errores-vista-previa');
    if (!box) {
      box = document.createElement('pre');
      box.id = 'errores-vista-previa';
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;margin:0;padding:2rem;overflow:auto;white-space:pre-wrap;'
        + 'background:#000;color:#fff;font:15px/1.5 monospace;';
      box.textContent = 'this would not be published:\n\n';
      document.body.append(box);
    }
    box.textContent += errors.map((e) => `✗ ${e}`).join('\n') + '\n\nfix it, save, and the page reloads by itself.\n';
  }

  async function loadData() {
    const { toOld, slugsOf } = await import(ROOT + 'js/house.js');
    const [site, about] = await Promise.all([get('data/site.json'), get('data/about.json')]);
    const slugs = [...slugsOf(site, 'projects'), ...slugsOf(site, 'commissions')];
    const projects = Object.fromEntries(await Promise.all(slugs.map(async (s) => [s, await get(`projects/${s}/project.json`)])));
    if (!BUILT) {
      const { validar } = await import(ROOT + 'js/validar.js');
      const schema = Object.fromEntries(await Promise.all(['site', 'about', 'project'].map(async (t) => [t, await get(`schema/${t}.json`)])));
      const errors = [
        ...validar(site, schema.site, 'data/site.json'),
        ...validar(about, schema.about, 'data/about.json'),
        ...slugs.flatMap((s) => validar(projects[s], schema.project, `projects/${s}/project.json`)),
      ];
      if (errors.length) { showErrors(errors); throw new Error(errors.join('\n')); }
    }
    return toOld(site, about, projects);
  }

  // La dirección de cada página: limpia en la web construida; en la vista previa, la de siempre
  function pageUrl(type, slug = '') {
    const s = encodeURIComponent(slug);
    const url = BUILT
      ? { project: `${s}/`, album: `archive/${s}/`, extra: `${s}/extra/`, about: 'about/', commissions: 'commissions/', archive: 'archive/', home: './' }
      : { project: `project.html?type=project&slug=${s}`, album: `project.html?type=album&slug=${s}`, extra: `extra.html?slug=${s}`,
          about: 'about.html', commissions: 'commission.html', archive: 'familyArchive.html', home: 'index.html' };
    return ROOT + url[type];
  }

  window.CASA = { BUILT, loadData, pageUrl, showErrors };
})();
