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
    window.location.href = `project.html?type=album&slug=${encodeURIComponent(albumSlug)}`;
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
