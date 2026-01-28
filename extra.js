/**
 * extra.js — Extra content page logic for extra.html
 *
 * Displays a horizontal scrolling gallery of extra images for a project.
 * URL params: ?slug={projectSlug}
 * Images loaded from: data/projects/{slug}/extra/{n}.webp
 */

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

let projectSlug = null;
let images = [];
let imageCount = 0;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    const params = new URLSearchParams(window.location.search);
    projectSlug = params.get('slug');

    if (!projectSlug) {
        window.location.href = 'index.html';
        return;
    }

    setupNoiseCanvas();
    await loadExtraImages();
    setupEventListeners();
}

// ---------------------------------------------------------------------------
// Image loading
// ---------------------------------------------------------------------------

/**
 * Detect how many images exist in the extra folder by trying to load them
 * sequentially until we hit a 404.
 */
async function detectImageCount() {
    let count = 0;
    const basePath = `data/projects/${projectSlug}/extra/`;
    
    // Try up to 100 images (reasonable limit)
    for (let i = 1; i <= 100; i++) {
        try {
            const response = await fetch(`${basePath}${i}.webp`, { method: 'HEAD' });
            if (response.ok) {
                count = i;
            } else {
                break;
            }
        } catch {
            break;
        }
    }
    
    return count;
}

/**
 * Load all extra images and render the horizontal scroll
 */
async function loadExtraImages() {
    imageCount = await detectImageCount();
    
    if (imageCount === 0) {
        window.location.href = 'index.html';
        return;
    }

    const basePath = `data/projects/${projectSlug}/extra/`;
    for (let i = 1; i <= imageCount; i++) {
        images.push(`${basePath}${i}.webp`);
    }

    await preloadImages();
    
    // Hide preloader, show extra container
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('extra-container').classList.remove('hidden');
    
    renderHorizontalScroll();
}

/**
 * Preload all images with progress bar
 */
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
// Horizontal scroll rendering
// ---------------------------------------------------------------------------

/**
 * Render images in a horizontal scrolling container
 */
function renderHorizontalScroll() {
    const scrollContainer = document.getElementById('extra-scroll');
    scrollContainer.innerHTML = '';

    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Extra ${index + 1}`;
        img.className = 'extra-image';
        scrollContainer.appendChild(img);
    });
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function setupEventListeners() {
    document.querySelector('.btn-back-extra').addEventListener('click', () => {
        window.location.href = `project.html?type=project&slug=${projectSlug}`;
    });
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
