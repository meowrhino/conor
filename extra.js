/**
 * extra.js — Extra content page logic for extra.html
 *
 * Displays a horizontal scrolling gallery of extra images for a project.
 * URL params: ?slug={projectSlug}
 * Images loaded from: data/projects/{slug}/extra/{n}.webp
 * Image count from: data.json projects[].extraCount
 */

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

let projectSlug = null;
let images = [];

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    const params = new URLSearchParams(window.location.search);
    projectSlug = params.get('slug');

    if (!projectSlug) {
        console.error('[extra.js] No slug provided in URL params');
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
 * Load all extra images using extraCount from data.json
 */
async function loadExtraImages() {
    // Fetch project data
    let appData;
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        appData = await response.json();
    } catch (error) {
        console.error('[extra.js] Failed to load data/data.json. Redirecting to home.', error);
        window.location.href = 'index.html';
        return;
    }

    const project = appData.projects.find(p => p.slug === projectSlug);

    if (!project) {
        console.error(`[extra.js] Project not found: ${projectSlug}`);
        window.location.href = 'index.html';
        return;
    }

    if (!project.extraCount || project.extraCount <= 0) {
        console.error(`[extra.js] Project "${projectSlug}" has no extraCount defined in data.json`);
        window.location.href = `project.html?type=project&slug=${projectSlug}`;
        return;
    }

    const basePath = `data/projects/${projectSlug}/extra/`;
    for (let i = 1; i <= project.extraCount; i++) {
        images.push(`${basePath}${i}.webp`);
    }

    // Show container immediately (progressive loading)
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('extra-container').classList.remove('hidden');

    renderHorizontalScroll();
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
        img.alt = `Extra ${index + 1}`;
        img.className = 'extra-image fade-on-load';
        img.src = src;
        scrollContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
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
