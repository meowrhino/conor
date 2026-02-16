/**
 * commission.js — Commission gallery page logic
 *
 * Displays a horizontal scrolling gallery of all commission images.
 * Images loaded from: data/commission/{slug}/{n}.webp
 * Image count from: data.json commissions[].imageCount
 *
 * Auto-scrolls slowly in a seamless loop. Pauses on hover, resumes on leave.
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

async function loadCommissionImages() {
    const response = await fetch('data/data.json');
    const appData = await response.json();

    if (!appData.commissions || appData.commissions.length === 0) {
        console.error('[commission.js] No commissions found in data.json');
        window.location.href = 'index.html';
        return;
    }

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

    // Show container immediately (progressive loading)
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('commission-container').classList.remove('hidden');

    renderHorizontalScroll();
}

// ---------------------------------------------------------------------------
// Horizontal scroll rendering
// ---------------------------------------------------------------------------

/**
 * Render images inside two identical inner wrappers (A + B) so the
 * auto-scroll can loop seamlessly: when A scrolls fully out of view
 * we jump back by exactly one wrapper width.
 */
function renderHorizontalScroll() {
    const scrollContainer = document.getElementById('commission-scroll');
    scrollContainer.innerHTML = '';

    function buildSet() {
        const wrapper = document.createElement('div');
        wrapper.className = 'commission-set';

        images.forEach((commission) => {
            const group = document.createElement('div');
            group.className = 'commission-group';

            commission.images.forEach((src, imgIndex) => {
                const img = document.createElement('img');
                img.alt = `${commission.slug} ${imgIndex + 1}`;
                img.className = 'commission-image fade-on-load';
                img.addEventListener('click', () => openLightbox(src));
                img.src = src;
                group.appendChild(img);
            });

            wrapper.appendChild(group);
        });

        return wrapper;
    }

    const setA = buildSet();
    const setB = buildSet();
    scrollContainer.appendChild(setA);
    scrollContainer.appendChild(setB);

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();

    // Start auto-scroll once all images in the first set have loaded
    // so we can measure the correct width.
    const allImgs = setA.querySelectorAll('img');
    let loaded = 0;
    const total = allImgs.length;

    function onImgReady() {
        loaded++;
        if (loaded >= total) setupAutoScroll(setA);
    }

    allImgs.forEach((img) => {
        if (img.complete) { onImgReady(); return; }
        img.addEventListener('load', onImgReady);
        img.addEventListener('error', onImgReady);
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

    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('lightbox').classList.contains('hidden')) {
            closeLightbox();
        }
    });
}

// ---------------------------------------------------------------------------
// Auto-scroll — slow continuous loop, pauses on user interaction
// ---------------------------------------------------------------------------

function setupAutoScroll(setA) {
    const container = document.getElementById('commission-scroll');
    if (!container) return;

    const speed = 0.5;
    let paused = false;
    // Width of one full set of images (measured after load)
    const half = setA.offsetWidth;

    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });

    function tick() {
        if (!paused) {
            container.scrollLeft += speed;
            if (container.scrollLeft >= half) {
                container.scrollLeft -= half;
            }
        }
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
