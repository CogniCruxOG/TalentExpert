# Design System — Talent Expert

Single source of truth: `css/styles.css` `:root`. **Use tokens; never hard-code values.**

## Brand palette (STRICT — Orange · Charcoal · Grey. NO navy, NO green.)
| Token | Value | Use |
|---|---|---|
| `--orange` | `#F26F21` | primary brand, CTAs, accents, emphasis |
| `--orange-soft` | `#F9A56A` | gradients, hovers |
| `--orange-t` / `--orange-t2` | rgba .10 / .16 | tints, chip fills, `::selection` |
| `--orange-wash` | `#FDEDE1` | warm section wash |
| `--ink` | `#1A1A1A` | headings, strong text |
| `--ink2` | `#4A4A4A` | body text (default) |
| `--ink3` / `--grey` | `#8C8C8C` | muted, captions, eyebrows |
| `--paper` / `--paper2` | `#FFFFFF` / `#F4F2F0` | surfaces, `.section.alt` |
| `--hair` | rgba(26,26,26,.10) | hairline borders |
| `--glass` / `--glass2` | white .55 / .72 | glass cards — **not** over scrolling backgrounds (see animation guide) |

Legacy `--blue/--steel/--green/--amber` are **remapped** to charcoal/grey/orange so old
markup restyles automatically. **Never introduce a real blue or green.** Portal accent:
`--accent` (orange for seekers; charcoal-family for employers) set via `body[data-portal]`.

The page background is **one continuous warm gradient** on `html` (white→warm→white) so
sections blend rather than stack as boxes. Keep sections mostly transparent; use
`.section.alt` (`--paper2`) sparingly for rhythm.

## Typography
- **Display / headings:** `Fraunces`, serif, weight **300**, `letter-spacing:-.01em`, `line-height:1.08`, `text-wrap:balance`. Emphasis via `<b>`/`<strong>` → weight 600, `--ink`.
- **Body:** `Manrope`, sans, `line-height:1.72`, `--ink2`, measure `max-width:68ch`.
- **Large headings drop the trailing full stop** (hierarchy via type, not punctuation).
- **Eyebrows:** uppercase, letter-spaced, `--orange`, small, preceded by a short orange rule.

## Spacing · radius · shadow · layout
- Container: `--maxw: 1340px`; `.wrap` centers content and sits `z-index:2` above decorative bg.
- Section rhythm: `.section{padding:104px 0}` (`.tight` = 72px). **Redesign** spacing per breakpoint, don't just shrink.
- Radius: `--r:20px`, `--r-lg:28px`, `--r-xl:36px`; chips/icon tiles 16px.
- Shadow: `--sh-s` (rest), `--sh-m` (hover/elevated) — soft, long, low-opacity. Never harsh.
- Motion easing: `--ease: cubic-bezier(.22,.61,.36,1)`.

## Components (defined in `styles.css`)
- **Buttons** `.btn` → `.btn-orange`, `.btn-white`, `.btn-ghost`; `.magnetic` is opt-in (transform-only).
- **Cards** `.card` / `.feat-card` (glass) — mind `backdrop-filter` + scroll (see animation guide).
- **Chips** `.chip.o|.b|.g|.a` — tinted rounded-square icon holders; icon color = `currentColor` inherited from the chip variant.
- **Icons:** `assets/icons/sprite.svg` via `<svg class="ic"><use href="…#i-name"/></svg>`. For an **animated** icon, inline the SVG so its parts are addressable (see the About eye/rocket).
- **Nav** `.nav`/`.nav-inner` (sticky glass). **Footer** `.site` (premium 4-column with the temple echo) — global component.

## Finish
Soft depth (layered light shadows + warm washes), smooth radii, hairline borders, restrained
gradients. Glassmorphism only where it won't cost scroll frames. Whitespace is a feature —
**never clutter.**
