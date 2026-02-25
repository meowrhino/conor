/**
 * project.js — Gallery page logic for project.html
 *
 * Handles three content types via URL params (?type=...&slug=...):
 *   - project:    images from data/projects/{slug}/img/{n}.webp
 *   - commission: images from data/commission/{slug}/{n}.webp
 *   - album:      images from data/familyArchive/{basePath}/{album}/{n}.webp
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
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        appData = await response.json();
    } catch (error) {
        console.error('[project.js] Failed to load data/data.json. Redirecting to home.', error);
        window.location.href = 'index.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    currentType = params.get('type');
    currentSlug = params.get('slug');

    if (!currentType || !currentSlug) {
        console.error('[project.js] Missing URL params: type or slug');
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

/**
 * Resolve project metadata from data.json based on URL type/slug,
 * then preload images and render the gallery.
 */
async function loadProject() {
    if (currentType === 'project') {
        currentProject = appData.projects.find(p => p.slug === currentSlug);
        if (!currentProject) {
            console.error(`[project.js] Project not found: ${currentSlug}`);
        }
    } else if (currentType === 'commission') {
        currentProject = appData.commissions.find(c => c.slug === currentSlug);
        if (!currentProject) {
            console.error(`[project.js] Commission not found: ${currentSlug}`);
        }
    } else if (currentType === 'album') {
        const archiveConfig = getFamilyArchiveConfig();
        let archiveBasePath = archiveConfig.basePath;
        let albumSlug = currentSlug;

        // Backward compatibility: old URLs can still be "archiveSlug/albumSlug".
        const [legacyArchiveSlug, legacyAlbumSlug] = currentSlug.split('/');
        if (legacyAlbumSlug) {
            archiveBasePath = legacyArchiveSlug || archiveBasePath;
            albumSlug = legacyAlbumSlug;
        }

        const album = archiveConfig.albums.find(a => a.slug === albumSlug);
        if (!album) {
            console.error(`[project.js] Album not found: ${albumSlug}`);
            window.location.href = 'index.html';
            return;
        }

        currentProject = {
            title: album.title,
            description: `Family archive: ${album.title}`,
            imageCount: album.imageCount,
            slug: albumSlug,
            archiveBasePath: archiveBasePath
        };
    } else {
        console.error(`[project.js] Unknown type: ${currentType}`);
    }

    if (!currentProject) {
        window.location.href = 'index.html';
        return;
    }

    if (!currentProject.imageCount || currentProject.imageCount <= 0) {
        console.error(`[project.js] No imageCount defined for ${currentType}: ${currentSlug}`);
        window.location.href = 'index.html';
        return;
    }

    document.title = 'Conor Ashlee-Purle';

    await prepareImages();

    // Show gallery immediately (no blocking preloader)
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');

    // Render gallery with progressive loading (images fade in as they load)
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
        const basePath = `data/familyArchive/${currentProject.archiveBasePath}/${currentProject.slug}/`;
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
// Progressive loading — images fade in as they load (no blocking preloader)
// ---------------------------------------------------------------------------

// Note: preloadImages() removed — progressive loading happens in renderMasonryGallery()

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
 * Images start hidden and fade in progressively as they load.
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
        container.className = 'gallery-item gallery-item--loading';

        const img = document.createElement('img');
        img.alt = `${currentProject.title} - ${index + 1}`;
        img.addEventListener('click', () => openLightbox(index));

        // Fade in when image loads
        img.onload = () => {
            container.classList.remove('gallery-item--loading');
            container.classList.add('gallery-item--loaded');
        };

        // Also handle error (show anyway to avoid blank spots)
        img.onerror = () => {
            container.classList.remove('gallery-item--loading');
            container.classList.add('gallery-item--loaded');
        };

        // Set src after attaching event listeners
        img.src = src;

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
    const lightbox = document.getElementById('lightbox');
    const lightboxNav = document.querySelector('.lightbox-nav');
    
    lightbox.classList.add('hidden');
    
    // Restore navigation arrows visibility
    if (lightboxNav) lightboxNav.style.display = '';
    
    // Clear info viewing flag
    delete lightbox.dataset.viewingInfo;
}

/** Navigate without wrapping (stop at first/last image) */
function navigateLightbox(direction) {
    const lightbox = document.getElementById('lightbox');
    
    // Don't navigate if viewing info image
    if (lightbox.dataset.viewingInfo === 'true') return;

    const nextIndex = currentImageIndex + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;

    currentImageIndex = nextIndex;
    document.getElementById('lightbox-image').src = images[currentImageIndex];
    updateLightboxButtons();
}

/** Hide prev/next arrows at first/last image */
function updateLightboxButtons() {
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    if (!prevBtn || !nextBtn) return;

    prevBtn.classList.toggle('lightbox-btn--hidden', currentImageIndex === 0);
    nextBtn.classList.toggle('lightbox-btn--hidden', currentImageIndex === images.length - 1);
}

// ---------------------------------------------------------------------------
// Info image + Extra button
// ---------------------------------------------------------------------------

function hasExtra() {
    if (currentType !== 'project') return false;
    return currentProject?.extraCount > 0;
}

function setupInfoImage() {
    const infoImg = document.getElementById('project-info-image');
    if (!infoImg) return;

    // Commissions: keep info hidden (already has class hidden)
    if (currentType !== 'project' && currentType !== 'album') return;

    const infoSrc = currentType === 'project'
        ? `data/projects/${currentSlug}/info.webp`
        : `data/familyArchive/${currentProject.archiveBasePath}/${currentProject.slug}/info.webp`;

    // Keep hidden until image is confirmed to exist.
    infoImg.classList.add('hidden');
    infoImg.classList.remove('interactive');
    infoImg.style.cursor = '';

    infoImg.onload = () => {
        infoImg.classList.remove('hidden');
        setupInfoLightbox(infoImg);
        if (window.setupFadeOnLoad) window.setupFadeOnLoad();
    };

    infoImg.onerror = () => {
        infoImg.classList.add('hidden');
        infoImg.classList.remove('interactive');
        infoImg.style.cursor = '';
        console.warn(`[project.js] Info image not found: ${infoSrc}`);
    };

    infoImg.src = infoSrc;
}

/**
 * Setup lightbox for info image (separate from gallery lightbox)
 */
function setupInfoLightbox(infoImg) {
    infoImg.classList.add('interactive');
    infoImg.style.cursor = 'pointer';
    
    infoImg.addEventListener('click', () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxNav = document.querySelector('.lightbox-nav');
        
        // Hide navigation arrows for info image
        if (lightboxNav) lightboxNav.style.display = 'none';
        
        lightboxImage.src = infoImg.src;
        lightbox.classList.remove('hidden');
        
        // Store flag to know we're viewing info, not gallery
        lightbox.dataset.viewingInfo = 'true';
    });
}

function setupExtraButton() {
    const extraBtn = document.querySelector('.btn-extra');
    if (!extraBtn) return;
    // Show extra button only if project has extra images
    if (hasExtra()) {
        extraBtn.classList.remove('hidden');
        // Trigger fade-in for newly visible element
        if (window.setupFadeOnLoad) window.setupFadeOnLoad();
    }
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function setupEventListeners() {
    const navBtn = document.querySelector('.btn-nav');

    // For albums, change to back button that goes to family archive
    if (currentType === 'album') {
        navBtn.src = 'data/assets/buttons/back.webp';
        navBtn.alt = 'Back';
        navBtn.addEventListener('click', () => {
            window.location.href = 'familyArchive.html';
        });
    } else {
        navBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Extra button navigation
    const extraBtn = document.querySelector('.btn-extra');
    if (extraBtn && hasExtra()) {
        extraBtn.addEventListener('click', () => {
            window.location.href = `extra.html?slug=${currentSlug}`;
        });
    }

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
