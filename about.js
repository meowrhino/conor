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
    const phoneNumber = appData.contact.phone;

    emailLink.href = `mailto:${appData.contact.email}`;

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
    setupEventListeners();
}

function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

window.addEventListener('DOMContentLoaded', init);
