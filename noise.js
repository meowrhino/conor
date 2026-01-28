// Generates a noise texture and applies it as a background layer on <body>,
// blended with the existing grid pattern via CSS background.
// This ensures the noise only affects the background, never the content.
function setupNoiseCanvas() {
    const size = 256; // tile size — small enough to be fast, big enough to avoid obvious repetition
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 40; // subtle alpha — controls noise intensity
    }
    ctx.putImageData(imageData, 0, 0);

    const noiseUrl = canvas.toDataURL('image/png');

    // Prepend the noise tile to the existing body background image.
    // The noise sits on top of blackGlitch.webp because it's listed first.
    document.body.style.backgroundImage =
        `url(${noiseUrl}), url('data/background/blackGlitch.webp')`;

    document.body.style.backgroundSize =
        `${size}px ${size}px, cover`;

    document.body.style.backgroundPosition =
        '0 0, center center';

    document.body.style.backgroundRepeat =
        'repeat, no-repeat';

    document.body.style.backgroundAttachment =
        'fixed, fixed';
}
