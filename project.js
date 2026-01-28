/**
 * project.js — Gallery page logic for project.html
 *
 * Handles three content types via URL params (?type=...&slug=...):
 *   - project:    images from data/projects/{slug}/img/{n}.webp
 *   - commission: images from data/commission/{slug}/{n}.webp
 *   - album:      images from data/familyArchive/{archive}/{album}/{n}.webp
 *
 * Flow: load data.json → resolve project → preload all images with progress bar
 *       → render masonry gallery → lightbox on click
 *
 * Image paths follow sequential numbering (1.webp, 2.webp, ...),
 * except projects that have an images.json manifest (custom filenames).
 */

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

let appData = null;
let currentProject = null;
let currentType = null;
let currentSlug = null;
let images = [];
let currentImageIndex = 0;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    const response = await fetch('data/data.json');
    appData = await response.json();

    const params = new URLSearchParams(window.location.search);
    currentType = params.get('type');
    currentSlug = params.get('slug');

    if (!currentType || !currentSlug) {
        window.location.href = 'index.html';
        return;
    }

    setupNoiseCanvas();
    await loadProject();
    setupEventListeners();
}

// ---------------------------------------------------------------------------
// Project loading
// ---------------------------------------------------------------------------

/**
 * Try to load an images.json manifest for projects with custom filenames.
 * Returns an array of filenames or null if not found.
 */
async function loadImageManifest(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return null;
        const data = await response.json();
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.images)) return data.images;
        return null;
    } catch {
        return null;
    }
}

/**
 * Resolve project metadata from data.json based on URL type/slug,
 * then preload images and render the gallery.
 */
async function loadProject() {
    if (currentType === 'project') {
        currentProject = appData.projects.find(p => p.slug === currentSlug);
    } else if (currentType === 'commission') {
        currentProject = appData.commissions.find(c => c.slug === currentSlug);
    } else if (currentType === 'album') {
        // Album slugs are "archiveSlug/albumSlug"
        const [archiveSlug, albumSlug] = currentSlug.split('/');
        const archive = appData.familyArchive.find(a => a.slug === archiveSlug);
        if (!archive) { window.location.href = 'index.html'; return; }
        const album = archive.albums.find(a => a.slug === albumSlug);
        if (!album) { window.location.href = 'index.html'; return; }

        currentProject = {
            title: album.title,
            description: `Family archive: ${album.title}`,
            imageCount: album.imageCount,
            slug: albumSlug,
            archiveSlug: archiveSlug
        };
    }

    if (!currentProject) {
        window.location.href = 'index.html';
        return;
    }

    document.title = currentProject.title;

    await prepareImages();
    await preloadImages();

    // Hide preloader, show gallery
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');

    renderMasonryGallery();
    setupInfoImage();
    setupExtraButton();
}

// ---------------------------------------------------------------------------
// Image preparation — build the images[] array
// ---------------------------------------------------------------------------

async function prepareImages() {
    images = [];

    if (currentType === 'album') {
        const basePath = `data/familyArchive/${currentProject.archiveSlug}/${currentProject.slug}/`;
        for (let i = 1; i <= currentProject.imageCount; i++) {
            images.push(`${basePath}${i}.webp`);
        }
    } else {
        const basePath = currentType === 'project'
            ? `data/projects/${currentSlug}/img/`
            : `data/commission/${currentSlug}/`;

        // Projects may have images.json with custom filenames
        if (currentType === 'project') {
            const manifest = await loadImageManifest(`data/projects/${currentSlug}/images.json`);
            if (manifest && manifest.length) {
                manifest.forEach(file => images.push(basePath + file));
                return;
            }
        }

        // Default: sequential numbering
        for (let i = 1; i <= currentProject.imageCount; i++) {
            images.push(`${basePath}${i}.webp`);
        }
    }
}

// ---------------------------------------------------------------------------
// Preloader — loads all images before showing gallery
// ---------------------------------------------------------------------------

async function preloadImages() {
    const loaderBar = document.getElementById('loader-bar');
    let loaded = 0;

    const promises = images.map(src => {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loaded++;
                loaderBar.style.width = (loaded / images.length * 100) + '%';
                resolve();
            };
            img.src = src;
        });
    });

    await Promise.all(promises);
}

// ---------------------------------------------------------------------------
// Masonry gallery — responsive column layout
// ---------------------------------------------------------------------------

/**
 * Determine column count based on viewport width.
 * More columns = smaller images. Recalculated on resize.
 */
function getColumnCount() {
    const w = window.innerWidth;
    if (w < 600) return 3;
    if (w < 900) return 5;
    if (w < 1200) return 7;
    if (w < 1800) return 9;
    return 11;
}

/**
 * Render masonry gallery by distributing images across columns
 * in round-robin order. Each column is a flex column container.
 */
function renderMasonryGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    const columnCount = getColumnCount();
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'masonry-column';
        columns.push(column);
        grid.appendChild(column);
    }

    images.forEach((src, index) => {
        const container = document.createElement('div');
        container.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = src;
        img.alt = `${currentProject.title} - ${index + 1}`;
        img.addEventListener('click', () => openLightbox(index));

        container.appendChild(img);
        columns[index % columnCount].appendChild(container);
    });
}

// ---------------------------------------------------------------------------
// Lightbox — full-screen image viewer with keyboard navigation
// ---------------------------------------------------------------------------

function openLightbox(index) {
    currentImageIndex = index;
    document.getElementById('lightbox-image').src = images[currentImageIndex];
    document.getElementById('lightbox').classList.remove('hidden');
    updateLightboxButtons();
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
}

/** Navigate with wrapping via modulo arithmetic */
function navigateLightbox(direction) {
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    document.getElementById('lightbox-image').src = images[currentImageIndex];
    updateLightboxButtons();
}

/** Dim prev/next arrows at first/last image as visual hint */
function updateLightboxButtons() {
    document.querySelector('.btn-prev').style.opacity = currentImageIndex === 0 ? '0.3' : '';
    document.querySelector('.btn-next').style.opacity = currentImageIndex === images.length - 1 ? '0.3' : '';
}

// ---------------------------------------------------------------------------
// Info image + Extra button
// ---------------------------------------------------------------------------

function hasExtra() {
    if (currentType !== 'project') return false;
    return currentProject?.extra === true || currentProject?.extra === 'true';
}

function setupInfoImage() {
    const infoPanel = document.getElementById('project-info');
    const infoImg = document.getElementById('project-info-image');

    if (!infoPanel || !infoImg) return;

    if (currentType !== 'project') {
        infoPanel.classList.add('hidden');
        return;
    }

    infoImg.src = `data/projects/${currentSlug}/info.webp`;
    infoPanel.classList.remove('hidden');
}

function setupExtraButton() {
    const extraBtn = document.querySelector('.btn-extra');
    if (!extraBtn) return;
    if (!hasExtra()) {
        extraBtn.classList.add('hidden');
    }
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Extra button behavior to be implemented separately

    // Lightbox controls
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.btn-prev').addEventListener('click', () => navigateLightbox(-1));
    document.querySelector('.btn-next').addEventListener('click', () => navigateLightbox(1));

    // Keyboard navigation (only when lightbox is open)
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('lightbox').classList.contains('hidden')) return;
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === 'Escape') closeLightbox();
    });

    // Click outside image to close lightbox
    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });

    // Re-render masonry when column count changes (debounced)
    let resizeTimer;
    let lastColumnCount = getColumnCount();
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newCount = getColumnCount();
            if (newCount !== lastColumnCount) {
                lastColumnCount = newCount;
                renderMasonryGallery();
            }
        }, 200);
    });
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
