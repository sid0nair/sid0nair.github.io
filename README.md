# Sid Nair — Portfolio

Static, multi-page personal site. No build step, no dependencies — just HTML, one CSS file, and one JS file.

## Structure
```
index.html        Home
research.html     Publications + research appointments
projects.html     Projects, grouped by domain
cv.html           Full CV + PDF download
assets/
  site.css        Shared styles (Dark Workstation theme)
  theme.js        Theme/accent/density panel, scroll-reveal, hero typing
  og-image.png    Social share preview (1200×630)
  Sidhant-Nair-CV.pdf
```

## Deploy to GitHub Pages
1. Create a new public repo (e.g. `sid0nair.github.io` for a user site, or any name for a project site).
2. Upload everything in this folder to the repo root (keep the `assets/` folder intact).
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Your site goes live at `https://<username>.github.io/` (user site) or `https://<username>.github.io/<repo>/` (project site) within a minute or two.

The included `.nojekyll` file tells GitHub Pages to serve the files as-is.

## One optional tweak after deploy
For the richest link previews on social platforms, set the social image to an absolute URL once you know your domain. In each `.html` file, change:
```html
<meta property="og:image" content="assets/og-image.png">
<meta name="twitter:image" content="assets/og-image.png">
```
to the full URL, e.g. `https://<username>.github.io/assets/og-image.png`.

## Other hosts
Works identically on Netlify, Vercel, Cloudflare Pages or any static host — just drop the folder in.
