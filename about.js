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
    loadBioImages();
    setupEventListeners();
}

/**
 * Load CV images from data/bio/cv/ and make them clickable for lightbox
 */
function loadCvImages() {
    const cvImagesContainer = document.getElementById('cv-images');
    const cvImagePaths = [
        'data/bio/cv/1.webp',
        'data/bio/cv/2.webp',
        'data/bio/cv/3.webp',
        'data/bio/cv/4.webp'
    ];

    cvImagePaths.forEach((path, index) => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = `CV ${index + 1}`;
        img.className = 'cv-image fade-on-load';
        img.addEventListener('click', () => openBioLightbox(path));
        cvImagesContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
}

/**
 * Load bio images from data/bio/me/ and make them clickable for lightbox
 */
function loadBioImages() {
    const bioImagesContainer = document.getElementById('bio-images');
    const bioImagePaths = ['data/bio/me/1.webp', 'data/bio/me/2.webp'];

    bioImagePaths.forEach((path, index) => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = `Bio ${index + 1}`;
        img.className = 'bio-me-image fade-on-load';
        img.addEventListener('click', () => openBioLightbox(path));
        bioImagesContainer.appendChild(img);
    });

    if (window.setupFadeOnLoad) window.setupFadeOnLoad();
}

/**
 * Open lightbox for bio images
 */
function openBioLightbox(imagePath) {
    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('bio-lightbox');
    
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'bio-lightbox';
        lightbox.className = 'lightbox hidden';
        
        const img = document.createElement('img');
        img.id = 'bio-lightbox-image';
        img.alt = 'Bio';
        
        const closeBtn = document.createElement('img');
        closeBtn.src = 'data/assets/buttons/back.webp';
        closeBtn.alt = 'Close';
        closeBtn.className = 'lightbox-close interactive interactive--lg';
        closeBtn.addEventListener('click', closeBioLightbox);
        
        lightbox.appendChild(img);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        
        // Close on click outside
        lightbox.addEventListener('click', (e) => {
            if (e.target.id === 'bio-lightbox') closeBioLightbox();
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
                closeBioLightbox();
            }
        });
    }
    
    document.getElementById('bio-lightbox-image').src = imagePath;
    lightbox.classList.remove('hidden');
}

function closeBioLightbox() {
    document.getElementById('bio-lightbox').classList.add('hidden');
}

function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

window.addEventListener('DOMContentLoaded', init);
