# Laila Shariff — portfolio

Static site. No build step, no dependencies.

## Structure

```
index.html            Home (hero + Selected Work)
about.html            About
playground.html       Playground (ring + 7 projects)
purple-fabric.html    Case study
sayplay.html          Case study
nutrihealth.html      Case study
NutriHealth phone.dc.html   Live phone screens used by index + nutrihealth
support.js            Runtime required by every page
theme.js / theme.css  Light/dark toggle + shared theme rules
responsive.css        Shared responsive rules
dot-cursor.js         Star cursor (fine pointers only)
assets/               All images, videos and the book PDF
vercel.json           Cache headers + clean URLs
```

## Deploying

Vercel serves this as static output — no framework preset, no build command,
output directory is the repo root. Every page is a real `.html` file, so direct
URLs and refreshes resolve without rewrites.

## Notes

- `support.js` must stay at the root; all six pages load it.
- `NutriHealth phone.dc.html` must stay at the root — `index.html` and
  `nutrihealth.html` load it at runtime for the live phone screens.
- Theme choice persists in `localStorage` under one key shared by all pages.
- Asset paths are relative (`assets/…`), so the site also opens from the file system.
