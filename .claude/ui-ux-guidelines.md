# UI/UX Guidelines — Talent Expert

Design a **journey**, not isolated blocks. Every section flows into the next and moves
the visitor toward a conversion (Get Talent Now / Find Jobs / Register / Contact).

## Every section must answer three questions
1. **Why does this section exist?**
2. **What user problem does it solve?**
3. **What should the visitor do next?**

If a section can't answer all three, it's clutter — improve or cut it (subject to content
governance). Each section should hand the user to the next with intent.

## The two audiences (dual portal)
- **Employers** — SMEs needing reliable talent. Theme `data-portal="employer"`. Primary CTA: **Get Talent Now**.
- **Job-seekers** — rural youth seeking work/training. Theme `data-portal="seeker"`. Primary CTA: **Find Jobs / Register Free**.

Home serves both and the "Choose Your Path" tiles split the journey. Keep each portal's
voice, proof, and CTA distinct; never blur them into generic corporate copy.

## Hierarchy & composition
- One clear focal point per viewport. Lead the eye: **eyebrow → headline → sub → proof → CTA**.
- Generous, intentional whitespace; editorial asymmetry over rigid symmetry where it adds feel.
- Strong type contrast (light Fraunces display vs. steady Manrope body).
- Put trust signals near decision points: **500+ businesses · 2,000+ placements · 316 taluks · 25+ years**.

## Content & tone
- Human, grounded, credible — this brand is about real rural lives and second chances, not corporate fluff.
- **Content governance is strict** (→ `project-rules.md`): don't invent copy or sections. Improve *how* content is presented, not *what* it says.

## Conversion
- One primary CTA per section; secondary as a ghost button.
- Reduce form friction (Formspree); reassure (privacy, "thoughtfully sent, never spammy").
- Micro-copy builds trust. No dark patterns, no manufactured urgency.

## Emotion & storytelling
Aim for *felt* moments — the rural→city journey illustration, the founder's voice, the
warm continuous canvas. On inner pages, deliver them with **lightweight** means
(→ `animation-guidelines.md`). **Emotion ≠ heavy motion.**

## Responsive UX
Redesign per breakpoint (desktop / laptop / tablet / mobile): reflow, restack, re-prioritise —
never just shrink. Touch targets ≥ 44px; keep primary CTAs thumb-reachable on mobile;
collapse multi-column splits gracefully.

## Accessibility as UX
Keyboard paths, visible focus, AA contrast, and reduced-motion are part of the experience,
not an afterthought (→ `frontend-standards.md`).
