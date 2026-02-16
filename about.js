/**
 * about.js — About page logic for about.html
 *
 * Loads contact info from data.json and wires up:
 *   - Email link (mailto:)
 *   - Phone copy-to-clipboard (with fallback for older browsers)
 *   - Home button navigation
 */

async function init() {
    const response = await fetch('data/data.json');
    const appData = await response.json();

    // Wire up contact links from data.json
    const emailLink = document.getElementById('email-link');
    const phoneCopy = document.getElementById('phone-copy');
    const instagramLink = document.getElementById('instagram-link');
    const phoneNumber = appData.contact.phone;

    emailLink.href = `mailto:${appData.contact.email}`;
    instagramLink.href = `https://www.instagram.com/${appData.contact.instagram}/`;
    instagramLink.target = '_blank';
    instagramLink.rel = 'noopener noreferrer';

    // Copy phone number to clipboard on click
    phoneCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(phoneNumber);
        } catch {
            // Fallback for browsers without clipboard API
            const helper = document.createElement('textarea');
            helper.value = phoneNumber;
            helper.setAttribute('readonly', '');
            helper.style.position = 'absolute';
            helper.style.left = '-9999px';
            document.body.appendChild(helper);
            helper.select();
            document.execCommand('copy');
            document.body.removeChild(helper);
        }
    });

    setupNoiseCanvas();
    loadCvImages();
    loadBioImages(appData.contact.imageCount);
    setupEventListeners();
}

/**
 * Load CV images from data/bio/cv/ and make them clickable for lightbox
 */
function loadCvImages() {
    const cvImagesContainer = document.getElementById('cv-images');
    const cvImagePaths = [
        'data/bio/cv/1.webp'
    ];

    cvImagePaths.forEach((path, index) => {
        allImages.push(path);
        const img = document.createElement('img');
        img.src = path;
        img.alt = `CV ${index + 1}`;
        img.className = 'cv-image fade-on-load';
        img.addEventListener('click', () => openBioLightbox(path));
        cvImagesContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
}

/** All lightbox-able image paths (cv + bio) collected at load time */
let allImages = [];
let currentIndex = 0;

/**
 * Load bio images from data/bio/me/ and make them clickable for lightbox.
 * Count is read from data.json contact.imageCount.
 */
function loadBioImages(count) {
    const bioImagesContainer = document.getElementById('bio-images');

    for (let i = 1; i <= count; i++) {
        const path = `data/bio/me/${i}.webp`;
        allImages.push(path);
        const img = document.createElement('img');
        img.src = path;
        img.alt = `Bio ${i}`;
        img.className = 'bio-me-image fade-on-load';
        img.addEventListener('click', () => openBioLightbox(path));
        bioImagesContainer.appendChild(img);
    }

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
}

// ---------------------------------------------------------------------------
// Bio lightbox with prev/next navigation
// ---------------------------------------------------------------------------

function createBioLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'bio-lightbox';
    lightbox.className = 'lightbox hidden';

    const img = document.createElement('img');
    img.id = 'bio-lightbox-image';
    img.alt = 'Bio';

    // Close button
    const closeBtn = document.createElement('img');
    closeBtn.src = 'data/assets/buttons/back.webp';
    closeBtn.alt = 'Close';
    closeBtn.className = 'lightbox-close interactive interactive--lg';
    closeBtn.addEventListener('click', closeBioLightbox);

    // Nav arrows
    const nav = document.createElement('div');
    nav.className = 'lightbox-nav';

    const prevBtn = document.createElement('img');
    prevBtn.src = 'data/assets/buttons/arrow_left.webp';
    prevBtn.alt = 'Previous';
    prevBtn.className = 'lightbox-btn interactive interactive--lg';
    prevBtn.addEventListener('click', () => navigateBioLightbox(-1));

    const nextBtn = document.createElement('img');
    nextBtn.src = 'data/assets/buttons/arrow_right.webp';
    nextBtn.alt = 'Next';
    nextBtn.className = 'lightbox-btn interactive interactive--lg';
    nextBtn.addEventListener('click', () => navigateBioLightbox(1));

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);

    lightbox.appendChild(img);
    lightbox.appendChild(closeBtn);
    lightbox.appendChild(nav);
    document.body.appendChild(lightbox);

    // Close on click outside
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'bio-lightbox') closeBioLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeBioLightbox();
        if (e.key === 'ArrowLeft') navigateBioLightbox(-1);
        if (e.key === 'ArrowRight') navigateBioLightbox(1);
    });

    return lightbox;
}

function openBioLightbox(imagePath) {
    let lightbox = document.getElementById('bio-lightbox');
    if (!lightbox) lightbox = createBioLightbox();

    currentIndex = allImages.indexOf(imagePath);
    document.getElementById('bio-lightbox-image').src = imagePath;
    updateBioLightboxButtons();
    lightbox.classList.remove('hidden');
}

function closeBioLightbox() {
    document.getElementById('bio-lightbox').classList.add('hidden');
}

function navigateBioLightbox(direction) {
    currentIndex = (currentIndex + direction + allImages.length) % allImages.length;
    document.getElementById('bio-lightbox-image').src = allImages[currentIndex];
    updateBioLightboxButtons();
}

/** Dim prev/next arrows at first/last image */
function updateBioLightboxButtons() {
    const lightbox = document.getElementById('bio-lightbox');
    const btns = lightbox.querySelectorAll('.lightbox-btn');
    btns[0].style.opacity = currentIndex === 0 ? '0.3' : '';
    btns[1].style.opacity = currentIndex === allImages.length - 1 ? '0.3' : '';
}

function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

window.addEventListener('DOMContentLoaded', init);
