/* ==========================================================================
   TALENT EXPERT — Home cinematic layer
   Requires: gsap, ScrollTrigger, SplitType, Lenis.
   Lenis provides light, responsive smooth-scroll (driven by GSAP's ticker and
   synced to ScrollTrigger). Three sections (Who We Are, Why Choose Us, Founder)
   pin and scrub their story on desktop; everything else animates on enter with GPU
   transforms only (opacity/translate/scale). Reduced-motion → static fallback.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hover = matchMedia('(hover:hover)').matches;
  // Desktop-only "smooth" layer: Lenis smooth-scroll + per-frame scroll parallax run ONLY here.
  // On mobile/touch they cause scroll jank ("hanging"), so touch devices use plain native scroll
  // and static backdrops — the one-shot entrance reveals still play everywhere.
  const smooth = matchMedia('(min-width:901px)').matches;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---- Load the exact uploaded temple illustration (used in every path) ---- */
  function loadTempleImg() {
    const t = $('#xTemple'); if (!t) return;
    // The hero backdrop is hidden (plain-background pages) — don't fetch the artwork at all.
    // Self-adjusting: if the backdrop is ever re-enabled in CSS, the image loads again.
    if (getComputedStyle(t).display === 'none') return;
    const media = $('.x-temple-media', t);
    const srcs = [t.dataset.src, t.dataset.src2].filter(Boolean);
    let i = 0;
    (function tryNext() {
      if (i >= srcs.length) return;
      const img = new Image();
      img.onload = () => {
        const el = document.createElement('img');
        el.className = 'x-temple-photo'; el.src = srcs[i]; el.alt = '';
        media.insertBefore(el, media.firstChild);
        t.classList.add('has-photo');
      };
      img.onerror = () => { i++; tryNext(); };
      img.src = srcs[i];
    })();
  }

  /* ---- Fallback (no GSAP, or reduced motion): show everything, no animation ---- */
  function revealAllStatic() {
    $$('.x-who .wp').forEach(e => e.classList.add('on'));   // stages are full at base opacity (no ghost)
    $$('.do-panel').forEach(e => e.classList.add('focus'));
    const grow = $('.x-title .grow'); if (grow) grow.classList.add('drawn');
    loadTempleImg();
  }

  if (!hasGSAP || reduce) { revealAllStatic(); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---- Smooth scroll (Lenis) — light + responsive: buttery momentum without lag ----
     Driven by GSAP's ticker and synced to ScrollTrigger so pinned/scrub scenes stay
     perfectly in step. Disabled under reduced-motion (handled by the early return). */
  if (smooth && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.07, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis-on');
    window.__lenis = lenis;   // exposed so main.js can jump instantly for anchor nav
  }

  /* ---- Scroll progress bar ---- */
  const prog = $('#xProgress');
  if (prog && smooth) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => gsap.set(prog, { scaleX: self.progress }) });

  /* ---- Environmental temple backdrop: very slow drift + subtle scale (alive). Desktop only —
     a scroll-scrubbed transform on mobile repaints every frame and makes scrolling stutter. ---- */
  const pageTemple = $('#pageTemple');
  if (pageTemple && smooth) gsap.fromTo(pageTemple,
    { yPercent: -4, scale: 1.02 },
    { yPercent: 8, scale: 1.09, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });

  /* ================= HERO — load reveal + temple depth ================= */
  loadTempleImg();
  const temple = $('#xTemple');

  // headline — text shown instantly; the ONLY kept motion is the highlight underline, which
  // "scribbles" in left→right shortly after load (a small delay lets the base state paint first
  // so the CSS scaleX transition actually animates).
  const title = $('.x-title');
  if (title) {
    gsap.set(title, { opacity: 1 });
    const grow = $('.x-title .grow');
    if (grow) gsap.delayedCall(0.35, () => grow.classList.add('drawn'));
  }
  // supporting hero content — visible instantly, no fade-in (its base CSS state is already shown)
  // temple backdrop: ambient warm-up (no content fade). The hero CTAs are intentionally STATIC —
  // no idle float and no scroll parallax (they must not drift when scrolling).
  if (temple) {
    gsap.set(temple, { '--amb': 0.12, '--apex': 0 });
    gsap.to(temple, { '--amb': 0.4, duration: 1.4, ease: 'sine.out', delay: 0.3 });
    // Desktop only — scroll-scrubbed temple depth (the temple is currently hidden, so this is a
    // no-op unless the backdrop is re-enabled). Content/CTA parallax + float were removed.
    if (smooth) {
      gsap.to('.x-temple-media', { yPercent: 7, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
    }
  }

  /* ================= TRUST — counters (shake-proof, animate ONCE) ================= */
  const runCount = (el) => {
    const target = +el.dataset.count || 0;
    const comma = el.hasAttribute('data-comma');
    const o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 1.4, ease: 'power2.out',
      onUpdate() { const n = Math.round(o.v); el.textContent = comma ? n.toLocaleString('en-IN') : n; }
    });
  };
  const band = $('#trust');
  if (band) {
    // Quote + stat cards show instantly (fade-in removed). Only the number counters still
    // run once, when the band scrolls into view — a count-up, not a fade.
    ScrollTrigger.create({
      trigger: band, start: 'top 90%', once: true,
      onEnter: () => { $$('.x-stat').forEach((st) => { const num = $('.num', st); if (num) runCount(num); }); }
    });
  }

  /* ================= Generic reveal helper (one-time, GPU transforms) ================= */
  const reveal = (els, opts) => els.forEach((el, i) => gsap.from(el, Object.assign({
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    y: 26, opacity: 0, duration: 0.7, ease: 'power3.out', delay: (i % 4) * 0.05
  }, opts)));

  /* ---- Coordinated section intro: heading reveals FIRST, then the cards/content rise in
     together with a subtle stagger — once, never scrubbed, never replayed. When opts.pin is
     set (desktop + motion), the chapter RESTS via native CSS position:sticky (browser
     compositor = eases to a stop, no snap), then releases naturally. ---- */
  const stickies = [];   // chapters resting via native sticky — re-measured on resize
  const sectionIntro = (sel, headSel, itemSel, opts) => {
    opts = opts || {};
    const sec = $(sel); if (!sec) return;
    const head = headSel ? $(headSel, sec) : null;
    const headKids = head ? $$(':scope > *', head) : [];
    const items = itemSel ? $$(itemSel, sec) : [];
    // Take full control of the managed elements: drop any .reveal class so main.js's
    // IntersectionObserver can't fight this timeline, and kill their CSS transitions so
    // only GSAP drives opacity/transform (a stray CSS transition would double-animate).
    [head, ...headKids, ...items].forEach((el) => {
      if (!el) return;
      el.classList.remove('reveal');
      el.style.transition = 'none';
    });
    // Entrance fade-in removed site-wide: the heading + content show INSTANTLY at full opacity /
    // natural position — no fade, no slide-up. gsap.set guarantees the visible end state even if
    // a base CSS rule tried to hide the element. The pin-and-pause + smooth scroll below are
    // untouched: the pin is CSS position:sticky, independent of this reveal.
    if (headKids.length) gsap.set(headKids, { opacity: 1, y: 0 });
    else if (head) gsap.set(head, { opacity: 1, y: 0 });
    if (items.length) gsap.set(items, { opacity: 1, y: 0, scale: 1 });
    const playOnce = () => {};      // no entrance animation to trigger
    const finish = () => {};        // already fully visible
    sec.__teFinish = finish;        // nav still calls this; a no-op is correct now
    const pinEl = (opts.pin && matchMedia('(min-width:901px)').matches)
      ? (opts.pinTarget ? $(opts.pinTarget, sec) : sec) : null;
    // collapse:true — see main.js: less than a screen of content, so flow at natural height
    // instead of stretching to 100vh around blank. Declared, not measured (font-timing-proof).
    if (opts.collapse) sec.classList.add('te-short');
    if (pinEl && !opts.collapse && typeof window.TEMakeSticky === 'function') {
      // NATIVE STICKY pin — the browser rests the chapter on the compositor, so it eases to a
      // stop and releases with zero snap (a JS pin freezes instantly = the hard "fast lock").
      const holdVh = opts.hold || 0.55;
      let stick;
      if (opts.pinTarget) {
        // The pinTarget (.x-who-pin / .x-do-pin / .x-why-pin) is ALREADY the full-screen chapter
        // box with its own flex layout + navbar padding — just make it the sticky element and
        // give its section room below to stick against. No re-wrapping needed.
        sec.classList.add('te-sticky');
        pinEl.classList.add('te-stick');
        sec.style.height = 'calc(100vh + ' + Math.round(innerHeight * holdVh) + 'px)';
        stick = pinEl;
      } else {
        stick = window.TEMakeSticky(sec, holdVh);
      }
      sec.__teStick = stick; sec.__teHold = holdVh;
      // Auto-fit the content INSIDE the sticky box so the chapter fits any screen / scaling.
      if (typeof window.TEFitSection === 'function') window.TEFitSection(stick);
      stickies.push(sec);
      // ScrollTrigger no longer pins anything (playOnce is a no-op) — the pin is CSS sticky.
      ScrollTrigger.create({ trigger: sec, start: 'top top', once: true, onEnter: playOnce });
    } else {
      ScrollTrigger.create({ trigger: sec, start: 'top 78%', once: true, onEnter: playOnce });
    }
  };

  void reveal;   // section headings are now handled by each chapter's sectionIntro

  /* ================= WHO WE ARE — pinned scroll-driven story (desktop), reversible =================
     Stage 1: everything ghosted. Then as scroll scrubs, paragraph N resolves and
     step N activates (icon glow + connector grows + title bold), while earlier steps
     become inactive-but-readable. Scrolling back up mirrors it exactly. */
  const wps = $$('.x-who .wp');
  const stages = $$('.x-who .ddd-stage');
  if (stages.length || wps.length) {
    const N = stages.length || wps.length;
    // Dim/reveal the CONTENT (text + icon) per stage — never the stage itself — so
    // the connector (.ddd-stage::after) brightness stays governed purely by --cl and
    // the drawn line reads as one uniformly-bright continuous stroke.
    const contentOf = (s) => [$('.ddd-txt', s), $('.ddd-icon', s)].filter(Boolean);
    const armWho = () => {   // ghosted Stage-1 state
      gsap.set(wps, { opacity: 0.18, y: 16 });
      gsap.set(stages, { '--cl': 0 });
      stages.forEach((s) => { gsap.set(contentOf(s), { opacity: 0.18 }); const ic = $('.ddd-icon', s); if (ic) gsap.set(ic, { scale: 1, '--ig': 0 }); });
    };
    const showWho = () => {  // static complete state (mobile / fallback)
      gsap.set(wps, { opacity: 1, y: 0 });
      gsap.set(stages, { '--cl': 1 });
      stages.forEach((s) => { gsap.set(contentOf(s), { opacity: 1 }); const ic = $('.ddd-icon', s); if (ic) gsap.set(ic, { scale: 1, '--ig': 0 }); });
    };
    // Continuous scrubbed timeline: paragraph N and step N resolve together; the
    // connector fill (--cl) and icon glow (--ig) INTERPOLATE with scroll (no class
    // jumps), so the line grows as one continuous stroke. Fully reversible.
    const buildWhoTL = (stObj) => {
      const tl = gsap.timeline({ scrollTrigger: stObj });
      const a = 0.08, b = 0.97, seg = (b - a) / N;
      stages.forEach((s, i) => {
        const icon = $('.ddd-icon', s), content = contentOf(s), wp = wps[i], t0 = a + i * seg;
        if (wp) tl.to(wp, { opacity: 1, y: 0, ease: 'none', duration: seg * 0.72 }, t0);
        tl.to(content, { opacity: 1, ease: 'none', duration: seg * 0.55 }, t0);
        if (icon) tl.to(icon, { '--ig': 1, scale: 1.08, ease: 'sine.out', duration: seg * 0.55 }, t0);
        if (i < N - 1) {
          tl.to(s, { '--cl': 1, ease: 'none', duration: seg * 0.95 }, t0 + seg * 0.42);   // line grows to next
          const tn = a + (i + 1) * seg;                                                    // next step begins
          tl.to(content, { opacity: 0.7, ease: 'none', duration: seg * 0.5 }, tn);         // this one → done (content dims, line stays bright)
          if (icon) tl.to(icon, { '--ig': 0.22, scale: 1, ease: 'sine.out', duration: seg * 0.5 }, tn);
        }
      });
      return tl;
    };

    // No pin, no scrub: the whole story is shown complete on every width; a single
    // one-time entrance staggers the steps in when the section first enters the viewport.
    showWho();
    void armWho;
  }
  /* BRAND CREDIBILITY chapter: heading fades first, then KPIs stagger + temple rises, once */
  sectionIntro('#brand', '.x-brand-head', '.x-kpi-row, .x-brand-art', { pin: true, hold: 0.55 });
  /* KPI counters — count 0 → target ONCE as the section settles; the "+" appears with the
     final number; smooth ease-out ~1.8s; never replays. Reduced-motion shows finals. */
  (function () {
    const brand = $('#brand'); if (!brand) return;
    const nums = $$('.x-kpi-n', brand);
    const jobs = nums.map((el) => ({ el, to: +el.textContent.replace(/,/g, ''), comma: el.textContent.indexOf(',') > -1 }));
    nums.forEach((el) => (el.textContent = '0'));       // '+' is shown instantly (fade removed)
    ScrollTrigger.create({
      trigger: brand, start: 'top top', once: true,
      onEnter: () => {
        jobs.forEach((j) => {
          const o = { v: 0 };
          gsap.to(o, { v: j.to, duration: 1.8, ease: 'power2.out',
            onUpdate() { const v = Math.round(o.v); j.el.textContent = j.comma ? v.toLocaleString('en-IN') : v; } });
        });
      }
    });
  })();

  /* WHO WE ARE chapter: pin + float the story paragraphs and the step diagram in once */
  sectionIntro('.x-who', '.x-who-head', '.x-who-story .wp, .x-who .ddd-stage', { pin: true, pinTarget: '.x-who-pin', hold: 0.55 });

  /* ============ WHAT WE DO — static grid; coordinated heading->cards intro + brief pin ============ */
  sectionIntro('#rail', '.x-do-head', '#doStage .do-panel', { pin: true, pinTarget: '.x-do-pin', hold: 0.55 });

  /* ============ WHY CHOOSE US — static grid; coordinated heading->cards intro + brief pin ============ */
  sectionIntro('.x-why', '.x-why-head', '.x-why-stage .proof', { pin: true, pinTarget: '.x-why-pin', hold: 0.55 });

  /* ================= AUDIENCE PATHS chapter: pin + float the two path cards in ================= */
  sectionIntro('#paths', '.sec-head', '.x-path', { pin: true, hold: 0.55 });
  // elegant mouse-follow spotlight on the path cards (no tilt — clean, premium)
  if (hover) $$('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ================= FOUNDER — pinned, scroll-driven quote reveal (reversible) =================
     Quote "inks in" word-by-word with scroll; the italic phrase gains a gentle glow;
     then the signature panel builds sequentially (divider grows, lines appear). */
  /* The quote is a plain flowing paragraph (NO SplitType word-splitting — wrapping each
     word in an inline-block broke the line spacing around the italic phrase and opened a
     blank gap). The block-level entrance below reveals it as a finished editorial layout. */
  /* FOUNDER chapter: pin + float the quote + signature in once */
  // Founder is NOT pinned: it's a single short quote, so a full-viewport pinned chapter just
  // strands it in blank space. It flows at its own content height instead (content still shows
  // instantly). Its CSS below drops the forced 100vh so the section is only as tall as it needs.
  sectionIntro('.x-founder', null, '.x-founder-quote, .x-founder-sign', { pin: false });

  /* ================= FINAL CTA chapter: pin + float heading then cards in once ================= */
  sectionIntro('.x-finale', '.x-finale-copy', '.x-finale-cards .fin-card', { collapse: true });
  // decorative background blobs shown instantly (fade/scale-in reveal removed)

  /* ================= Magnetic buttons ================= */
  if (hover) {
    $$('.btn.magnetic').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.4);
        yTo((e.clientY - r.top - r.height / 2) * 0.5);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });

    /* ---- Interactive cards: cursor glow + subtle 3D tilt ---- */
    $$('[data-tilt]').forEach((card) => {
      const rY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2' });
      const rX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2' });
      gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        rY((px - 0.5) * 6); rX((0.5 - py) * 6);
      });
      card.addEventListener('mouseleave', () => { rY(0); rX(0); });
    });
  }

  /* ---- keep ScrollTrigger in sync after fonts/images load ---- */
  // On resize / zoom / orientation: recompute each sticky chapter's room for the new viewport
  // height, then re-fit the content inside its sticky box.
  try {
    ScrollTrigger.addEventListener('refreshInit', function () {
      for (var i = 0; i < stickies.length; i++) {
        var s = stickies[i], hold = s.__teHold || 0.55;
        s.style.height = 'calc(100vh + ' + Math.round(window.innerHeight * hold) + 'px)';
        if (typeof window.TEFitSection === 'function' && s.__teStick) window.TEFitSection(s.__teStick);
      }
    });
  } catch (_) {}

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
