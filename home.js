/**
 * home.js — Main menu logic for index.html
 *
 * Loads data.json, populates menu buttons for projects/commissions/albums,
 * handles password-protected projects, and manages screen navigation.
 *
 * Navigation flow:
 *   Main menu → Commissions screen | Family archive screen | Password screen
 *   Any selection → project.html?type=...&slug=...
 */

let appData = null;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    const response = await fetch('data/data.json');
    appData = await response.json();

    setupNoiseCanvas();
    populateMenu();
    setupEventListeners();
    setHomeState(true);
}

// ---------------------------------------------------------------------------
// Menu population — builds buttons dynamically from data.json
// ---------------------------------------------------------------------------

/**
 * Try to load title.webp from the project folder; fall back to assets/titles/.
 */
function setTitleImage(img, slug, fallbackSrc) {
    const preferredSrc = `data/projects/${slug}/title.webp`;
    img.src = preferredSrc;
    img.onerror = () => {
        img.onerror = null;
        img.src = fallbackSrc;
    };
}

/**
 * Toggle body.is-home class — used by CSS to hide the home button on home.
 */
function setHomeState(isHome) {
    document.body.classList.toggle('is-home', isHome);
}

function populateMenu() {
    // Projects — title images as buttons
    const projectsContainer = document.getElementById('projects-buttons');
    appData.projects.forEach(project => {
        const img = document.createElement('img');
        img.className = 'interactive';
        setTitleImage(img, project.slug, `data/assets/titles/${project.slug}.webp`);
        img.alt = project.title;
        img.addEventListener('click', () => handleProjectClick(project));
        projectsContainer.appendChild(img);
    });

    // Commissions — first image as thumbnail
    const commissionsContainer = document.getElementById('commissions-buttons');
    appData.commissions.forEach(commission => {
        const img = document.createElement('img');
        img.className = 'interactive';
        img.src = `data/commission/${commission.slug}/1.webp`;
        img.alt = commission.title;
        img.addEventListener('click', () => goToProject('commission', commission.slug));
        commissionsContainer.appendChild(img);
    });

    // Family archive albums — handwritten title images
    const albumsContainer = document.getElementById('family-archive-albums');
    const archive = appData.familyArchive[0];
    archive.albums.forEach(album => {
        const img = document.createElement('img');
        img.className = 'interactive';
        img.src = `data/familyArchive/${archive.slug}/${album.slug}/title.webp`;
        img.alt = album.title;
        img.addEventListener('click', () => goToProject('album', `${archive.slug}/${album.slug}`));
        albumsContainer.appendChild(img);
    });
}

// ---------------------------------------------------------------------------
// Password protection
// ---------------------------------------------------------------------------

/** Guard flag to prevent double-submit on fast Enter key repeats */
let passwordChecking = false;

function handleProjectClick(project) {
    if (project.password) {
        showPasswordScreen(project);
    } else {
        goToProject('project', project.slug);
    }
}

function showPasswordScreen(project) {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('password-screen').classList.remove('hidden');
    setHomeState(false);
    passwordChecking = false;

    const input = document.getElementById('password-input');
    const feedback = document.getElementById('password-feedback-img');
    input.value = '';
    feedback.classList.add('hidden');
    input.focus();

    const checkPassword = () => {
        if (passwordChecking) return;
        passwordChecking = true;

        if (input.value === project.password) {
            feedback.src = 'data/assets/password/correct.webp';
            feedback.classList.remove('hidden');
            setTimeout(() => goToProject('project', project.slug), 1000);
        } else {
            // Show project-specific hint if available, otherwise show generic wrong
            const hintPath = `data/projects/${project.slug}/hint.webp`;
            feedback.src = hintPath;
            
            // Fallback to generic wrong if hint doesn't exist
            feedback.onerror = () => {
                feedback.onerror = null;
                feedback.src = 'data/assets/password/wrong.webp';
            };
            
            feedback.classList.remove('hidden');
            setTimeout(() => {
                feedback.classList.add('hidden');
                input.value = '';
                passwordChecking = false;
            }, 1500);
        }
    };

    input.onkeydown = (e) => {
        if (e.key === 'Enter') checkPassword();
    };
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function goToProject(type, slug) {
    window.location.href = `project.html?type=${type}&slug=${slug}`;
}

function setupEventListeners() {
    document.getElementById('about-btn').addEventListener('click', () => {
        window.location.href = 'about.html';
    });

    // Show commissions sub-screen
    document.getElementById('commissions-link').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('commissions-screen').classList.remove('hidden');
        setHomeState(false);
    });

    // Navigate to family archive page
    document.getElementById('family-archive-link').addEventListener('click', () => {
        window.location.href = 'familyArchive.html';
    });

    // Home buttons — return to main menu
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.addEventListener('click', goHome);
    });

    // Password back button
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('password-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
            setHomeState(true);
        });
    }
}

function goHome() {
    document.getElementById('commissions-screen').classList.add('hidden');
    document.getElementById('family-archive-screen').classList.add('hidden');
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    setHomeState(true);
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
