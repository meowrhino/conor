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
    const archive = appData.familyArchive[0];
    
    archive.albums.forEach(album => {
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
