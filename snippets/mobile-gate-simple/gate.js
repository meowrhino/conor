/**
 * Mobile gate demo
 * - Shows a full-screen overlay only on mobile-ish environments.
 * - The overlay content exists in HTML, and we toggle visibility by removing/adding the `.hidden` class.
 */

(function () {
  const overlay = document.getElementById("device-check-overlay");
  const msg = document.getElementById("device-check-message");
  const why = document.getElementById("mobile-check-why-link");
  const expl = document.getElementById("mobile-check-explanation");

  if (!overlay || !msg || !why || !expl) return;

  // Practical "mobile-ish" detection:
  // - small viewport OR coarse pointer (touch-first devices)
  const isMobileish =
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  if (!isMobileish) return;

  msg.textContent =
    "oh no, you are using a phone :( you need a larger device, like a laptop with chrome in order to enter this page";

  // Show overlay
  overlay.classList.remove("hidden");

  // Enable "Why?"
  why.classList.remove("hidden");
  requestAnimationFrame(() => why.classList.add("show"));

  why.addEventListener("click", (e) => {
    e.preventDefault();
    expl.classList.toggle("hidden");
    expl.classList.toggle("show");
  });
})();
