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
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---- Load the exact uploaded temple illustration (used in every path) ---- */
  function loadTempleImg() {
    const t = $('#xTemple'); if (!t) return;
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
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis-on');
    window.__lenis = lenis;   // exposed so main.js can jump instantly for anchor nav
  }

  /* ---- Scroll progress bar ---- */
  const prog = $('#xProgress');
  if (prog) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => gsap.set(prog, { scaleX: self.progress }) });

  /* ---- Environmental temple backdrop: very slow drift + subtle scale (alive) ---- */
  const pageTemple = $('#pageTemple');
  if (pageTemple) gsap.fromTo(pageTemple,
    { yPercent: -4, scale: 1.02 },
    { yPercent: 8, scale: 1.09, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });

  /* ================= HERO — load reveal + temple depth ================= */
  loadTempleImg();
  const temple = $('#xTemple');

  // kinetic headline
  const title = $('.x-title');
  if (title && typeof SplitType !== 'undefined') {
    const split = new SplitType(title, { types: 'words,chars' });
    gsap.set(title, { opacity: 1 });
    gsap.from(split.chars, {
      yPercent: 116, opacity: 0, stagger: 0.018, duration: 0.85, ease: 'power3.out', delay: 0.12
    });
    const grow = $('.x-title .grow');
    if (grow) gsap.delayedCall(0.12 + split.chars.length * 0.018 + 0.2, () => grow.classList.add('drawn'));
  }
  // supporting hero content
  gsap.from('.x-eyebrow, .x-sub, .x-rhythm, .x-hero .hero-actions', {
    y: 22, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, delay: 0.42
  });
  // temple backdrop: gentle fade-in + ambient warm-up, then anchored parallax
  if (temple) {
    gsap.set(temple, { '--amb': 0.12, '--apex': 0 });
    gsap.from('.x-temple-media', { opacity: 0, scale: 1.05, duration: 1.4, ease: 'power2.out', delay: 0.15 });
    gsap.to(temple, { '--amb': 0.4, duration: 1.4, ease: 'sine.out', delay: 0.3 });
    // depth: content drifts up a touch faster than the temple → the temple feels anchored
    gsap.to('.x-temple-media', { yPercent: 7, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
    gsap.to('.x-hero-content', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
    // CTA floats gently once revealed
    gsap.to('.x-hero .hero-actions', { y: -6, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.5 });
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
    gsap.set('.x-trust-quote', { opacity: 0, y: 14 });
    gsap.set('.x-stat', { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: band, start: 'top 90%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to('.x-trust-quote', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        $$('.x-stat').forEach((st, i) => {
          const num = $('.num', st);
          tl.to(st, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, i === 0 ? '-=0.25' : '-=0.32')
            .add(() => { if (num) runCount(num); }, '<+0.04')
            .to(temple, { '--apex': 0.14 + i * 0.11, duration: 0.6, ease: 'sine.out' }, '<');
        });
        tl.to(temple, { '--apex': 0.38, duration: 0.5, ease: 'sine.out' })
          .to(temple, { '--apex': 0.26, duration: 0.8, ease: 'sine.inOut' });
      }
    });
  }

  /* ================= Generic reveal helper (one-time, GPU transforms) ================= */
  const reveal = (els, opts) => els.forEach((el, i) => gsap.from(el, Object.assign({
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    y: 26, opacity: 0, duration: 0.7, ease: 'power3.out', delay: (i % 4) * 0.05
  }, opts)));

  /* ---- Coordinated section intro: heading reveals FIRST, then the cards/content rise in
     together with a subtle stagger — once, never scrubbed, never replayed. When opts.pin is
     set (desktop + motion), the section is held for a brief ~0.5s "reading pause" while the
     reveal completes, then the pin releases automatically. ---- */
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
    // One entrance: label/heading/description rise FIRST, then the whole content group
    // floats gently up + fades in together. fromTo with an explicit VISIBLE end state so
    // nothing can be left hidden regardless of each element's base CSS (a plain .from()
    // captures the element's current value as the end — if that is 0 it stays invisible).
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    if (headKids.length) tl.fromTo(headKids, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 });
    else if (head) tl.fromTo(head, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 });
    if (items.length) tl.fromTo(items,
      { opacity: 0, y: 30, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.1 },
      (head || headKids.length) ? '-=0.04' : 0);   // heading settles, then cards float in
    if (reduce) { tl.progress(1); return; }
    // Play exactly ONCE. Scrolling back up re-shows the finished state instantly (no replay).
    let played = false;
    const playOnce = () => { if (!played) { played = true; tl.play(); } };
    const finish = () => { played = true; tl.progress(1); };
    if (opts.pin && matchMedia('(min-width:901px)').matches) {
      // Brief chapter pin: the section is a 100vh block (opts.pinTarget) sized to hold all
      // its content. anticipatePin + preventOverlaps make the lock-in read as a smooth
      // continuation of the scroll rather than a snap; it holds for a short reading pause,
      // then releases gently. The entrance plays on enter so the pin never feels empty.
      const pinEl = opts.pinTarget ? $(opts.pinTarget, sec) : sec;
      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: '+=' + Math.round(innerHeight * (opts.hold || 0.75)),
        pin: pinEl, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
        preventOverlaps: true, fastScrollEnd: true,
        onEnter: playOnce, onEnterBack: finish,
        // If the page loads already scrolled into/past this chapter, show it complete.
        onRefresh: (self) => { if (!played && self.progress > 0.001) finish(); }
      });
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
  sectionIntro('#brand', '.x-brand-head', '.x-kpi-row, .x-brand-art', { pin: true, hold: 0.65 });

  /* WHO WE ARE chapter: pin + float the story paragraphs and the step diagram in once */
  sectionIntro('.x-who', '.x-who-head', '.x-who-story .wp, .x-who .ddd-stage', { pin: true, pinTarget: '.x-who-pin', hold: 0.6 });

  /* ============ WHAT WE DO — static grid; coordinated heading->cards intro + brief pin ============ */
  sectionIntro('#rail', '.x-do-head', '#doStage .do-panel', { pin: true, pinTarget: '.x-do-pin', hold: 0.6 });

  /* ============ WHY CHOOSE US — static grid; coordinated heading->cards intro + brief pin ============ */
  sectionIntro('.x-why', '.x-why-head', '.x-why-stage .proof', { pin: true, pinTarget: '.x-why-pin', hold: 0.6 });

  /* ================= AUDIENCE PATHS chapter: pin + float the two path cards in ================= */
  sectionIntro('#paths', '.sec-head', '.x-path', { pin: true, hold: 0.6 });
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
  const fq = $('.x-founder blockquote');
  const fsign = $('.x-founder-sign');
  if (fq && typeof SplitType !== 'undefined') {
    const fwords = new SplitType(fq, { types: 'words' }).words;
    const fqmark = $('.x-founder-quote .qmark');
    const signKids = fsign ? [...fsign.children] : [];
    const armFounder = () => {
      gsap.set(fwords, { opacity: 0.16, y: 6 });
      if (fqmark) gsap.set(fqmark, { opacity: 0.45 });
      gsap.set(fq, { '--eg': 0 });
      if (fsign) { gsap.set(fsign, { '--dl': 0 }); gsap.set(signKids, { opacity: 0.16, x: 14 }); }
    };
    const showFounder = () => {
      gsap.set(fwords, { opacity: 1, y: 0 });
      if (fqmark) gsap.set(fqmark, { opacity: 1 });
      gsap.set(fq, { '--eg': 1 });
      if (fsign) { gsap.set(fsign, { '--dl': 1 }); gsap.set(signKids, { opacity: 1, x: 0 }); }
    };

    // No pin, no scrub: the whole quote + signature are shown as a finished editorial
    // layout; one gentle entrance fades the block in when the section enters, once.
    showFounder();
    void armFounder;
  }
  /* FOUNDER chapter: pin + float the quote + signature in once */
  sectionIntro('.x-founder', null, '.x-founder-quote, .x-founder-sign', { pin: true, hold: 0.6 });

  /* ================= FINAL CTA chapter: pin + float heading then cards in once ================= */
  sectionIntro('.x-finale', '.x-finale-copy', '.x-finale-cards .fin-card', { pin: true, hold: 0.6 });
  gsap.from('.x-finale .fin-blob', {
    scrollTrigger: { trigger: '.x-finale', start: 'top 80%', once: true },
    opacity: 0, scale: 0.6, duration: 1.4, ease: 'power2.out', stagger: 0.15
  });

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
  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
