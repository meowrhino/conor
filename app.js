// Global state
let appData = null;
let currentProject = null;
let currentSection = null;
let familyAlbumsCache = {};

// Initialize app
async function init() {
    // Load data
    const response = await fetch('data/data.json');
    appData = await response.json();
    
    // Setup noise canvas
    setupNoiseCanvas();
    
    // Populate menu buttons
    populateMenu();
    
    // Setup event listeners
    setupEventListeners();
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatLabel(value) {
    return String(value)
        .replace(/_+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function generateTitleDataUrl(text) {
    const label = formatLabel(text);
    const maxChars = 18;
    const baseSize = 52;
    const scale = Math.min(1, maxChars / Math.max(label.length, 1));
    const fontSize = Math.max(24, Math.round(baseSize * scale));
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="700" height="140" viewBox="0 0 700 140">
            <rect width="100%" height="100%" fill="transparent"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}"
                font-weight="700" fill="#444cf7">
                ${escapeXml(label)}
            </text>
        </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function setMenuImage(img, slug, label) {
    const preferredSrc = `data/assets/titles/${slug}.webp`;
    img.src = preferredSrc;
    img.onerror = () => {
        img.onerror = null;
        img.src = generateTitleDataUrl(label || slug);
    };
}

function hideScreens() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('commissions-screen').classList.add('hidden');
    document.getElementById('family-archive-screen').classList.add('hidden');
    document.getElementById('gallery').classList.add('hidden');
    document.getElementById('about-screen').classList.add('hidden');
    document.getElementById('password-screen').classList.add('hidden');
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
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = 255;   // A
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Animate noise
    function animateNoise() {
        drawNoise();
        requestAnimationFrame(animateNoise);
    }
    
    animateNoise();
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Populate menu with buttons
function populateMenu() {
    populateProjectsMenu();
    populateCommissionsMenu();
    populateFamilyArchiveMenu();
}

function populateProjectsMenu() {
    const projectsContainer = document.getElementById('projects-buttons');
    projectsContainer.innerHTML = '';
    appData.projects.forEach(project => {
        const img = document.createElement('img');
        setMenuImage(img, project.slug, project.title);
        img.alt = project.title;
        img.dataset.slug = project.slug;
        img.dataset.section = 'projects';
        img.addEventListener('click', () => handleProjectClick(project, 'projects'));
        projectsContainer.appendChild(img);
    });
}

function populateCommissionsMenu() {
    const commissionsContainer = document.getElementById('commissions-buttons');
    commissionsContainer.innerHTML = '';
    appData.commissions.forEach(commission => {
        const img = document.createElement('img');
        setMenuImage(img, commission.slug, commission.title);
        img.alt = commission.title;
        img.dataset.slug = commission.slug;
        img.dataset.section = 'commissions';
        img.addEventListener('click', () => handleProjectClick(commission, 'commissions'));
        commissionsContainer.appendChild(img);
    });
}

function populateFamilyArchiveMenu() {
    const sectionsContainer = document.getElementById('family-archive-sections');
    sectionsContainer.innerHTML = '';

    appData.familyArchive.forEach(archive => {
        const section = document.createElement('div');
        section.className = 'menu-section';

        const titleWrap = document.createElement('div');
        titleWrap.className = 'menu-title';
        const titleImg = document.createElement('img');
        setMenuImage(titleImg, archive.slug, archive.title);
        titleImg.alt = archive.title;
        titleWrap.appendChild(titleImg);

        const buttons = document.createElement('div');
        buttons.className = 'menu-buttons';

        archive.folders.forEach(folder => {
            const img = document.createElement('img');
            const label = formatLabel(folder);
            setMenuImage(img, folder, label);
            img.alt = label;
            img.dataset.archive = archive.slug;
            img.dataset.folder = folder;
            img.addEventListener('click', () => handleFamilyAlbumClick(archive, folder));
            buttons.appendChild(img);
        });

        section.appendChild(titleWrap);
        section.appendChild(buttons);
        sectionsContainer.appendChild(section);
    });
}

// Handle project/commission click
function handleProjectClick(project, section) {
    currentProject = project;
    currentSection = section;
    
    // Check if password required
    if (project.password) {
        showPasswordScreen();
    } else {
        loadGallery();
    }
}

// Handle family album click
function handleFamilyAlbumClick(archive, folder) {
    currentProject = {
        ...archive,
        albumFolder: folder,
        albumTitle: formatLabel(folder)
    };
    currentSection = 'familyAlbum';
    loadFamilyAlbum(archive, folder);
}

// Show password screen
function showPasswordScreen() {
    hideScreens();
    document.getElementById('password-screen').classList.remove('hidden');
    
    const input = document.getElementById('password-input');
    input.value = '';
    input.focus();
    
    // Handle password submission
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
}

// Check password
function checkPassword() {
    const input = document.getElementById('password-input');
    const feedback = document.getElementById('password-feedback-img');
    
    if (input.value === currentProject.password) {
        feedback.src = 'data/assets/password/correct.webp';
        feedback.classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('password-screen').classList.add('hidden');
            loadGallery();
        }, 1000);
    } else {
        feedback.src = 'data/assets/password/wrong.webp';
        feedback.classList.remove('hidden');
        
        setTimeout(() => {
            feedback.classList.add('hidden');
            input.value = '';
        }, 1500);
    }
}

// Load gallery with progressive image loading
function loadGallery() {
    hideScreens();
    document.getElementById('gallery').classList.remove('hidden');
    document.getElementById('info-panel').classList.add('hidden');
    
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    const basePath = currentSection === 'projects' 
        ? `data/projects/${currentProject.slug}/img/`
        : `data/commission/${currentProject.slug}/`;
    
    // Load images progressively
    let loadedCount = 0;
    const totalImages = currentProject.imageCount;
    
    function loadNextImage() {
        if (loadedCount >= totalImages) return;
        
        loadedCount++;
        const img = document.createElement('img');
        img.src = `${basePath}${loadedCount}.webp`;
        img.alt = `${currentProject.title} - ${loadedCount}`;
        img.style.animationDelay = `${loadedCount * 0.05}s`;
        
        img.onload = () => {
            grid.appendChild(img);
            setTimeout(loadNextImage, 50); // Delay between loads
        };
        
        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            setTimeout(loadNextImage, 50);
        };
    }
    
    // Start loading
    loadNextImage();
    
    // Setup info panel content
    setupInfoPanel();
}

async function getFamilyAlbums(archiveSlug) {
    if (familyAlbumsCache[archiveSlug]) {
        return familyAlbumsCache[archiveSlug];
    }
    try {
        const response = await fetch(`data/familyArchive/${archiveSlug}/albums.json`);
        if (!response.ok) {
            throw new Error(`Albums manifest not found for ${archiveSlug}`);
        }
        const data = await response.json();
        familyAlbumsCache[archiveSlug] = data;
        return data;
    } catch (error) {
        console.error(error);
        return {};
    }
}

// Load family album
async function loadFamilyAlbum(archive, folder) {
    hideScreens();
    document.getElementById('gallery').classList.remove('hidden');
    document.getElementById('info-panel').classList.add('hidden');

    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    const albums = await getFamilyAlbums(archive.slug);
    const files = albums[folder] || [];
    const basePath = `data/familyArchive/${archive.slug}/${folder}/`;

    if (!files.length) {
        console.warn(`No files found for album: ${folder}`);
        return;
    }

    let loadedCount = 0;
    const totalImages = files.length;

    function loadNextImage() {
        if (loadedCount >= totalImages) return;

        const fileName = files[loadedCount];
        loadedCount++;

        const img = document.createElement('img');
        img.src = `${basePath}${fileName}`;
        img.alt = `${archive.title} - ${formatLabel(folder)} - ${loadedCount}`;
        img.style.animationDelay = `${loadedCount * 0.05}s`;

        img.onload = () => {
            grid.appendChild(img);
            setTimeout(loadNextImage, 50);
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            setTimeout(loadNextImage, 50);
        };
    }

    loadNextImage();
    setupInfoPanel();
}

// Setup info panel content
function setupInfoPanel() {
    const infoContent = document.getElementById('info-content');
    
    if (currentSection === 'familyAlbum') {
        infoContent.innerHTML = `
            <h3>${currentProject.title}</h3>
            <p><strong>Album:</strong> ${currentProject.albumTitle}</p>
            <p><strong>Description:</strong> ${currentProject.description}</p>
        `;
    } else {
        infoContent.innerHTML = `
            <h3>${currentProject.title}</h3>
            <p><strong>Year:</strong> ${currentProject.year}</p>
            <p><strong>Technique:</strong> ${currentProject.technique}</p>
            ${currentProject.dimensions ? `<p><strong>Dimensions:</strong> ${currentProject.dimensions}</p>` : ''}
            ${currentProject.client ? `<p><strong>Client:</strong> ${currentProject.client}</p>` : ''}
            <p><strong>Description:</strong> ${currentProject.description}</p>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // About button
    document.getElementById('about-btn').addEventListener('click', () => {
        hideScreens();
        document.getElementById('about-screen').classList.remove('hidden');
    });

    // Commissions link
    document.getElementById('commissions-link').addEventListener('click', () => {
        hideScreens();
        document.getElementById('commissions-screen').classList.remove('hidden');
    });

    // Family archive link
    document.getElementById('family-archive-link').addEventListener('click', () => {
        hideScreens();
        document.getElementById('family-archive-screen').classList.remove('hidden');
    });
    
    // Home buttons
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.addEventListener('click', goHome);
    });
    
    // Password back button
    document.querySelector('.btn-back').addEventListener('click', () => {
        hideScreens();
        document.getElementById('main-menu').classList.remove('hidden');
    });
    
    // Info button
    document.querySelector('.btn-info').addEventListener('click', () => {
        const panel = document.getElementById('info-panel');
        panel.classList.toggle('hidden');
    });
    
    // More button (placeholder)
    document.querySelector('.btn-more').addEventListener('click', () => {
        console.log('More menu clicked');
        // Add additional menu functionality here
    });
}

// Go back to home
function goHome() {
    hideScreens();
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('info-panel').classList.add('hidden');
    
    currentProject = null;
    currentSection = null;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
