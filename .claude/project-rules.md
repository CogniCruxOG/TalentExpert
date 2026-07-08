# Project Rules & Lessons — Talent Expert

## Content governance (STRICT — client-mandated)
- The client's approved **Home "Section 4" document is the single source of truth** for Home content.
- **Do NOT** invent, add, remove, rename, reorder, merge, or split sections. Do NOT write new marketing copy, stats, CTAs, testimonials, or feature blocks.
- You **may** fix grammar, punctuation, spacing, and typography; and you have **full freedom** over design, layout, motion, and interaction — *"direct the movie, don't rewrite the script."*
- **Footer is a global exception** — keep the approved premium footer; change it only if asked.
- Confirmed facts: **500+ businesses · 2,000+ placements · 316 taluks · 25+ years** ("Years of HR Expertise"). Forms use **Formspree** (placeholder `YOUR_FORM_ID` until the client provides the real ID).
- Decisions log: `docs/CONTENT-NOTES.md`. Where the Blueprint and the Corrections doc differ, **Corrections wins**.

## Brand (STRICT)
Orange `#F26F21` · Charcoal `#1A1A1A` · Grey `#8C8C8C` (+ soft/tints). **NO navy, NO green.** Use `:root` tokens (→ `design-system.md`).

## Illustration / asset rules
- Use the client's **EXACT** artwork. **Never** redraw, trace, recolor, or crop the composition.
- To make a watermark/backdrop: knock the cream/paper background out to transparency with **Pillow**, preserving the original ink by line-darkness alpha. Save under `assets/illustrations/`.
- Current assets: `temple.png` (Thanjavur gopuram — Home hero/footer), `story-journey.png` (rural→city journey) + `story-journey-soft.png` (warm-taupe watermark used on the About page).

## Git
- Client's solo repo, branch **`main`** (`github.com/CogniCruxOG/TalentExpert`). Commit **and** push only when the client asks (their established flow is commit → push to `main`).
- End commit messages with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Editing discipline (from the master brief)
Before changing a section: **(1)** understand it, **(2)** name its UX / visual / interaction
weaknesses, **(3)** propose the best improvement, **(4)** implement only that. Preserve working
functionality, responsiveness, a11y, and existing (Home) animations. Improve; don't rewrite
unless necessary. Think like an award-winning designer — **but RULE #0 (performance) overrides ambition.**

## Lessons log (why the rules exist — don't relearn the hard way)
- **The About lag saga:** a pinned/scrubbed GSAP-style storytelling experience + Lenis + region-colouring masks + per-frame CSS-var drivers **froze the client's low/mid machine** across many rounds. Fix = full lightweight rebuild: native scroll + fixed watermark + one-shot reveals + tiny SVG interactions. → `animation-guidelines.md`.
- **Lenis on inner pages felt "sticky/laggy"** (interpolation the machine couldn't keep up with) → removed; **native scroll** is the most responsive.
- **The `.cursor-glow` (main.js) is a real site-wide per-frame paint cost** (full-viewport double radial-gradient repainted on pointer move) → disable it on content-heavy pages.
- **`backdrop-filter` on scrolling cards** re-blurs every frame → drop it where it's invisible (e.g., over a 7% watermark).
- **Shared `styles.css` leaks** across ~13 pages → always scope page-specific rules with `body[data-page="X"]`.
- A prior `CLAUDE.md` + `docs/animation-system.md` "constitution" was deleted mid-project during the lag firefight; this `.claude/` guide **replaces** it, now **performance-first**.

## Pending client inputs
Real Formspree form ID · final Privacy Policy + Terms copy · footer CIN · YouTube URL · optional real photography.
