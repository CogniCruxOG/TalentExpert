/* ==========================================================================
   TALENT EXPERT — Home cinematic layer
   Requires: gsap, ScrollTrigger, SplitType, Lenis.
   Lenis provides light, responsive smooth-scroll (driven by GSAP's ticker and
   synced to ScrollTrigger). Two sections (Who We Are, Why Choose Us) pin and
   scrub their story on desktop; everything else animates on enter with GPU
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
  }

  /* ---- Scroll progress bar ---- */
  const prog = $('#xProgress');
  if (prog) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => gsap.set(prog, { scaleX: self.progress }) });

  /* ---- Environmental temple backdrop: very slow drift + subtle scale (alive) ---- */
  const pageTemple = $('#pageTemple');
  if (pageTemple) gsap.fromTo(pageTemple,
    { yPercent: -4, scale: 1.02 },
    { yPercent: 8, scale: 1.09, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1 } });

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

  /* ================= Generic reveal helper (GPU transforms, replays, blur-to-sharp) ================= */
  const reveal = (els, opts) => els.forEach((el, i) => gsap.from(el, Object.assign({
    scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    y: 38, opacity: 0, filter: 'blur(7px)', duration: 0.9, ease: 'power2.out', delay: (i % 4) * 0.05
  }, opts)));

  // section headings + supporting blocks
  reveal($$('.x-who-head'));
  reveal($$('.x-why-head'));
  reveal($$('.x-do-left .eyebrow, .x-do-left .title, .x-do-left .lead'), { y: 24, delay: 0 });
  reveal($$('.x-finale-copy > *'), { y: 26 });

  /* ================= WHO WE ARE — pinned scroll-driven story (desktop), reversible =================
     Stage 1: everything ghosted. Then as scroll scrubs, paragraph N resolves and
     step N activates (icon glow + connector grows + title bold), while earlier steps
     become inactive-but-readable. Scrolling back up mirrors it exactly. */
  const wps = $$('.x-who .wp');
  const stages = $$('.x-who .ddd-stage');
  if (stages.length || wps.length) {
    const N = 3;
    const LEAD = 0.14;   // initial ghosted state (visible while pinned) before Step 01
    const HOLD = 0.92;   // by 92% of progress all three steps have activated
    let last = -999;
    const applyWho = (active) => {
      if (active === last) return; last = active;
      wps.forEach((w, i) => w.classList.toggle('on', i <= active));          // paragraph resolves with its step
      stages.forEach((s, i) => {
        s.classList.toggle('pre', i > active);                              // not yet reached → ghosted
        s.classList.toggle('on', i === active);                             // current → active + emphasis
        s.classList.toggle('done', i < active);                             // passed → inactive but readable
      });
    };
    const drive = (p) => applyWho(p < LEAD ? -1 : Math.min(N - 1, Math.floor(((p - LEAD) / (HOLD - LEAD)) * N)));

    const whoMM = gsap.matchMedia();
    // Desktop: pin the section (like Why Choose Us). Scroll scrubs the story —
    // paragraph N resolves as step N activates — then it releases. Fully reversible.
    whoMM.add('(min-width:821px)', () => {
      applyWho(-1);
      const st = ScrollTrigger.create({
        trigger: '.x-who', start: 'top top', end: '+=' + Math.round((N + 1) * 500),
        pin: '.x-who-pin', invalidateOnRefresh: true, scrub: 0.9,
        onUpdate: (self) => drive(self.progress)
      });
      return () => { st.kill(); applyWho(-1); };
    });
    // Mobile: no pin — same reversible story as the section passes through.
    whoMM.add('(max-width:820px)', () => {
      applyWho(-1);
      const st = ScrollTrigger.create({
        trigger: '#journey', start: 'top 80%', end: 'bottom 60%', scrub: true,
        onUpdate: (self) => drive(self.progress)
      });
      return () => { st.kill(); applyWho(-1); };
    });
  }

  /* ================= WHAT WE DO — scroll-through cards, focus the centered one (no pin) ================= */
  const doPanels = $$('#doStage .do-panel');
  const doTrack = $$('#doTrack li');
  if (doPanels.length) {
    let ticking = false;
    const updateFocus = () => {
      ticking = false;
      const cy = innerHeight * 0.5;
      let best = 0, bd = Infinity;
      doPanels.forEach((p, i) => { const r = p.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - cy); if (d < bd) { bd = d; best = i; } });
      doPanels.forEach((p, i) => p.classList.toggle('focus', i === best));
      doTrack.forEach((li, i) => li.classList.toggle('on', i === best));
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateFocus); } };
    ScrollTrigger.create({ trigger: '#rail', start: 'top bottom', end: 'bottom top', onUpdate: request, onRefresh: updateFocus });
    doTrack.forEach((li, i) => li.addEventListener('click', () => doPanels[i].scrollIntoView({ behavior: 'smooth', block: 'center' })));
    updateFocus();
  }

  /* ================= WHY CHOOSE US — guided presentation (progress-driven, NO pin) =================
     As the section scrolls through, ONE card is the hero at a time while the rest
     stay visible but muted. Past the last card, the whole grid completes. */
  const whyStage = $('.x-why-stage');
  const proofs = whyStage ? $$('.proof', whyStage) : [];
  if (whyStage && proofs.length) {
    const n = proofs.length;
    const HOLD = 0.9;                    // by 90% of progress all six are revealed; tail = settled grid
    let lastKey = -999;
    const arm = () => { lastKey = -999; proofs.forEach((p) => { p.classList.add('pre'); p.classList.remove('active'); }); };
    const disarm = () => proofs.forEach((p) => p.classList.remove('pre', 'active'));
    // Fully bidirectional: the number of revealed cards follows scroll progress in
    // BOTH directions (scrub). Scroll up → cards hide 6→1 in reverse.
    const drive = (p) => {
      const settle = p >= HOLD;
      const revealed = settle ? n : Math.max(0, Math.min(n, Math.round((p / HOLD) * n)));
      const active = settle ? -1 : (revealed >= 1 ? revealed - 1 : -1);   // newest is the hero
      const key = revealed + (settle ? 1000 : 0);
      if (key === lastKey) return; lastKey = key;
      proofs.forEach((el, i) => {
        el.classList.toggle('pre', i >= revealed);       // hidden until reached (reappears on scroll-up)
        el.classList.toggle('active', i === active);     // hero flourish on the current front
      });
    };

    const whyMM = gsap.matchMedia();
    // Desktop: gently pin BELOW the navbar; scroll progress reveals/hides the six
    // cards one by one (~520px each), perfectly reversible in both directions.
    whyMM.add('(min-width:821px)', () => {
      arm();
      const st = ScrollTrigger.create({
        trigger: '.x-why', start: 'top top', end: '+=' + Math.round(n * 520),
        pin: '.x-why-pin', invalidateOnRefresh: true, scrub: 0.9,
        onUpdate: (self) => drive(self.progress)
      });
      return () => { st.kill(); disarm(); };
    });
    // Mobile: no pin — same reversible progressive reveal as the section passes through.
    whyMM.add('(max-width:820px)', () => {
      arm();
      const st = ScrollTrigger.create({
        trigger: '.x-why', start: 'top 82%', end: 'bottom 64%',
        onUpdate: (self) => drive(self.progress)
      });
      return () => { st.kill(); disarm(); };
    });
  }

  /* ================= AUDIENCE PATHS — reveal + slide into place ================= */
  $$('.x-path').forEach((el, i) => gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    y: 44, opacity: 0, scale: 0.985, duration: 0.75, ease: 'power3.out', delay: i * 0.08
  }));
  // elegant mouse-follow spotlight on the path cards (no tilt — clean, premium)
  if (hover) $$('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ================= FOUNDER — word-by-word quote, then signature ================= */
  const fq = $('.x-founder blockquote');
  if (fq && typeof SplitType !== 'undefined') {
    const fs = new SplitType(fq, { types: 'words' });
    gsap.from(fs.words, {
      scrollTrigger: { trigger: fq, start: 'top 78%', once: true },
      opacity: 0.12, duration: 0.6, ease: 'none', stagger: 0.03
    });
  }
  reveal($$('.x-founder-sign'), { x: 24, y: 0, delay: 0, duration: 0.9,
    scrollTrigger: { trigger: '.x-founder', start: 'top 55%', toggleActions: 'play none none reverse' } });

  /* ================= FINAL CTA — cards animate into the climax ================= */
  $$('.x-finale-cards .fin-card').forEach((el, i) => gsap.from(el, {
    scrollTrigger: { trigger: '.x-finale', start: 'top 72%', toggleActions: 'play none none reverse' },
    y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 + i * 0.1
  }));
  gsap.from('.x-finale .fin-blob', {
    scrollTrigger: { trigger: '.x-finale', start: 'top 80%', toggleActions: 'play none none reverse' },
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
