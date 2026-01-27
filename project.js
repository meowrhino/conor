// Global state
let appData = null;
let currentProject = null;
let currentType = null;
let currentSlug = null;
let images = [];
let currentImageIndex = 0;

// Initialize app
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

// Load project data and images
async function loadProject() {
    if (currentType === 'project') {
        currentProject = appData.projects.find(p => p.slug === currentSlug);
    } else if (currentType === 'commission') {
        currentProject = appData.commissions.find(c => c.slug === currentSlug);
    } else if (currentType === 'album') {
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

    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');

    renderMasonryGallery();
    setupInfoPanel();
}

// Prepare images array based on type
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

        if (currentType === 'project') {
            const manifest = await loadImageManifest(`data/projects/${currentSlug}/images.json`);
            if (manifest && manifest.length) {
                manifest.forEach(file => images.push(basePath + file));
                return;
            }
        }

        for (let i = 1; i <= currentProject.imageCount; i++) {
            images.push(`${basePath}${i}.webp`);
        }
    }
}

// Preload images with progress bar
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

// Render gallery with masonry layout
function renderMasonryGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    const columnCount = window.innerWidth < 900 ? 2 : 3;
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

// Lightbox
function openLightbox(index) {
    currentImageIndex = index;
    document.getElementById('lightbox-image').src = images[currentImageIndex];
    document.getElementById('lightbox').classList.remove('hidden');
    updateLightboxButtons();
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
}

function navigateLightbox(direction) {
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    document.getElementById('lightbox-image').src = images[currentImageIndex];
    updateLightboxButtons();
}

function updateLightboxButtons() {
    document.querySelector('.btn-prev').style.opacity = currentImageIndex === 0 ? '0.3' : '';
    document.querySelector('.btn-next').style.opacity = currentImageIndex === images.length - 1 ? '0.3' : '';
}

// Info panel — uses DOM methods instead of innerHTML
function setupInfoPanel() {
    const container = document.getElementById('info-content');
    container.innerHTML = '';

    const h3 = document.createElement('h3');
    h3.textContent = currentProject.title;
    container.appendChild(h3);

    const fields = currentType === 'album'
        ? [['Description', currentProject.description], ['Images', currentProject.imageCount]]
        : [
            ['Year', currentProject.year],
            ['Technique', currentProject.technique],
            ['Dimensions', currentProject.dimensions],
            ['Client', currentProject.client],
            ['Description', currentProject.description]
        ];

    fields.forEach(([label, value]) => {
        if (!value) return;
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = label + ': ';
        p.appendChild(strong);
        p.appendChild(document.createTextNode(value));
        container.appendChild(p);
    });
}

// Event listeners
function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.querySelector('.btn-info').addEventListener('click', () => {
        document.getElementById('info-panel').classList.toggle('hidden');
    });

    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.btn-prev').addEventListener('click', () => navigateLightbox(-1));
    document.querySelector('.btn-next').addEventListener('click', () => navigateLightbox(1));

    document.addEventListener('keydown', (e) => {
        if (document.getElementById('lightbox').classList.contains('hidden')) return;
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === 'Escape') closeLightbox();
    });

    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
}

window.addEventListener('DOMContentLoaded', init);
