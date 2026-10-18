/**
 * familyArchive.js — Family Archive page logic for familyArchive.html
 *
 * Loads data.json and populates album links for the family archive.
 * Each album navigates to project.html?type=album&slug={albumSlug}
 */

let appData = null;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    try {
        appData = await CASA.loadData();   // data/site.json + projects/ (js/carga.js)
    } catch (error) {
        if (document.getElementById('errores-vista-previa')) return;   // la vista previa enseña el error
        console.error('[familyArchive.js] Failed to load data/data.json. Redirecting to home.', error);
        window.location.href = 'index.html';
        return;
    }

    setupNoiseCanvas();
    populateAlbums();
    setupEventListeners();
}

// ---------------------------------------------------------------------------
// Album population
// ---------------------------------------------------------------------------

function getFamilyArchiveConfig() {
    const fallbackBasePath = 'ashlee';

    // New shape: { basePath, albums: [...] }
    if (appData.familyArchive && !Array.isArray(appData.familyArchive)) {
        return {
            basePath: appData.familyArchive.basePath || fallbackBasePath,
            albums: Array.isArray(appData.familyArchive.albums) ? appData.familyArchive.albums : []
        };
    }

    // Legacy shape (kept for compatibility): [{ slug, albums: [...] }]
    if (Array.isArray(appData.familyArchive) && appData.familyArchive.length > 0) {
        const archive = appData.familyArchive[0];
        return {
            basePath: archive.slug || fallbackBasePath,
            albums: Array.isArray(archive.albums) ? archive.albums : []
        };
    }

    return { basePath: fallbackBasePath, albums: [] };
}

function populateAlbums() {
    const albumsContainer = document.getElementById('family-archive-albums');
    const archiveConfig = getFamilyArchiveConfig();

    if (!archiveConfig.albums.length) {
        console.error('[familyArchive.js] No albums found in familyArchive config');
        return;
    }

    archiveConfig.albums.forEach(album => {
        if (!album.imageCount || album.imageCount <= 0) {
            console.warn(`[familyArchive.js] Album "${album.slug}" has no imageCount, skipping`);
            return;
        }

        const img = document.createElement('img');
        img.className = 'interactive fade-on-load';
        img.src = `data/familyArchive/${archiveConfig.basePath}/${album.slug}/title.webp`;
        img.alt = album.title;
        img.addEventListener('click', () => goToAlbum(album.slug));
        albumsContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function goToAlbum(albumSlug) {
    try { sessionStorage.setItem('transicion', '{}'); } catch {} // la siguiente página llega tapada (transición de la casa)
    window.location.href = CASA.pageUrl('album', albumSlug);
}

function setupEventListeners() {
    document.getElementById('about-btn').addEventListener('click', () => {
        try { sessionStorage.setItem('transicion', '{}'); } catch {} // la siguiente página llega tapada (transición de la casa)
        window.location.href = CASA.pageUrl('about');
    });

    document.querySelector('.btn-home').addEventListener('click', () => {
        try { sessionStorage.setItem('transicion', '{}'); } catch {} // la siguiente página llega tapada (transición de la casa)
        window.location.href = 'index.html';
    });
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
