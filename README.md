# Talent Expert — Website

> **Bridging Rural Talent with Business Growth**
> India's most people-first recruitment company, connecting SMEs with trained rural talent from Tamil Nadu.

A fast, fully-responsive, SEO-ready multi-page marketing site built as **static HTML/CSS/JS** — no build step, no framework, no dependencies. Deploy anywhere (GitHub Pages, Netlify, Vercel, any static host).

---

## ✨ Highlights

- **Interactive storytelling** — every page is a guided scroll experience (progressive reveals, animated counters, interactive problem→solution list, values roadmap, hiring-model switch, FAQ accordions, floating service orbit).
- **Two audience portals** with distinct theming — **blue** for Business Owners, **orange/green** for Job Seekers — remembered via a lightweight cookie.
- **Premium design system** — Fraunces + Manrope typography, glassmorphism, custom line-icon set, doodle backdrops, full light-theme palette.
- **Accessible & performant** — semantic HTML, keyboard-focusable nav, `prefers-reduced-motion` support, mobile GPU-friendly fallbacks, lazy reveal via `IntersectionObserver`.
- **SEO-ready** — per-page unique `<title>` / meta description / keywords, Open Graph + Twitter cards, canonical URLs, JSON-LD (`Organization`, `FAQPage`, `Service`), `sitemap.xml`, `robots.txt`.
- **Lead capture** — all forms are wired for **Formspree** (see setup below); graceful inline-success fallback until an endpoint is configured.

---

## 📁 Project structure

```
TalentExpert/
├── index.html            # Home
├── about.html            # Our Story · Vision & Mission · Values · Founder
├── services.html         # 6 detailed services
├── employers.html        # Business Owner portal (problem, why, process, models, stories, FAQ, lead form)
├── job-seekers.html      # Job Seeker portal (why, eligibility, journey, categories, stories, FAQ, register)
├── industries.html       # 8 industries + cross-industry leadership
├── hiring-models.html    # Raw Placement vs Workforce Capability Development
├── process.html          # 7-step hiring process
├── contact.html          # Contact details + general enquiry form
├── career-tips.html      # "How to Get the Right Job Faster in 2026"
├── privacy.html          # Legal placeholder
├── terms.html            # Legal placeholder
├── 404.html              # Not-found page
├── sitemap.xml · robots.txt
├── css/styles.css        # Single shared design system
├── js/main.js            # Single shared behaviour bundle
├── assets/
│   ├── icons/sprite.svg  # External SVG icon sprite
│   └── logos/            # logo + favicon (PNG)
└── docs/CONTENT-NOTES.md # Content sourcing + decisions log
```

---

## 🚀 Run locally

Because pages reference an **external SVG sprite**, open them through a local server (not `file://`):

```bash
cd TalentExpert
python -m http.server 8000
# → http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

---

## 📮 Connect the forms (Formspree)

Every form has `action="https://formspree.io/f/YOUR_FORM_ID"`.

1. Create a free form at **[formspree.io](https://formspree.io)**.
2. Replace **`YOUR_FORM_ID`** with your form ID in these files:
   `index.html`, `about.html`, `employers.html`, `job-seekers.html`, `contact.html`
   (each has the footer newsletter form; `employers`, `job-seekers`, `contact` also have a main form).
3. Done — submissions arrive by email and show an inline success message.

> Until an endpoint is set, forms show a friendly inline confirmation and reset (no data is sent).

---

## 🔧 Editing content

- **Global look & feel:** `css/styles.css` — colours/spacing/radius live in the `:root` design tokens at the top.
- **Behaviour:** `js/main.js` (nav, reveals, counters, FAQ, hiring switch, forms).
- **Icons:** add a `<symbol>` to `assets/icons/sprite.svg`, use with `<svg class="ic"><use href="assets/icons/sprite.svg#i-yourname"/></svg>`.
- **Copy:** edit the relevant `*.html` directly. The shared header/footer markup is repeated per page — update all pages when changing nav/footer.

---

## 🌐 Deploy

**GitHub Pages:** push to your repo → Settings → Pages → deploy from `main` / root.
**Netlify / Vercel:** drag-and-drop the folder or connect the repo (no build command; publish directory = root).

Before going live, update the absolute URLs (`https://www.talentexpert.in/…`) in the canonical/OG tags and `sitemap.xml` if the domain differs.

---

## 📞 Contact

**Talent Expert** — Happy Towers, 129, Dhanakotti Raja Street, Ekkattuthangal, Chennai 600032
📞 +91 95978 51600 · ✉ info@talentexpert.in · 🌐 www.talentexpert.in

---

*Designed with purpose. Built for impact. © Talent Expert.*
