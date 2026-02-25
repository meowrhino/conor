/**
 * about.js — About page logic for about.html
 *
 * Loads contact info from data.json and wires up:
 *   - Email link (mailto:)
 *   - Phone copy-to-clipboard (with fallback for older browsers)
 *   - Home button navigation
 */

async function init() {
    let appData;
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        appData = await response.json();
    } catch (error) {
        console.error('[about.js] Failed to load data/data.json. Using fallback contact values.', error);
        appData = { contact: {} };
    }

    // Wire up contact links from data.json
    const emailLink = document.getElementById('email-link');
    const phoneCopy = document.getElementById('phone-copy');
    const instagramLink = document.getElementById('instagram-link');
    const phoneNumber = appData.contact.phone || '';

    if (appData.contact.email) {
        emailLink.href = `mailto:${appData.contact.email}`;
    } else {
        console.warn('[about.js] Missing contact.email in data.json');
    }

    if (appData.contact.instagram) {
        instagramLink.href = `https://www.instagram.com/${appData.contact.instagram}/`;
        instagramLink.target = '_blank';
        instagramLink.rel = 'noopener noreferrer';
    } else {
        console.warn('[about.js] Missing contact.instagram in data.json');
    }

    // Copy phone number to clipboard on click
    phoneCopy.addEventListener('click', async () => {
        if (!phoneNumber) {
            console.warn('[about.js] Missing contact.phone in data.json');
            return;
        }
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

    const aboutConfig = appData.about || {};
    const mainBioImage = aboutConfig.mainBioImage || 'data/bio/bio.webp';
    const cvImages = Array.isArray(aboutConfig.cvImages) && aboutConfig.cvImages.length
        ? aboutConfig.cvImages
        : ['data/bio/cv/1.webp'];
    const bioGalleryBasePath = aboutConfig.bioGalleryBasePath || 'data/bio/me';
    const bioImageCount = Number.isInteger(aboutConfig.bioImageCount)
        ? aboutConfig.bioImageCount
        : (appData.contact.imageCount || 0);

    setupNoiseCanvas();
    loadCvImages(mainBioImage, cvImages);
    loadBioImages(bioImageCount, bioGalleryBasePath);
    setupBioDragScroll();
    setupEventListeners();
}

/**
 * Load profile set (main bio + CV images) and wire them to one shared lightbox set.
 */
function loadCvImages(mainBioPath, cvImagePaths) {
    const cvImagesContainer = document.getElementById('cv-images');
    profileImages = [mainBioPath, ...cvImagePaths];

    const mainBioImage = document.querySelector('.bio-image');
    if (mainBioImage) {
        mainBioImage.src = mainBioPath;
        mainBioImage.style.cursor = 'pointer';
        mainBioImage.addEventListener('click', () => openBioLightbox(mainBioPath, profileImages));
    }

    cvImagePaths.forEach((path, index) => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = `CV ${index + 1}`;
        img.className = 'cv-image fade-on-load';
        img.addEventListener('click', () => openBioLightbox(path, profileImages));
        cvImagesContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
}

/** Separate sets so profile (bio+cv) and bio-strip do not mix in navigation */
let profileImages = [];
let bioImages = [];
let currentImageSet = [];
let currentIndex = 0;

/**
 * Load bio images from data/bio/me/ and make them clickable for lightbox.
 * Count/path are read from data.json about config (with legacy fallback).
 */
function loadBioImages(count, basePath) {
    const bioImagesContainer = document.getElementById('bio-images');
    bioImages = [];
    const normalizedBasePath = String(basePath || '').replace(/\/+$/, '');
    if (!normalizedBasePath) return;

    for (let i = 1; i <= count; i++) {
        const path = `${normalizedBasePath}/${i}.webp`;
        bioImages.push(path);
        const img = document.createElement('img');
        img.src = path;
        img.alt = `Bio ${i}`;
        img.className = 'bio-me-image fade-on-load';
        img.addEventListener('click', () => openBioLightbox(path, bioImages));
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

function openBioLightbox(imagePath, imageSet) {
    let lightbox = document.getElementById('bio-lightbox');
    if (!lightbox) lightbox = createBioLightbox();

    currentImageSet = Array.isArray(imageSet) ? imageSet : [];
    currentIndex = currentImageSet.indexOf(imagePath);
    if (currentIndex < 0) currentIndex = 0;
    document.getElementById('bio-lightbox-image').src = imagePath;
    updateBioLightboxButtons();
    lightbox.classList.remove('hidden');
}

function closeBioLightbox() {
    document.getElementById('bio-lightbox').classList.add('hidden');
}

function navigateBioLightbox(direction) {
    if (!currentImageSet.length) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= currentImageSet.length) return;
    currentIndex = nextIndex;
    document.getElementById('bio-lightbox-image').src = currentImageSet[currentIndex];
    updateBioLightboxButtons();
}

/** Hide prev/next arrows at first/last image */
function updateBioLightboxButtons() {
    const lightbox = document.getElementById('bio-lightbox');
    if (!lightbox) return;
    const btns = lightbox.querySelectorAll('.lightbox-btn');
    if (btns.length < 2) return;

    const lastIndex = currentImageSet.length - 1;
    const hideBoth = currentImageSet.length <= 1;
    if (hideBoth) {
        btns[0].classList.add('lightbox-btn--hidden');
        btns[1].classList.add('lightbox-btn--hidden');
        return;
    }

    btns[0].classList.toggle('lightbox-btn--hidden', currentIndex === 0);
    btns[1].classList.toggle('lightbox-btn--hidden', currentIndex === lastIndex);
}

// ---------------------------------------------------------------------------
// Bio strip drag scroll (mouse/touch)
// ---------------------------------------------------------------------------

function setupBioDragScroll() {
    const container = document.querySelector('.bio-images-container');
    if (!container || container.dataset.dragReady === 'true') return;
    container.dataset.dragReady = 'true';

    let pointerDown = false;
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;
    let suppressClick = false;
    const dragThreshold = 6;

    function endDrag() {
        if (!pointerDown) return;
        pointerDown = false;
        if (pointerId !== null && container.releasePointerCapture) {
            try {
                container.releasePointerCapture(pointerId);
            } catch {
                // Ignore release errors when pointer was not captured.
            }
        }
        pointerId = null;
        suppressClick = dragged;
        dragged = false;
        container.classList.remove('is-dragging', 'is-grabbing');
    }

    container.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch' && e.button !== 0) return;
        pointerDown = true;
        pointerId = e.pointerId;
        startX = e.clientX;
        startScrollLeft = container.scrollLeft;
        dragged = false;
        container.classList.add('is-grabbing');

        if (container.setPointerCapture) {
            try {
                container.setPointerCapture(pointerId);
            } catch {
                // Ignore capture errors in unsupported cases.
            }
        }
    });

    container.addEventListener('pointermove', (e) => {
        if (!pointerDown) return;

        const deltaX = e.clientX - startX;
        if (!dragged && Math.abs(deltaX) > dragThreshold) {
            dragged = true;
            container.classList.add('is-dragging');
        }

        if (!dragged) return;
        container.scrollLeft = startScrollLeft - deltaX;
        e.preventDefault();
    });

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);

    container.addEventListener('pointerleave', (e) => {
        // Mouse can leave the strip while released outside.
        if (pointerDown && e.pointerType === 'mouse' && (e.buttons & 1) === 0) {
            endDrag();
        }
    });

    // Prevent opening lightbox when drag ended as a click.
    container.addEventListener('click', (e) => {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
    }, true);
}

function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

window.addEventListener('DOMContentLoaded', init);
