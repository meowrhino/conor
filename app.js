// Global state
let appData = null;
let currentProject = null;
let currentSection = null;

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
    // Projects
    const projectsContainer = document.getElementById('projects-buttons');
    appData.projects.forEach(project => {
        const img = document.createElement('img');
        img.src = `data/projects/${project.slug}/${project.slug}.webp`;
        img.alt = project.title;
        img.dataset.slug = project.slug;
        img.dataset.section = 'projects';
        img.addEventListener('click', () => handleProjectClick(project, 'projects'));
        projectsContainer.appendChild(img);
    });
    
    // Commissions
    const commissionsContainer = document.getElementById('commissions-buttons');
    appData.commissions.forEach(commission => {
        const img = document.createElement('img');
        img.src = `data/commission/${commission.slug}/1.webp`;
        img.alt = commission.title;
        img.dataset.slug = commission.slug;
        img.dataset.section = 'commissions';
        img.addEventListener('click', () => handleProjectClick(commission, 'commissions'));
        commissionsContainer.appendChild(img);
    });
    
    // Family Archive
    const familyContainer = document.getElementById('family-archive-buttons');
    appData.familyArchive.forEach(archive => {
        const img = document.createElement('img');
        img.src = `data/familyArchive/${archive.slug}/1987_rhodes/img20240925_16355201.webp`;
        img.alt = archive.title;
        img.dataset.slug = archive.slug;
        img.dataset.section = 'familyArchive';
        img.addEventListener('click', () => handleFamilyArchiveClick(archive));
        familyContainer.appendChild(img);
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

// Handle family archive click
function handleFamilyArchiveClick(archive) {
    currentProject = archive;
    currentSection = 'familyArchive';
    loadFamilyArchive();
}

// Show password screen
function showPasswordScreen() {
    document.getElementById('main-menu').classList.add('hidden');
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
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');
    
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

// Load family archive
function loadFamilyArchive() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');
    
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    // Load all images from all folders
    const basePath = `data/familyArchive/${currentProject.slug}/`;
    let loadedCount = 0;
    
    currentProject.folders.forEach(folder => {
        // For now, we'll need to scan the folder or have a list
        // This is a simplified version - in production you'd want to list files
        fetch(`${basePath}${folder}/`)
            .then(response => response.text())
            .then(html => {
                // Parse folder contents (simplified)
                // In a real scenario, you'd need a proper file listing
                console.log(`Loading folder: ${folder}`);
            });
    });
    
    // Setup info panel for family archive
    setupInfoPanel();
}

// Setup info panel content
function setupInfoPanel() {
    const infoContent = document.getElementById('info-content');
    
    if (currentSection === 'familyArchive') {
        infoContent.innerHTML = `
            <h3>${currentProject.title}</h3>
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
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('about-screen').classList.remove('hidden');
    });
    
    // Home buttons
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.addEventListener('click', goHome);
    });
    
    // Password back button
    document.querySelector('.btn-back').addEventListener('click', () => {
        document.getElementById('password-screen').classList.add('hidden');
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
    document.getElementById('gallery').classList.add('hidden');
    document.getElementById('about-screen').classList.add('hidden');
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('info-panel').classList.add('hidden');
    
    currentProject = null;
    currentSection = null;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
