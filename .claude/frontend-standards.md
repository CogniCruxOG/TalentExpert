# Frontend Standards — Talent Expert

Static site, **no build step**. Write production-quality, readable code that matches the
existing idioms. Improve; don't rewrite unless necessary.

## Architecture
- Shared `css/styles.css` + `js/main.js` load on **every** page. Home additionally loads `css/experience.css` + `js/experience.js` + `js/vendor/*`.
- **Page scope** via `<body data-page="…" data-portal="…">`. Put page-specific CSS in a clearly-commented block at the **end** of `styles.css`, selector-scoped `body[data-page="X"] …` so it **cannot leak** to the other ~13 shared pages. *(This is a real, observed bug source — always scope.)*
- Prefer editing shared components over forking them; reuse tokens and classes.
- Keep page-specific JS tiny — inline near the end of the page, guarded by feature-detecting its target element. **No new libraries** without a strong, stated reason.

## HTML
- Semantic landmarks (`header/nav/main/section/footer`), one `<h1>` per page, logical heading order.
- Meaningful `alt`; `aria-hidden` on decorative layers/SVGs; label icon-only controls.
- Complete, accurate meta: `<title>`, description, Open Graph, canonical; JSON-LD where it helps SEO.

## CSS
- Custom properties + `clamp()` for fluid type/space; `grid`/`flex` for layout.
- **`url()` resolves relative to the stylesheet** → from `css/` use `../assets/…`.
- Mobile-first or clearly-bounded media queries; **redesign** per breakpoint, don't just resize.
- Respect `@media (prefers-reduced-motion: reduce)` wherever motion exists.
- Extend the shared reset/tokens — don't fight them.

## JavaScript
- Vanilla, modern, small. **Passive** listeners; throttle any scroll/resize work with `requestAnimationFrame`; avoid layout thrash (batch DOM reads, then writes).
- Feature-detect and no-op cleanly; guard `matchMedia('(prefers-reduced-motion: reduce)')` and coarse/touch pointers.
- **Nothing per scroll frame on inner pages** (→ `animation-guidelines.md`).

## Responsive
Desktop / laptop / tablet / mobile are all first-class. Verify reflow of nav, splits, cards,
roadmaps, and forms. Touch targets ≥ 44px. No horizontal overflow.

## Accessibility (mandatory)
Keyboard-navigable, visible `:focus-visible`, AA contrast, screen-reader-sane structure,
reduced-motion fallbacks. Forms: labels + clear error/success messaging.

## Performance
GPU-cheap motion only; optimize/knock-out images with Pillow; lazy-load below-fold media;
avoid layout shift; no unused libraries; a single promoted layer for the fixed watermark.
**Measure the felt result, not just the code.**

## Verify before saying "done" (headless Edge)
Render and **look** — don't assume a change worked.
- Binary (Windows): `msedge.exe --headless=new --disable-gpu --hide-scrollbars --window-size=W,H --default-background-color=ffffffff --screenshot=OUT URL`
- Reveal/scroll states don't fire statically → in a **throwaway copy**, force end-states with an injected `<style>`: `.reveal{opacity:1!important;transform:none!important}` (plus any SVG-interaction end state). Delete the copy afterward.
- **Full-page shot:** the fixed watermark tints everything below the footer, so white-trimming fails — instead detect the footer's **dark band** to find the true page bottom. (Beware `vh`-based heights inflating when you render at a tall window.)
- Always check: settled state, a mid state, a mobile width, and that text stays **readable** over the watermark.
- Serve locally with `python -m http.server 8000` and hard-refresh (Ctrl+Shift+R) to bust cached CSS/JS.
