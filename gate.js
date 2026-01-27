/**
 * gate.js — Mobile device gate
 *
 * Blocks access on mobile/touch devices by showing a full-screen overlay.
 * Detection uses viewport width (<768px) and pointer type (coarse = touch).
 * The overlay HTML lives in each page; this script just toggles visibility.
 */
(function () {
  const overlay = document.getElementById("device-check-overlay");
  const msg = document.getElementById("device-check-message");
  const why = document.getElementById("mobile-check-why-link");
  const expl = document.getElementById("mobile-check-explanation");

  if (!overlay || !msg || !why || !expl) return;

  const isMobileish =
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  if (!isMobileish) return;

  msg.textContent =
    "oh no, you are using a phone :( you need a larger device, like a laptop with chrome in order to enter this page";

  overlay.classList.remove("hidden");
  why.classList.remove("hidden");

  why.addEventListener("click", (e) => {
    e.preventDefault();
    expl.classList.toggle("hidden");
  });
})();
