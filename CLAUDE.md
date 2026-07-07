# Talent Expert — Project Constitution

Permanent design & motion system for the **Talent Expert** website (static multi‑page
site rooted here; 14 HTML pages + shared `css/` + `js/`). These rules are **immutable**
unless the project owner explicitly changes them.

**Before any UI or animation change, read this file AND [`docs/animation-system.md`](docs/animation-system.md).**
If a request conflicts with these files, say so and ask before overriding them. Do not
summarize, compact, rewrite, or "optimize away" these files. When context is compacted,
reload them before touching UI/animation.

---

## Animation stack — do not replace
- **GSAP 3 + ScrollTrigger** for all animation. **SplitType** for text splitting.
  MotionPathPlugin only if genuinely required. (SplitText only if licensed; default SplitType.)
- **Lenis** smooth scroll, synced to the GSAP ticker + `ScrollTrigger.update`
  (exact init in animation-system.md). Otherwise native scroll — **no wheel listeners,
  no manual scroll math**. Everything is ScrollTrigger‑driven from scroll progress.
- Self‑hosted vendors in `js/vendor/` (`gsap.min.js`, `ScrollTrigger.min.js`,
  `lenis.min.js`, `split-type.min.js`). **No CDN.**

## Scroll & pinned storytelling
- Every scroll animation is **scroll‑progress driven and fully reversible** (forward AND
  reverse). No one‑way animations.
- Desktop pinned sections: **Who We Are, Why Choose Us, Founder** (+ any future
  storytelling section). Each must pin with **no jump on start or end**, scrub smoothly,
  reverse perfectly, release naturally, with **no layout shift**. Mobile = non‑pinned equivalents.
- With Lenis, **do NOT use `anticipatePin`** (it repositions/jumps); use
  `invalidateOnRefresh`; pin content is centred/cleared below the fixed navbar.

## Animation language
- Target quality: **Apple / Stripe / Linear / Vercel / Framer / Awwwards** — elegant,
  minimal, premium, purposeful.
- Easings **only**: `power2.out`, `power3.out`, `power4.out`, `expo.out`, `expo.inOut`,
  `circ.out`, `sine.inOut`. **Never** bounce / elastic / back (unless imperceptibly subtle),
  no cartoon motion, no rotations beyond ~6°, no generic zoom‑in.

## Performance — hard rule
- Animate **only** `transform` (translate3d/scale), `opacity`, `filter` (light blur),
  `clip-path` (when needed), and CSS custom properties that feed those. **Never** animate
  `width/height/margin/padding/top/left/right/bottom`. Maintain **60fps**; use `will-change`
  on animated elements.
- **Never** put `mix-blend-mode`, or a **large `filter:blur()`** (roughly >16px on a big
  element), on an element that lives inside a **pinned/scrubbed** section or is itself
  animated — both force a full‑region repaint/re‑composite every frame and **froze low/mid
  GPUs** (regression on About → Vision&Mission, 2026‑07). Get softness from a
  `radial-gradient` (already soft) or a small blur on a **small** element; keep large decor
  static and low‑opacity. Static `mix-blend` far from motion (e.g. footer temple) is fine.

## Never remove existing animations
- When redesigning a section, **preserve every existing interaction and enhance it**.
  Never replace an interaction with a simpler one.

## Typography
- **No orphans**: never leave a lone dash, punctuation mark, or single word wrapping alone.
  Use `text-wrap:balance`, `&nbsp;` binding, and controlled max‑widths. Editorial quality always.

## Temple artwork (brand identity)
- The temple illustration is part of the site identity — **never remove it**. Never crop
  important architecture (tower/gopuram, tree, Nandi, steps). It is one environmental
  backdrop (`assets/illustrations/temple.png`; cream knocked out to transparent).

## Content
- **Home page content = the client's approved Section‑4 document is the single source of
  truth.** Do NOT invent/add/remove/reorder/merge/split sections or write marketing copy;
  only fix grammar/punctuation/spacing/typography. ("The Gap" and "Real Stories" were
  removed as undocumented — do not re‑add.) Mandated Home order: Nav · Hero · Trust Bar ·
  Who We Are · What We Do · Why Choose Us · Audience (Choose Your Path) · Founder ·
  Final CTA · Footer.

## Footer
- The footer is a **GLOBAL component** — identical markup on all 14 pages + shared CSS in
  `css/styles.css`. Never redesign it for a single page; changes propagate to all pages.

## Accessibility
- Respect `prefers-reduced-motion`: disable pinning, parallax, floating; fall back to a
  clean static page. `js/experience.js` already early‑returns to `revealAllStatic()`.

## Code quality (target direction)
- Organise animations by section; prefer reusable helpers over duplicated timelines. Use
  GSAP **`matchMedia`** (already in use) / **`context`** so triggers are killed & state reset
  on breakpoint change. Move new work toward per‑section `init*()` functions.

## Before marking any task done — verify
smooth scroll · reverse works · no layout shift · no pin jump · no clipping · no text overlap ·
typography clean · responsive · 60fps. Only then is it complete.
