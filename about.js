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

// Setup event listeners
function setupEventListeners() {
    document.querySelector('.btn-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
