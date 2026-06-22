# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deploy

Every push to `main` triggers a GitHub Actions FTP deploy to `/public_html/` on unityhaus.ca. There is no build step — files are uploaded as-is.

To deploy: commit the changed files and push to `main`. Verify with:
```
gh run list --limit 3
```

The deploy typically completes in ~10 seconds. Preview files (e.g. `preview-*.html`, `tagline-*.png`) are also uploaded — delete them before pushing if they shouldn't go live.

## Architecture

**`index.html`** is the entire main site. All CSS lives in an inline `<style>` block — there is no external stylesheet in use. The design system uses CSS custom properties defined in `:root` (green/cream palette, DM Serif Display + DM Sans fonts).

**`style.css` and `script.js`** are legacy files from an older dark-theme version of the site. They are not loaded by the current `index.html`.

**`blog/`** is a separate Astro project (gitignored). It deploys independently to blog.unityhaus.ca via Netlify. Republishing = commit + push inside that repo. Astro 6.x requires `NODE_VERSION = "22"` in `netlify.toml`.

## Favicon generation

ImageMagick (`magick`/`convert`) is not installed. Use Pillow:
```python
from PIL import Image
src = Image.open("logo-source.png").convert("RGBA")
src.resize((180, 180), Image.LANCZOS).save("apple-touch-icon.png")
src.resize((32, 32), Image.LANCZOS).save("favicon-32.png")
frames = [src.resize(s, Image.LANCZOS) for s in [(16,16),(32,32),(48,48)]]
frames[0].save("favicon.ico", format="ICO", sizes=[(16,16),(32,32),(48,48)], append_images=frames[1:])
```

## Local preview

Use an HTTP server — `file://` blocks fonts and fetch:
```
python3 -m http.server 8899
```
Then open `http://localhost:8899/index.html`.
