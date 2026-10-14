# Zung-Ru Lin — personal website

A small, static portfolio with three tabs: **Work**, **Research**, and **About**. Built with HTML, CSS, and vanilla JavaScript; no package installation or build step.

Production: https://personal-web-or2.pages.dev

## Edit

- `index.html`: introduction, tool links, six featured research projects, three collaborations, and contact details.
- `assets/css/style.css`: typography, colors, and responsive layouts.
- `assets/js/main.js`: tab navigation, reading-size preferences, motion, browser history, keyboard controls, and email copying.
- `assets/images/personal/`: original drink illustrations, with earlier personal motifs retained.

- `assets/images/projects/`: civic, foreign-influence, and environmental illustrations.
- `assets/images/research/`: conceptual method previews; these are not plots of research results.
- `assets/images/penn-speaking.jpg` and `penn-grad.jpg`: web photos; crop positioning is set in CSS. Original HEIC source files stay local.

Keep unpublished research labeled as ongoing or in preparation. The dashboard measures describe collected news coverage. Local PDFs are short manuscript excerpts; link to public papers or repositories when available.

## Preview

From this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080 and stop the server with Ctrl+C.

Check Work, Research, and About at desktop and phone widths. Navigation supports arrows, Home, End, Enter, and Space; browser back/forward restores the selected tab. Existing `#overview`, `#deployments`, and `#links` links continue to work. Without JavaScript, all sections remain readable and anchor navigation works.

The header’s **Aa** control enlarges text from 100% to 125% and remembers the choice locally. Reset restores the default; Escape closes the panel and returns focus to its button.

The headline rotates gently while Work is visible. Research topic links scroll to a card and briefly highlight it. The About code panel types once when it enters view, with its full text available to assistive technology and its height reserved to avoid layout jumps. Visitors can pause motion, and these effects respect reduced-motion preferences.

## Deploy

The GitHub `main` branch is connected to the existing **Cloudflare Pages** project. Push changes to publish automatically, then verify the Cloudflare Pages check on that commit. Serve the repository root; no build command is needed.

Local PDFs and earlier illustrations remain available at their existing paths.
