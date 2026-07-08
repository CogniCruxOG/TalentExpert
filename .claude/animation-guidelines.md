# Animation & Motion Guidelines — Talent Expert

> **Read this before writing ANY animation on this project.**
> Motion here must *communicate*, never *decorate* — and it must **never** cost the
> client a smooth scroll.

## ⚡ The prime directive (context you MUST know)
The client's machine is **low/mid-end**. Earlier in this project a "premium" pinned +
scrubbed scroll-storytelling experience (region-colouring masks, a scroll-linked glow,
Lenis smooth-scroll, sentence-by-sentence blur scrub) **repeatedly froze their machine**
("can't scroll", "sticky", "stuttering"). We removed all of it and shipped a
**lightweight** version that feels just as premium and runs at 60fps. **Do not repeat that.**

A "master brief" for this project lists pinning, scroll storytelling, card stacking, image
masking, and parallax as *preferred* animations. Treat those as **aspirational vocabulary,
not a shopping list** — on this hardware most are high-risk. Reach for the lightweight
equivalent first; escalate only after testing on the client's actual machine.

## ✅ Allowed to animate (compositor-cheap)
`transform` (translate / scale / rotate) · `opacity` · light **one-shot** `filter` ·
`clip-path` (minimal) · SVG `stroke-dashoffset` · CSS custom properties that feed the above.

## ⛔ Never animate / never reintroduce on inner pages
- **Layout props:** `top / left / right / bottom / width / height / margin / padding / letter-spacing` (reflow every frame).
- **Pinning / sticky scrubbed storytelling** (ScrollTrigger pin, or `position:sticky` + a scroll-progress driver).
- **Lenis** or any smooth-scroll engine on inner pages — its interpolation feels *sticky/laggy* here. Use **native scroll**.
- Any **per-scroll-frame** JS — writing a `--var` each frame, scroll-linked timelines, `getBoundingClientRect` loops.
- **`filter: blur()` scrubs**; large blur radii (> ~16px) on animated/pinned nodes.
- **Animated CSS masks / region-colouring** image layers.
- **`mix-blend-mode`** on animated or pinned elements.
- **`backdrop-filter`** on elements that **scroll over** a background (per-frame re-blur). Fine on the fixed nav.
- The site-wide **cursor-glow** (`.cursor-glow`, injected by `main.js`) on content-heavy pages — it repaints a full-viewport double radial-gradient on every pointer move. Disable per page: `body[data-page="X"] .cursor-glow{ display:none }`.
- **`will-change` sprawl** (layer explosion). Promote only the ONE element that needs it — prefer `transform:translateZ(0)` on a single fixed background layer.

## ✅ The proven lightweight patterns (use these)
- **Environmental background:** ONE illustration as a `position:fixed`, ~6–8% opacity watermark behind the whole page, **GPU-promoted** (`transform:translateZ(0)`), **never animated**. Content scrolls over it → free depth/parallax feel. *(About page = reference implementation.)*
- **Reveals:** `main.js`'s IntersectionObserver toggles `.reveal → .in`; CSS transitions do `opacity` + a gentle 16–28px rise, staggered with `.d1/.d2/…`. One-shot, cheap, reversible.
- **Blur → focus** as a **one-shot** transition on enter (a single ~0.7s `filter` transition on a few elements is fine; **scrubbing** blur per frame is not).
- **Micro-interactions:** small inline-SVG moments — the Vision *eye that opens* (`stroke-dashoffset` draw + iris `scale`), the Mission *rocket that lifts* (`translateY`) — keyed to `.reveal.in`, transform/opacity/stroke only.
- **Magnetic buttons / hover transforms:** transform-only, scoped, subtle.
- Always honor **`prefers-reduced-motion`** (jump to the settled state) and drop heavy bits on mobile/touch.

## Home = the one sanctioned exception
`index.html` carries the full cinematic stack (GSAP + ScrollTrigger + Lenis + SplitType;
pinned Who-We-Are / Why-Choose-Us / Founder). It is tuned and accepted **there only**.
Do **not** propagate that stack to inner pages, and don't add more pinned scenes anywhere
without the client confirming hardware.

## Pre-ship checklist for any motion
1. Does it *communicate*, or just decorate? (Decorate → cut.)
2. Is every animated property in the **allowed** list?
3. Does anything run **per scroll frame**? (On inner pages: should be *nothing*.)
4. Reduced-motion + mobile fallback present?
5. **Verified** on the client's hardware / via headless capture at settled **and** mid states?

When in doubt: **lighter**. A responsive scroll *is* the feature.
