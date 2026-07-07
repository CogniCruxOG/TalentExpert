# Talent Expert — Animation System (Motion Design Bible)

The technical companion to [`../CLAUDE.md`](../CLAUDE.md). This documents **how the motion
system is actually built** so it can be extended consistently. Keep it in sync when you
change animation code.

- **Home cinematic layer:** `js/experience.js` (loads only on `index.html`, alongside
  `css/experience.css`). Single IIFE, organised by section comment blocks.
- **Shared behaviour (all pages):** `js/main.js` + `css/styles.css`.
- **Vendors:** `js/vendor/{gsap.min.js, ScrollTrigger.min.js, lenis.min.js, split-type.min.js}`.
  Load order in HTML: gsap → ScrollTrigger → lenis → split-type → main.js → experience.js.

---

## 1. Scroll engine (the one true setup)

```
Lenis  →  gsap.ticker  →  ScrollTrigger  →  all animations
```

In `experience.js`, after `gsap.registerPlugin(ScrollTrigger)`:

```js
const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
document.documentElement.classList.add('lenis-on');
```

- `lerp: 0.12` = smooth **and** responsive. If the client says "laggy" → raise toward 0.15;
  "too raw" → lower toward 0.10. This is the single dial.
- CSS `.lenis.lenis-smooth{scroll-behavior:auto!important}` (in `experience.css`) stops native
  smooth‑scroll from fighting Lenis.
- **Reduced‑motion / no‑GSAP:** the whole IIFE early‑returns via
  `if (!hasGSAP || reduce) { revealAllStatic(); return; }` — so Lenis + all triggers are skipped
  and everything renders static & legible.

## 2. Easing & duration conventions
- Reveals: `power2.out` / `power3.out`, ~0.7–0.9s.
- Scrubbed timelines: `ease: 'none'` for linear scroll‑tracking; `sine.out`/`sine.inOut` for
  glow/scale ramps inside them.
- Parallax: `ease: 'none'`, `scrub`.
- **Never** bounce/elastic/back, no cartoon motion. See CLAUDE.md.

## 3. Pinned storytelling pattern (the template)

All three pinned sections follow the same shape — **desktop pins via `gsap.matchMedia`,
mobile is non‑pinned**, both fully reversible by `scrub`:

```js
const mm = gsap.matchMedia();
mm.add('(min-width:821px)', () => {
  arm();                                   // set the initial (ghosted/hidden) state
  const tl = gsap.timeline({ scrollTrigger: {
    trigger: '.section', start: 'top top', end: '+=' + DIST,
    pin: '.section-pin', invalidateOnRefresh: true, scrub: 0.5   // NO anticipatePin (Lenis)
  }});
  /* build the story with position params 0..1 */
  return () => { tl.scrollTrigger?.kill(); tl.kill(); arm(); };   // cleanup on breakpoint change
});
mm.add('(max-width:820px)', () => { showStatic(); /* light reveal */ return () => showStatic(); });
```

- **Pin geometry:** the `*-pin` element is `min-height:100vh` and centred (or top‑aligned)
  with top padding clearing the fixed navbar (`clamp(104–130px)`), so the heading/first row is
  never under the navbar. `start:'top top'` + no `anticipatePin` = seamless entry with Lenis.
- **Scrub 0.5** everywhere pinned (tight tracking; Lenis already smooths → avoids double‑smoothing
  and end‑of‑pin catch‑up). Backdrop parallax uses 0.6; hero parallax 0.5.

## 4. Section‑by‑section reference (Home)

Order = mandated Home order. Everything below lives in `experience.js` unless noted.

- **Hero** (`.x-hero`): kinetic headline (SplitType chars, `yPercent 116 → 0`, `power3.out`,
  stagger 0.018); eyebrow/sub/rhythm/CTAs fade‑up; temple backdrop fade‑in + ambient warm‑up
  (`--amb`, `--apex`); temple & content parallax (`scrub 0.5`); CTA idle float (`yoyo`, `sine.inOut`).
- **Trust Bar** (`#trust`, inside hero): **shake‑proof counters** (see §5), animate **once** on
  enter; temple apex glow blooms as milestones land. Floating **glass** stat cards.
- **Who We Are** (`.x-who` / pin `.x-who-pin`): **pinned continuous scrubbed timeline**
  (`buildWhoTL`). Paragraph N and Step N resolve together; connector fill `--cl` and icon glow
  `--ig` **interpolate** with scroll (one continuous stroke, not discrete). **Only the step content
  (text+icon) dims** to 0.7 when "done" — never the stage — so the connector stays uniformly bright.
- **What We Do** (`.x-do` / `#rail`): **not pinned**. Native `position:sticky` left index +
  scroll‑through card stack; JS focuses the card nearest viewport‑centre (`.focus`, rAF via
  `ScrollTrigger.onUpdate`), neighbours dim. Design is client‑approved — don't redesign.
- **Why Choose Us** (`.x-why` / pin `.x-why-pin`): **pinned scrub**, cards start hidden
  (`.pre`) and reveal 1→6 with a hero flourish (`.active`); **fully bidirectional** (scroll up
  hides 6→1); past the last card the grid completes; `HOLD` reserves the settle tail.
- **Choose Your Path** (`.x-path`): reveal (`gsap.from`, y/scale, `toggleActions:'play none none reverse'`)
  + **cursor spotlight** (`--mx/--my` via `[data-spotlight]`). Hover is **CSS‑only, rotation‑free**:
  lift, orange border glow, top accent line grows L→R, icon `scale 1→1.05`, CTA brighten+pulse,
  the non‑hovered card dims to 88%.
- **Founder** (`.x-founder`): **pinned scrub timeline**. Quote "inks in" word‑by‑word
  (SplitType words, opacity+tiny y); the italic phrase glows via `--eg` **after** its words land;
  then the signature panel builds sequentially (divider `--dl` grows, lines slide/fade). The `<em>`
  survives SplitType, so `--eg` (on the blockquote, inherited) applies. Doodle removed.
- **Final CTA** (`.x-finale`): fin‑card reveals + blob reveals (`toggleActions` reverse).
- **Footer** (global — see §7).

> Note: **Vision & Mission** is a section on **`about.html`**, not the Home page. If it ever
> becomes a pinned storytelling section, use the §3 template.

## 5. Reusable patterns
- **`reveal(els, opts)`** helper: `gsap.from` with `y:38, opacity:0, filter:'blur(7px)'`,
  `power2.out`, `start:'top 90%'`, `toggleActions:'play none none reverse'` (replays on scroll).
- **Shake‑proof counter:** markup `<span class="numw"><span class="ghost">2,000</span><span class="num" data-count="2000" data-comma>…</span></span>`.
  The hidden `.ghost` reserves the final width; the animating `.num` is absolutely positioned over
  it; both use `font-variant-numeric:tabular-nums`. Count runs **once** on enter → zero reflow.
- **Magnetic buttons:** `.btn.magnetic` in experience.js via `gsap.quickTo` (hero/nav CTAs);
  `main.js` handles only `.news-btn` (footer) to avoid double‑binding.
- **Tilt cards:** `[data-tilt]` (finale cards only) — subtle `rotationX/Y` via quickTo.
  **Do not** add tilt to `.x-path` (client asked for rotation‑free there).

## 6. CSS custom‑property registry (JS‑driven)
Animate these vars, not layout. Defaults are chosen so the **no‑JS/reduced‑motion fallback**
shows the complete state.

| Var | Set on | Drives | Fallback default |
|-----|--------|--------|------------------|
| `--amb`, `--apex`, `--tglow` | `#xTemple` | hero temple ambient / apex glow / drop‑glow | ambient shows |
| `--cl` | `.ddd-stage` | Who connector fill `scaleY` | `1` (full) |
| `--ig` | `.ddd-icon` | Who icon glow `::after` opacity | `0` |
| `--eg` | `.x-founder blockquote` | Founder italic brightness + text‑shadow | `0` (normal) |
| `--dl` | `.x-founder-sign` | Founder divider `scaleY` | `1` (full) |
| `--mx`, `--my` | `.x-path` | cursor spotlight position | centre |
| `--cx`, `--cy` | `.cursor-glow` (main.js) | site cursor glow position | centre |
| `--fx`, `--fy` | `footer.site` (main.js) | footer cursor glow position | centre |
| `--bar` | `.x-stat` | stat accent bar `scaleY` | `1` |

## 7. Footer (global) — `css/styles.css` + `js/main.js`
- Layout: 4 balanced columns (Brand&Contact · Quick Links · Business+Job stacked · Newsletter)
  via grid placement. Newsletter = the visual anchor (glass card).
- Reveal: `.reveal`→`.in` via an IntersectionObserver in `main.js` (with `.d1–.d5` stagger delays).
- Decor: warm radial glows + bridge line‑art SVG + **`.foot-temple`** (upper‑gopuram echo, bottom‑right,
  `mix-blend-mode:multiply`, ~11% — see CLAUDE.md temple rule). CSS `url()` is relative to the
  **stylesheet**, so use `../assets/…`.
- Global: edit once in `styles.css`/markup, propagate markup to **all 14** HTML files.

## 8. Verification checklist (before "done")
Smooth scroll · forward **and** reverse work · no layout shift · no pin jump (start or end) ·
no clipping · no text overlap · typography clean (no orphans) · responsive (mobile non‑pinned) ·
transforms/opacity/filter/vars only · reduced‑motion falls back cleanly · 60fps.

Verify visually with the headless recipe (Edge `--headless=new --screenshot`); force
`prefers-reduced-motion` or force `.reveal{opacity:1}` to capture settled states, since
`--virtual-time-budget` freezes GSAP mid‑animation. Prefer a state‑forced isolated preview over
guessing.
