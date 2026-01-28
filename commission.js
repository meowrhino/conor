/**
 * commission.js — Commission gallery page logic
 *
 * Displays a horizontal scrolling gallery of all commission images.
 * Images loaded from: data/commission/{slug}/{n}.webp
 * Image count from: data.json commissions[].imageCount
 */

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

let images = [];

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    setupNoiseCanvas();
    await loadCommissionImages();
    setupEventListeners();
}

// ---------------------------------------------------------------------------
// Image loading
// ---------------------------------------------------------------------------

/**
 * Load all commission images using imageCount from data.json
 */
async function loadCommissionImages() {
    const response = await fetch('data/data.json');
    const appData = await response.json();

    if (!appData.commissions || appData.commissions.length === 0) {
        console.error('[commission.js] No commissions found in data.json');
        window.location.href = 'index.html';
        return;
    }

    // Build images array from each commission using imageCount
    for (const commission of appData.commissions) {
        if (!commission.imageCount || commission.imageCount <= 0) {
            console.warn(`[commission.js] Commission "${commission.slug}" has no imageCount, skipping`);
            continue;
        }

        const basePath = `data/commission/${commission.slug}/`;
        const commissionImages = [];

        for (let i = 1; i <= commission.imageCount; i++) {
            commissionImages.push(`${basePath}${i}.webp`);
        }

        images.push({ slug: commission.slug, images: commissionImages });
    }

    if (images.length === 0) {
        console.error('[commission.js] No commission images to display');
        window.location.href = 'index.html';
        return;
    }

    await preloadImages();

    // Hide preloader, show commission container
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('commission-container').classList.remove('hidden');

    renderHorizontalScroll();
}

/**
 * Preload all images with progress bar
 */
async function preloadImages() {
    const loaderBar = document.getElementById('loader-bar');
    let loaded = 0;

    // Flatten all images for preloading
    const allImages = images.flatMap(commission => commission.images);
    const total = allImages.length;

    const promises = allImages.map(src => {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loaded++;
                loaderBar.style.width = (loaded / total * 100) + '%';
                resolve();
            };
            img.src = src;
        });
    });

    await Promise.all(promises);
}

// ---------------------------------------------------------------------------
// Horizontal scroll rendering
// ---------------------------------------------------------------------------

/**
 * Render images in a horizontal scrolling container
 * Groups images by commission with extra spacing between groups
 */
function renderHorizontalScroll() {
    const scrollContainer = document.getElementById('commission-scroll');
    scrollContainer.innerHTML = '';

    images.forEach((commission, commissionIndex) => {
        // Create a group container for each commission
        const group = document.createElement('div');
        group.className = 'commission-group';

        commission.images.forEach((src, imgIndex) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${commission.slug} ${imgIndex + 1}`;
            img.className = 'commission-image';
            img.addEventListener('click', () => openLightbox(src));
            group.appendChild(img);
        });

        scrollContainer.appendChild(group);
    });
}

// ---------------------------------------------------------------------------
// Lightbox — simple full-screen image viewer (no navigation)
// ---------------------------------------------------------------------------

function openLightbox(src) {
    document.getElementById('lightbox-image').src = src;
    document.getElementById('lightbox').classList.remove('hidden');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function setupEventListeners() {
    document.querySelector('.btn-home-commission').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Lightbox controls
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

    // Click outside image to close lightbox
    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });

    // Escape key to close lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('lightbox').classList.contains('hidden')) {
            closeLightbox();
        }
    });
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
