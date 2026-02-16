/**
 * gate.js — Mobile device gate
 *
 * Blocks access on mobile/touch devices by showing a full-screen overlay
 * with a single image (data/assets/phone/phone.webp).
 * Click the image to expand it; click outside to collapse back.
 * Detection uses viewport width (<768px) and pointer type (coarse = touch).
 * Re-checks on window resize (debounced 300ms).
 */
(function () {
  const overlay = document.getElementById("device-check-overlay");
  const img = document.getElementById("gate-phone-img");

  if (!overlay || !img) return;

  function isMobileish() {
    return (
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    );
  }

  function update() {
    if (isMobileish()) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      overlay.classList.remove("gate-expanded");
    }
  }

  // Initial check
  update();

  // Re-check on resize (debounced 300ms)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 300);
  });

  // Click image → expand
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    overlay.classList.add("gate-expanded");
  });

  // Click outside image → collapse
  overlay.addEventListener("click", (e) => {
    if (e.target !== img && overlay.classList.contains("gate-expanded")) {
      overlay.classList.remove("gate-expanded");
    }
  });
})();
