/**
 * familyArchive.js — Family Archive page logic for familyArchive.html
 *
 * Loads data.json and populates album links for the family archive.
 * Each album navigates to project.html?type=album&slug={archiveSlug}/{albumSlug}
 */

let appData = null;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    const response = await fetch('data/data.json');
    appData = await response.json();

    setupNoiseCanvas();
    populateAlbums();
    setupEventListeners();
}

// ---------------------------------------------------------------------------
// Album population
// ---------------------------------------------------------------------------

function populateAlbums() {
    const albumsContainer = document.getElementById('family-archive-albums');

    if (!appData.familyArchive || appData.familyArchive.length === 0) {
        console.error('[familyArchive.js] No familyArchive found in data.json');
        return;
    }

    const archive = appData.familyArchive[0];

    if (!archive.albums || archive.albums.length === 0) {
        console.error(`[familyArchive.js] No albums found in archive: ${archive.slug}`);
        return;
    }

    archive.albums.forEach(album => {
        if (!album.imageCount || album.imageCount <= 0) {
            console.warn(`[familyArchive.js] Album "${album.slug}" has no imageCount, skipping`);
            return;
        }

        const img = document.createElement('img');
        img.className = 'interactive';
        img.src = `data/familyArchive/${archive.slug}/${album.slug}/title.webp`;
        img.alt = album.title;
        img.addEventListener('click', () => goToAlbum(archive.slug, album.slug));
        albumsContainer.appendChild(img);
    });
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function goToAlbum(archiveSlug, albumSlug) {
    window.location.href = `project.html?type=album&slug=${archiveSlug}/${albumSlug}`;
}

function setupEventListeners() {
    document.getElementById('about-btn').addEventListener('click', () => {
        window.location.href = 'about.html';
    });

    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
