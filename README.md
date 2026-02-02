# Zung‑Ru Lin — personal site (single page, tabbed)

A simple, high-quality **single-page** site with three tabbed sections:
- **Overview** — what the page is about
- **Deployments** — example applications + selected papers
- **Links** — contact + code + writing

Everything lives in `index.html` (tabs just switch panels; no framework).

## Edit content
Open `index.html` and update text/links as you like.

Key places:
- Header: name + subtitle
- Overview hero: 2–4 sentences (keep it tool-forward)
- Deployments: swap items / links
- Links: email / GitHub / Hugging Face / LinkedIn

## Images
- `assets/images/profile.webp` is a small headshot used for credibility.
- `assets/images/stickers/` contains a few subtle, original “cute” icons (coffee/avocado/buddy).

## Included PDFs
The site includes **preview-only PDFs** under `assets/papers/` (first ~2 pages each) so you can share a safe preview without redistributing full drafts.

If you have a public version (OSF/arXiv/journal), link to it from the paper row and keep the local file as the short preview.

## Run locally
From *inside* the `personal_site` folder:

```bash
python3 -m http.server 8080
```

Then open:
- `http://localhost:8080`

On macOS:

```bash
open http://localhost:8080
```

### Stop the server
Use **Ctrl+C** (not Ctrl+Z).

If you see `OSError: [Errno 48] Address already in use`, something is still running on that port.
Try either:
- pick a different port (e.g. `python3 -m http.server 8000`)
- or find/kill the process on 8080:

```bash
lsof -i :8080
kill -9 <PID>
```

## Deploy
- **GitHub Pages** (recommended if you already use GitHub): commit and enable Pages for the repo.
- **Cloudflare Pages / Netlify / Vercel**: connect the repo and auto-deploy on every push.

For a static HTML site like this, all four options work well. If you want the simplest free default, use GitHub Pages.
