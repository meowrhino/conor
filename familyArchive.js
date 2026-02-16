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
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        appData = await response.json();
    } catch (error) {
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
        img.className = 'interactive fade-on-load';
        img.src = `data/familyArchive/${archive.slug}/${album.slug}/title.webp`;
        img.alt = album.title;
        img.addEventListener('click', () => goToAlbum(archive.slug, album.slug));
        albumsContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
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
