# Hero Section Transfer — Laila Shariff Portfolio

Scope: HERO ONLY (top nav, LS mark, headline, subhead, current-work line,
dithered shooting-star artwork, light/dark theme toggle). Nothing from
Selected Work or below is included in this package.

## Files
- hero.html        Hero markup fragment (drop-in)
- hero.css         All hero-specific + responsive styles
- theme-toggle.js  Light/dark toggle logic (persists to localStorage)

## Integration steps
1. Add the Newsreader font link (see comment at top of hero.css) to your
   page's <head> if not already loaded.
2. Paste the contents of hero.css into your stylesheet, or link it directly.
3. Paste hero.html at the TOP of your page body, directly above your
   existing Selected Work section markup. Do not alter Selected Work.
4. Load theme-toggle.js after hero.html appears in the DOM (a plain
   <script src="theme-toggle.js"></script> right after the hero markup,
   or before </body>).
5. If your page already uses the class/id names `ls-hero`, `top`,
   `ls-theme-toggle`, or `dstar-head`/`dstar-launch`, rename them in all
   three files to avoid collisions with existing styles.

## Notes on fidelity
- The star artwork is copied byte-for-byte from the live homepage: same
  ~240 dot positions, sizes, per-dot flicker/drift timing, and the
  rust / cream / dusty-blue / ink color distribution, including the
  fading comet tail.
- Only the star's head (the 5-point sparkle shape) pulses/expands on a
  loop — the trailing dots stay fixed, matching the current build.
- The theme toggle uses the same localStorage key (`ls-theme`) as the
  full homepage, so if this hero is deployed on the same domain/path as
  the original, the user's saved preference will carry over.
- The star and monogram SVGs use `var(--ink, ...)` / `var(--bg, ...)`
  fills (the literal token names from the source file). hero.css defines
  both those and the renamed `--ls-ink`/`--ls-bg` tokens on
  `[data-theme="light"]`/`[data-theme="dark"]` — don't drop either set
  when adapting to your naming, or dark mode will silently fall back to
  the light-mode literals.
  can be tuned without touching the SVG: `--star-pulse-scale` (default
  1.16) and `--star-pulse-speed` (default 5.5s) — set on the
  `.dstar-launch` element in hero.html.
- Not included: the cursor sparkle trail (a page-wide pointer effect on
  the original homepage, not scoped to the hero) and an unused mobile
  hamburger-menu CSS block that exists in the source but isn't wired to
  any markup there. Ask if you'd like either added to this package.
