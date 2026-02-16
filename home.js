/**
 * home.js — Main menu logic for index.html
 *
 * Loads data.json, populates menu buttons for projects,
 * handles password-protected projects, and manages screen navigation.
 *
 * Navigation flow:
 *   Main menu → Password screen (for protected projects)
 *   Projects → project.html?type=project&slug=...
 *   Commissions → commission.html
 *   Family Archive → familyArchive.html
 */

let appData = null;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

async function init() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        appData = await response.json();
    } catch (error) {
        console.error('[home.js] Failed to load data/data.json. Main menu cannot be built.', error);
        return;
    }

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

    if (!appData.projects || appData.projects.length === 0) {
        console.error('[home.js] No projects found in data.json');
        return;
    }

    appData.projects.forEach(project => {
        if (!project.imageCount || project.imageCount <= 0) {
            console.warn(`[home.js] Project "${project.slug}" has no imageCount, skipping`);
            return;
        }

        const img = document.createElement('img');
        img.className = 'interactive fade-on-load';
        setTitleImage(img, project.slug, `data/assets/titles/${project.slug}.webp`);
        img.alt = project.title;
        img.addEventListener('click', () => handleProjectClick(project));
        projectsContainer.appendChild(img);
    });

    // Trigger progressive loading for dynamically added images
    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
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
            input.value = '';
            passwordChecking = false;
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

    // Navigate to commission page
    document.getElementById('commissions-link').addEventListener('click', () => {
        window.location.href = 'commission.html';
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
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    setHomeState(true);
}

// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', init);
