# Spotify Monthly Recap — Transfer Package

## Project
Spotify Monthly Recap ("Chapters") — a concept feature turning listening history into visual monthly music diaries: users pick meaningful tracks, pair them with camera-roll photos, add captions, and generate a shareable "Chapter." Includes a "Run It Back" full-screen playback takeover and a Year in Chapters year-end view.

## Project Type
Independent product-design concept / interactive HTML prototype (not a compiled app).

## Purpose of Export
Transfer from a work Claude account to a personal Claude account, for integration into an existing personal portfolio as a case study.

## IMPORTANT — Actual framework used (correction)
This project is NOT a React/Node/build-tooled codebase. There is no package.json, no node_modules, no bundler, and nothing to "npm install" or build. It was authored as self-contained interactive HTML files ("Design Components") with:
- Markup as plain HTML
- All styling as inline CSS (style attributes) — no external stylesheets
- Interaction/state logic as a small embedded JS class per file (click handlers, screen navigation, modals, tab switching)
- A shared runtime helper, support.js, that the source .dc.html files load to render

There is no install step and no build step. Every file in this package opens directly in a browser (double-click / drag into a browser tab) and is immediately interactive.

## Entry Points
- Desktop: source/Spotify Chapters.dc.html (fully interactive desktop experience, needs support.js alongside it)
- Mobile: source/Spotify Chapters Mobile.dc.html (fully interactive mobile experience, needs support.js alongside it)
- Standalone versions (recommended for portability): standalone/Spotify Chapters (Standalone).html and standalone/Spotify Chapters Mobile (Standalone).html — fully self-contained single files with all CSS, JS, fonts, and images inlined/base64-embedded. No dependencies, no asset folder needed, no support.js needed. Open directly in any browser. These are the safest files to hand to another tool/environment.

## Project Structure
- source/ — original editable source files
  - Spotify Chapters.dc.html — desktop app (all screens, nav, interactions)
  - Spotify Chapters Mobile.dc.html — mobile app (bottom tabs, Story feature, shelves)
  - support.js — shared runtime the .dc.html files depend on
- standalone/ — self-contained, portable single-file bundles
  - Spotify Chapters (Standalone).html — desktop, all assets inlined
  - Spotify Chapters Mobile (Standalone).html — mobile, all assets inlined
- assets/ — locally packaged visual assets referenced by source files
  - album-art/ — real album artwork used throughout
  - photos/ — candid lifestyle/camera-roll style photos used in pairing flows
  - profile-photo.jpg — user profile photo used in both versions
  - spotify-logo.webp — logo asset
- TRANSFER_README.md — this file

## Mobile Implementation
source/Spotify Chapters Mobile.dc.html. Contains: bottom tab bar navigation, single-column layouts, bottom-sheet photo/song pairing modal, an Instagram Story-style full-screen photo clickthrough with background music, and Spotify-style home shelves (Jump Back In, Top Artists, Made For You) using the album art in assets/album-art/.

## Desktop Implementation
source/Spotify Chapters.dc.html. Contains: expanded left sidebar library (Liked Songs, artists, playlists) matching Spotify's real layout, all app screens (Home, Recap, Overview, Song Select, Photo Select + pairing modal, Chapter Complete, Song Memory, Archive, Year in Chapters, full-screen Run It Back takeover), free click-navigation between all of them.

## Assets
assets/ — album covers, camera-roll-style photographs, profile photo, and the Spotify logo. All referenced by relative path from the source files. The standalone HTML bundles have these same images inlined as base64 data URIs, so they need no external asset folder at all.

## Animations & Interactions
All interaction logic (screen navigation, modal open/close, tab switching, hover/click states, the Run It Back playback takeover, Story clickthrough advance/tap zones) lives inline in the two .dc.html files above — there is no separate animation or interaction library/file.

## Dependencies
None to install. The source files reference support.js (included) as a runtime loader/renderer. No other external packages are required. (The standalone bundles have even this inlined.)

## Running the Project
No install or build step exists or is required.
- Standalone files: double-click, or drag into any browser tab.
- Source .dc.html files: open in a browser with support.js in the same folder (or view them inside a Claude Design project, which is the environment they were authored in).

## Production Build
Not applicable — there is no build step. The standalone HTML files in standalone/ ARE the production-ready deliverable: single self-contained files, ready to embed or link to as-is.

## Integration Note
> This project is being transferred into an existing personal portfolio website. The receiving Claude instance should NOT replace or rebuild the existing portfolio. It should use this project as source material for a new Spotify Monthly Recap case-study page, preserving the existing portfolio's global navigation, design system, typography, responsive framework, light/dark mode, footer, and interaction patterns.

Practical suggestion for the receiving Claude: the most reliable way to reproduce these screens inside another site is to embed the standalone HTML files (e.g. in an iframe, or as linked full-screen demo pages) rather than trying to port the inline-styled markup into the portfolio's own component system. The source .dc.html files are provided so the receiving Claude can also read the actual markup/logic and re-implement specific screens natively in the portfolio's own framework if that's what's wanted.
