// Global state
let appData = null;

// Initialize app
async function init() {
    const response = await fetch('data/data.json');
    appData = await response.json();
    
    setupNoiseCanvas();
    populateMenu();
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

// Populate menu with buttons
function populateMenu() {
    // Projects
    const projectsContainer = document.getElementById('projects-buttons');
    appData.projects.forEach(project => {
        const img = document.createElement('img');
        img.src = `data/projects/${project.slug}/${project.slug}.webp`;
        img.alt = project.title;
        img.addEventListener('click', () => handleProjectClick(project));
        projectsContainer.appendChild(img);
    });
    
    // Commissions
    const commissionsContainer = document.getElementById('commissions-buttons');
    appData.commissions.forEach(commission => {
        const img = document.createElement('img');
        img.src = `data/commission/${commission.slug}/1.webp`;
        img.alt = commission.title;
        img.addEventListener('click', () => goToProject('commission', commission.slug, commission.password));
        commissionsContainer.appendChild(img);
    });
    
    // Family Archive Albums
    const albumsContainer = document.getElementById('family-archive-albums');
    const archive = appData.familyArchive[0];
    archive.albums.forEach(album => {
        const link = document.createElement('div');
        link.className = 'album-link';
        link.textContent = album.title;
        link.addEventListener('click', () => goToProject('album', `${archive.slug}/${album.slug}`));
        albumsContainer.appendChild(link);
    });
}

// Handle project click
function handleProjectClick(project) {
    if (project.password) {
        showPasswordScreen(project);
    } else {
        goToProject('project', project.slug);
    }
}

// Show password screen
function showPasswordScreen(project) {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('password-screen').classList.remove('hidden');
    
    const input = document.getElementById('password-input');
    input.value = '';
    input.focus();
    
    const checkPassword = () => {
        const feedback = document.getElementById('password-feedback-img');
        
        if (input.value === project.password) {
            feedback.src = 'data/assets/password/correct.webp';
            feedback.classList.remove('hidden');
            
            setTimeout(() => {
                goToProject('project', project.slug);
            }, 1000);
        } else {
            feedback.src = 'data/assets/password/wrong.webp';
            feedback.classList.remove('hidden');
            
            setTimeout(() => {
                feedback.classList.add('hidden');
                input.value = '';
            }, 1500);
        }
    };
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') checkPassword();
    };
}

// Navigate to project page
function goToProject(type, slug, password) {
    window.location.href = `project.html?type=${type}&slug=${slug}${password ? '&password=' + password : ''}`;
}

// Setup event listeners
function setupEventListeners() {
    // About button
    document.getElementById('about-btn').addEventListener('click', () => {
        window.location.href = 'about.html';
    });
    
    // Commissions link
    document.getElementById('commissions-link').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('commissions-screen').classList.remove('hidden');
    });
    
    // Family Archive link
    document.getElementById('family-archive-link').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('family-archive-screen').classList.remove('hidden');
    });
    
    // Home buttons
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.addEventListener('click', goHome);
    });
    
    // Password back button
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('password-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });
    }
}

// Go back to home
function goHome() {
    document.getElementById('commissions-screen').classList.add('hidden');
    document.getElementById('family-archive-screen').classList.add('hidden');
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
