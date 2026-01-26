# Mobile Gate (Simple) — ZIP 1

This folder is a **minimal, clean reproduction** of the “mobile-only message” pattern you saw on kernjosh.com.

## What it does
- The “gate” is **in the HTML** (so it can load instantly).
- It starts hidden via a `.hidden` class.
- `gate.js` decides whether the visitor is on a **mobile-ish** device, and if so it:
  - fills the message text,
  - removes `.hidden` from the overlay,
  - enables a **Why?** link that toggles an explanation block.

## Files
- `index.html` — markup for the overlay + normal site content
- `style.css` — full-screen overlay styles + `.hidden` rules
- `gate.js` — detection + show/hide logic
- `README.md` — this explanation

## How to run
Just open `index.html` in a browser.

To simulate mobile:
- shrink the window under 768px, or
- use a phone / responsive device mode in devtools.

## Key idea
The overlay is always present, but the UI state is controlled by **toggling classes**.
