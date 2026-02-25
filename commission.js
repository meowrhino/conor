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
    let appData;
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        appData = await response.json();
    } catch (error) {
        console.error('[commission.js] Failed to load data/data.json. Redirecting to home.', error);
        window.location.href = 'index.html';
        return;
    }

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

        images.push({
            slug: commission.slug,
            title: commission.title || commission.slug,
            images: commissionImages
        });
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
 * Render images inside three identical wrappers (A + B + C) and keep
 * scroll position normalized inside the middle band. This prevents
 * "running out" of content on fast manual flicks.
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
                img.alt = `${commission.title} ${imgIndex + 1}`;
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
    const setC = buildSet();
    scrollContainer.appendChild(setA);
    scrollContainer.appendChild(setB);
    scrollContainer.appendChild(setC);

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();

    // Start auto-scroll once all images in the middle set have loaded
    // so we can measure the correct width.
    const allImgs = setB.querySelectorAll('img');
    let loaded = 0;
    const total = allImgs.length;

    if (total === 0) {
        setupAutoScroll(setB);
        return;
    }

    function onImgReady() {
        loaded++;
        if (loaded >= total) setupAutoScroll(setB);
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

function setupAutoScroll(referenceSet) {
    const container = document.getElementById('commission-scroll');
    if (!container) return;

    const speedPxPerSecond = 30;
    const storageKey = 'commissionScrollPos';
    const persistDelayMs = 200;
    let paused = false;
    let setWidth = referenceSet.offsetWidth;
    let savedPos = 0;
    let autoWrite = false;
    let lastTs = 0;
    let persistTimer = null;

    function normalizeOffset(value) {
        if (setWidth <= 0) return 0;
        return ((value % setWidth) + setWidth) % setWidth;
    }

    function normalizeToMiddleBand(value) {
        if (setWidth <= 0) return 0;
        return setWidth + normalizeOffset(value - setWidth);
    }

    function setScrollSafely(value) {
        autoWrite = true;
        container.scrollLeft = value;
        autoWrite = false;
    }

    function persistPosition() {
        try {
            localStorage.setItem(storageKey, String(savedPos));
        } catch {
            // Ignore storage errors (private mode / blocked storage).
        }
    }

    function schedulePersist() {
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
            persistTimer = null;
            persistPosition();
        }, persistDelayMs);
    }

    try {
        const stored = localStorage.getItem(storageKey);
        const parsed = Number(stored);
        if (Number.isFinite(parsed)) savedPos = parsed;
    } catch {
        // Ignore storage errors (private mode / blocked storage).
    }

    function syncFromCurrentScroll() {
        if (setWidth <= 0) return;
        const normalized = normalizeToMiddleBand(container.scrollLeft);
        if (Math.abs(normalized - container.scrollLeft) > 1) {
            setScrollSafely(normalized);
        }
        savedPos = normalizeOffset(normalized - setWidth);
    }

    savedPos = normalizeOffset(savedPos);
    if (setWidth > 0) {
        setScrollSafely(setWidth + savedPos);
    }

    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });
    container.addEventListener('scroll', () => {
        if (autoWrite || setWidth <= 0) return;
        syncFromCurrentScroll();
        schedulePersist();
    }, { passive: true });

    window.addEventListener('resize', () => {
        const prevWidth = setWidth;
        setWidth = referenceSet.offsetWidth;
        if (setWidth <= 0) return;

        if (prevWidth > 0) {
            savedPos = (savedPos / prevWidth) * setWidth;
        }
        savedPos = normalizeOffset(savedPos);
        setScrollSafely(setWidth + savedPos);
    });

    window.addEventListener('pagehide', () => {
        if (persistTimer) {
            clearTimeout(persistTimer);
            persistTimer = null;
        }
        persistPosition();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            if (persistTimer) {
                clearTimeout(persistTimer);
                persistTimer = null;
            }
            persistPosition();
        }
    });

    function tick(ts) {
        if (!lastTs) lastTs = ts;
        const deltaSeconds = (ts - lastTs) / 1000;
        lastTs = ts;

        if (!paused && setWidth > 0) {
            savedPos = normalizeOffset(savedPos + (speedPxPerSecond * deltaSeconds));
            setScrollSafely(setWidth + savedPos);
        }
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
