# Talent Expert — Project Guide for Claude Code

> **Talent Expert** (talentexpert.in) — a Tamil Nadu recruitment/staffing company.
> "Bridging Rural Talent with Business Growth." A premium, editorial, multi-page
> **static** marketing website (HTML/CSS/JS, no build step).

This file loads every session and carries the **non-negotiable rules**. Deeper craft
guidance lives in `.claude/` — **read the relevant guide before that kind of work:**

- `.claude/design-system.md` — palette, type, spacing, shadow, component tokens
- `.claude/ui-ux-guidelines.md` — UX heuristics, section purpose, the conversion journey
- `.claude/animation-guidelines.md` — **motion + the performance budget · READ before ANY animation**
- `.claude/frontend-standards.md` — code architecture, responsive, a11y, SEO, the verify workflow
- `.claude/project-rules.md` — content governance, asset rules, git, the lessons log

---

## ⚡ RULE #0 — PERFORMANCE IS THE PRIME DIRECTIVE (hard-won)

The client's machine is **low/mid-end**. This project spent many painful rounds
freezing it with "premium" scroll effects. **A buttery-smooth, responsive scroll
beats any animation.** When visual ambition and performance conflict, **performance
wins — every time.**

**Never reintroduce these on inner pages (they demonstrably froze this machine):**
- ScrollTrigger/GSAP **pinning** or sticky **scrubbed** storytelling
- **Lenis** (or any smooth-scroll engine) on inner pages — use **native scroll** (zero latency)
- any **per-scroll-frame** JS driver (CSS-var scrubbing, scroll-linked timelines, rAF scroll loops)
- animated **CSS masks / region-colouring**, `filter: blur()` **scrubs**, `mix-blend-mode` on animated nodes
- the site-wide **cursor-glow** on content-heavy pages (`.cursor-glow` in `main.js` repaints a full-viewport gradient — disable per page: `body[data-page="X"] .cursor-glow{display:none}`)
- `backdrop-filter` on cards that **scroll** over a background

**The proven lightweight formula (delivers the same premium feel):**
native scroll · one static illustration watermark (`position:fixed`, GPU-promoted, never animated) ·
one-shot IntersectionObserver reveals (opacity + gentle rise) · a one-shot blur→focus ·
tiny inline-SVG micro-interactions · **nothing animates per scroll frame.**

> Animate **only** `transform`, `opacity`, light `filter`, `clip-path`, SVG `stroke`.
> **Never** animate layout (`top/left/width/height/margin/letter-spacing`).
> Prototype heavy ideas, but **verify on the client's hardware before shipping.**
> Full detail + rationale → `.claude/animation-guidelines.md`.

(**HOME** `index.html` is the one sanctioned exception — it carries the tuned cinematic
GSAP+Lenis stack. Do **not** propagate that stack to inner pages.)

---

## What this is
- **Audience:** SME **employers** (hire talent) + rural **job-seekers** (find work), across Tamil Nadu.
- **Goal:** premium brand perception, trust, and conversion (Get Talent Now / Find Jobs / register).
- **Stack:** static HTML + shared `css/styles.css` + shared `js/main.js`. No framework, no bundler.
  - **Home** (`index.html`): flagship cinematic layer → `css/experience.css` + `js/experience.js` + self-hosted vendors in `js/vendor/` (gsap, ScrollTrigger, lenis, split-type).
  - **Inner pages** (about, services, employers, job-seekers, contact, …): `main.js` only, **native scroll**, lightweight reveals. About uses a fixed illustration watermark.
- Pages are themed per audience via `<body data-page="…" data-portal="employer|seeker">`.

## Key files
- `css/styles.css` — the whole shared design system (`:root` tokens at top). **Scope new page rules with `body[data-page="…"]`** (it is shared across ~13 pages and leaks otherwise).
- `js/main.js` — shared behaviours (reveal observer, forms, nav, cursor-glow).
- `index.html` + `css/experience.css` + `js/experience.js` — Home cinematic only.
- `assets/illustrations/` (`temple.png`, `story-journey.png` + `-soft`), `assets/icons/sprite.svg`.
- `docs/CONTENT-NOTES.md` — content decisions log.

## Absolute rules (detail in `.claude/project-rules.md`)
1. **Content governance:** the client's approved **Home "Section 4" document is the single source of truth.** Do NOT invent, add, remove, rename, reorder, merge, or split sections; do NOT write new copy, stats, CTAs, or testimonials. You MAY fix grammar/spacing/typography. Design & motion = full freedom. (Footer is a global exception.)
2. **Brand palette is STRICT:** Orange `#F26F21`, Charcoal `#1A1A1A`, Grey `#8C8C8C` (+ soft/tints). **NO navy, NO green.** Use `:root` tokens.
3. **Assets:** use the client's EXACT illustrations — never redraw/trace/recolor/crop. Knock out backgrounds with Pillow, preserving original ink.
4. **Don't break working things.** Analyze before editing; improve, don't rewrite; preserve responsiveness, a11y, and existing (Home) animations.
5. **Verify visually before claiming done** — headless Edge screenshots (see `.claude/frontend-standards.md`).

## Workflow
- **Fonts:** Fraunces (serif) for headings/display (light, weight 300); Manrope (sans) for body.
- **Git:** solo repo, branch `main` (`github.com/CogniCruxOG/TalentExpert`). Commit **and** push only when asked. End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Run locally:** `python -m http.server 8000` in the project root → http://127.0.0.1:8000/.
- **Design ethos:** Apple / Stripe / Linear / Vercel — *less but better*, elegant, purposeful; every element earns its place. **But RULE #0 overrides ambition.**
