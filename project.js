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
    
    // Get URL parameters
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

// Load project data and images
async function loadProject() {
    // Find project data
    if (currentType === 'project') {
        currentProject = appData.projects.find(p => p.slug === currentSlug);
    } else if (currentType === 'commission') {
        currentProject = appData.commissions.find(c => c.slug === currentSlug);
    } else if (currentType === 'album') {
        // Album format: ashlee/1987_rhodes
        const [archiveSlug, albumSlug] = currentSlug.split('/');
        const archive = appData.familyArchive.find(a => a.slug === archiveSlug);
        const album = archive.albums.find(a => a.slug === albumSlug);
        
        // Load album images from albums.json
        const albumsResponse = await fetch(`data/familyArchive/${archiveSlug}/albums.json`);
        const albumsData = await albumsResponse.json();
        const albumImages = albumsData[albumSlug];
        
        currentProject = {
            title: album.title,
            description: `Family archive: ${album.title}`,
            imageCount: albumImages.length,
            slug: albumSlug,
            archiveSlug: archiveSlug,
            albumImages: albumImages
        };
    }
    
    if (!currentProject) {
        window.location.href = 'index.html';
        return;
    }
    
    // Prepare images array
    prepareImages();
    
    // Show preloader and load images
    await preloadImages();
    
    // Hide preloader and show gallery
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');
    
    // Render gallery
    renderGallery();
    
    // Setup info panel
    setupInfoPanel();
}

// Prepare images array based on type
function prepareImages() {
    images = [];
    
    if (currentType === 'album') {
        const basePath = `data/familyArchive/${currentProject.archiveSlug}/${currentProject.slug}/`;
        currentProject.albumImages.forEach(img => {
            images.push(basePath + img);
        });
    } else {
        const basePath = currentType === 'project' 
            ? `data/projects/${currentSlug}/img/`
            : `data/commission/${currentSlug}/`;
        
        for (let i = 1; i <= currentProject.imageCount; i++) {
            images.push(`${basePath}${i}.webp`);
        }
    }
}

// Preload images with progress bar
async function preloadImages() {
    const loaderBar = document.getElementById('loader-bar');
    let loaded = 0;
    
    const promises = images.map((src, index) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                const progress = (loaded / images.length) * 100;
                loaderBar.style.width = progress + '%';
                resolve();
            };
            img.onerror = () => {
                loaded++;
                const progress = (loaded / images.length) * 100;
                loaderBar.style.width = progress + '%';
                resolve();
            };
            img.src = src;
        });
    });
    
    await Promise.all(promises);
}

// Render gallery with imperfect grid
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    images.forEach((src, index) => {
        const container = document.createElement('div');
        container.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${currentProject.title} - ${index + 1}`;
        img.loading = 'lazy';
        img.addEventListener('click', () => openLightbox(index));
        
        container.appendChild(img);
        grid.appendChild(container);
    });
}

// Open lightbox
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    
    lightboxImage.src = images[currentImageIndex];
    lightbox.classList.remove('hidden');
    
    updateLightboxButtons();
}

// Close lightbox
function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
}

// Navigate lightbox
function navigateLightbox(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;
    
    document.getElementById('lightbox-image').src = images[currentImageIndex];
    updateLightboxButtons();
}

// Update lightbox navigation buttons
function updateLightboxButtons() {
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    
    prevBtn.style.opacity = currentImageIndex === 0 ? '0.3' : '1';
    nextBtn.style.opacity = currentImageIndex === images.length - 1 ? '0.3' : '1';
}

// Setup info panel content
function setupInfoPanel() {
    const infoContent = document.getElementById('info-content');
    
    if (currentType === 'album') {
        infoContent.innerHTML = `
            <h3>${currentProject.title}</h3>
            <p><strong>Description:</strong> ${currentProject.description}</p>
            <p><strong>Images:</strong> ${currentProject.imageCount}</p>
        `;
    } else {
        infoContent.innerHTML = `
            <h3>${currentProject.title}</h3>
            ${currentProject.year ? `<p><strong>Year:</strong> ${currentProject.year}</p>` : ''}
            ${currentProject.technique ? `<p><strong>Technique:</strong> ${currentProject.technique}</p>` : ''}
            ${currentProject.dimensions ? `<p><strong>Dimensions:</strong> ${currentProject.dimensions}</p>` : ''}
            ${currentProject.client ? `<p><strong>Client:</strong> ${currentProject.client}</p>` : ''}
            <p><strong>Description:</strong> ${currentProject.description}</p>
        `;
    }
}

// Setup static noise overlay
function setupNoiseCanvas() {
    const canvas = document.getElementById('noise-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    function drawNoise() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255;
            data[i] = noise;
            data[i + 1] = noise;
            data[i + 2] = noise;
            data[i + 3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function animateNoise() {
        drawNoise();
        requestAnimationFrame(animateNoise);
    }
    
    animateNoise();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Home button
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Info button
    document.querySelector('.btn-info').addEventListener('click', () => {
        document.getElementById('info-panel').classList.toggle('hidden');
    });
    
    // Lightbox close
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    
    // Lightbox navigation
    document.querySelector('.btn-prev').addEventListener('click', () => navigateLightbox(-1));
    document.querySelector('.btn-next').addEventListener('click', () => navigateLightbox(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'Escape') closeLightbox();
        }
    });
    
    // Click outside lightbox to close
    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
