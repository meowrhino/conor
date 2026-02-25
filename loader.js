/**
 * loader.js — Progressive image loading with fade-in effect
 *
 * Usage: Add class "fade-on-load" to any <img> element.
 * Images start invisible and fade in when loaded.
 *
 * Include this script in any page that needs progressive loading.
 */

(function() {
    // CSS for fade effect (injected once)
    const style = document.createElement('style');
    style.textContent = `
        .fade-on-load {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .fade-on-load.loaded {
            opacity: 0.85;
        }
        .fade-on-load.loaded:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Setup fade-in for all images with the class
    function setupFadeOnLoad() {
        const images = document.querySelectorAll('.fade-on-load');

        images.forEach(img => {
            // If image is already loaded (cached), show immediately
            // Check this first, even for already-processed images (handles hidden->visible)
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('loaded');
            }

            // Skip adding listeners if already processed
            if (img.dataset.fadeSetup) return;
            img.dataset.fadeSetup = 'true';

            // Fade in when loaded
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });

            // Also handle error (show anyway)
            img.addEventListener('error', () => {
                img.classList.add('loaded');
            });
        });
    }

    // Keep canonical and og:url aligned with the real runtime URL.
    function syncSeoUrl() {
        const currentUrl = window.location.origin + window.location.pathname + window.location.search;
        const canonical = document.querySelector('link[rel="canonical"]');
        const ogUrl = document.querySelector('meta[property="og:url"]');

        if (canonical) canonical.href = currentUrl;
        if (ogUrl) ogUrl.content = currentUrl;
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupFadeOnLoad();
            syncSeoUrl();
        });
    } else {
        setupFadeOnLoad();
        syncSeoUrl();
    }

    // Expose for dynamic content
    window.setupFadeOnLoad = setupFadeOnLoad;
})();
