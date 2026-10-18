# CYBORG / 01 — Beyond Human

An interactive, responsive cyborg-themed landing page built with **pure HTML, CSS and vanilla JavaScript** (no frameworks, no build step).
Made for **Techfest, IIT Bombay** — Student Ambassador project.

> Fictional speculative-design concept. All numbers and timelines are imaginary.

## Highlights
- **Boot sequence** on first load (skippable, shows once per session)
- **Custom crosshair cursor** (desktop only)
- **Photo portraits:** the same woman as a human and as an android (`assets/human.jpg`, `assets/android.jpg`), cropped and aligned so they line up exactly; hero portrait tilts with your cursor and has iris-scanner overlays
- **Glitch / scramble headline** on load and on hover
- **Scroll-linked hero** (head, orbits and copy move as you scroll) + scroll progress bar
- **Live HUD** values (neural link, core temp, latency)
- **Animated counters** and **live telemetry meters** on the system cards
- **3D tilt + spotlight** on the system cards, expandable capability panels
- **The Lab:** drag a slider (or the portrait) to reveal the android half of the same face; capability stats update live
- **Timeline 2026 → 2089** that fills as you scroll
- **Access form → generated ID card** (client-side demo, nothing is sent or stored)
- Responsive (desktop / tablet / mobile), keyboard accessible, `prefers-reduced-motion` supported

## Run locally
Open `index.html` in any modern browser. Keep `index.html`, `style.css` and `script.js` together.
Google Fonts load online; system fonts are the fallback.

## Deploy (GitHub Pages)
Repo → Settings → Pages → Deploy from branch → `main` / root.

## Structure
- `index.html` — markup and content
- `style.css` — design tokens in `:root`, section styles, responsive rules
- `script.js` — boot, scramble, cursor + tilt, scroll effects, lab slider, form
- `assets/` — the two aligned portrait photos
