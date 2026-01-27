// Initialize app
async function init() {
    const response = await fetch('data/data.json');
    const appData = await response.json();
    
    // Populate contact info
    const emailLink = document.getElementById('email-link');
    const phoneCopy = document.getElementById('phone-copy');
    const phoneNumber = appData.contact.phone;

    emailLink.href = `mailto:${appData.contact.email}`;

    phoneCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(phoneNumber);
        } catch (error) {
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

// Setup event listeners
function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
