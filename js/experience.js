/* ==========================================================================
   TALENT EXPERT — Cinematic scroll experience (Home)
   Requires: gsap, ScrollTrigger, Lenis, SplitType (loaded before this file)
   Degrades gracefully: if libs missing or reduced-motion, content stays visible.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (!hasGSAP) return;                    // graceful: plain (visible) page
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');
  }

  /* ---------- Scroll progress rail ---------- */
  const prog = $('#xProgress');
  if (prog) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => gsap.set(prog, { scaleX: self.progress })
    });
  }

  /* ---------- Reduced motion: show a clean static page, no animation ---------- */
  if (reduce) {
    $$('.x-jstep').forEach(s => s.classList.add('on'));
    const railR = $('#rail'); if (railR) railR.classList.add('static');
    const growR = $('.x-title .grow'); if (growR) growR.classList.add('drawn');
    return;
  }

  /* ================= HERO ================= */
  // Kinetic headline
  const title = $('.x-title');
  if (title && typeof SplitType !== 'undefined' && !reduce) {
    const split = new SplitType(title, { types: 'words,chars' });
    gsap.set(title, { opacity: 1 });
    gsap.from(split.chars, {
      yPercent: 118, opacity: 0, rotateX: -40, transformOrigin: '0% 100%',
      stagger: 0.018, duration: 0.9, ease: 'power3.out', delay: 0.15
    });
    const grow = $('.x-title .grow');
    if (grow) gsap.delayedCall(0.15 + split.chars.length * 0.018 + 0.2, () => grow.classList.add('drawn'));
  }
  // Sub / rhythm / actions / stats fade-up
  gsap.from('.x-eyebrow, .x-sub, .x-rhythm, .x-hero .hero-actions, .x-hero-stats', {
    y: 26, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.09, delay: reduce ? 0 : 0.5
  });

  // Bridge draw + travelling talent nodes
  const path = $('#bridgePath');
  if (path && path.getTotalLength) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = reduce ? 0 : len;
    if (!reduce) gsap.to(path, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut', delay: 0.4 });
    if (!reduce) {
      $$('#bridgeNodes circle').forEach((n, i) => {
        const o = { t: 0 };
        gsap.to(o, {
          t: 1, duration: 3.6, repeat: -1, ease: 'none', delay: 1 + i * 1.15,
          onUpdate: () => {
            const p = path.getPointAtLength(o.t * len);
            n.setAttribute('cx', p.x); n.setAttribute('cy', p.y);
            n.style.opacity = Math.min(1, Math.min(o.t, 1 - o.t) * 8).toFixed(2);
          }
        });
      });
    }
  }

  // Parallax layers on hero scroll-out + city rise
  if (!reduce) {
    $$('#hero [data-parallax]').forEach((el) => {
      const f = parseFloat(el.dataset.parallax) || 0;
      gsap.to(el, {
        yPercent: f * 42, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    });
    gsap.fromTo('#xCity', { scaleY: 0.86, opacity: 0.65 }, {
      scaleY: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'center top', scrub: true }
    });
    // Cursor drift (hero content + stat cards)
    const driftEls = $$('#hero [data-drift]').map(el => ({ el, f: parseFloat(el.dataset.drift), x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }) }));
    const hero = $('#hero');
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2), dy = (e.clientY - r.top - r.height / 2);
      driftEls.forEach(d => { d.x(dx * d.f * 0.12); d.y(dy * d.f * 0.12); });
    });
    hero.addEventListener('mouseleave', () => driftEls.forEach(d => { d.x(0); d.y(0); }));
    // Sun gentle float
    gsap.to('#xSun', { y: -14, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ============ matchMedia: heavy pinned scenes (desktop only) ============ */
  const mm = gsap.matchMedia();

  mm.add('(min-width:821px) and (prefers-reduced-motion: no-preference)', () => {
    /* ---- Pinned Journey: Discover / Develop / Sustain ---- */
    const jSteps = $$('.x-jstep');
    const jFill = $('#jFill');
    ScrollTrigger.create({
      trigger: '#journey', start: 'top top', end: '+=1700',
      pin: '.x-journey-pin', scrub: true,
      onUpdate: (self) => {
        gsap.set(jFill, { scaleX: self.progress });
        const active = Math.min(jSteps.length - 1, Math.floor(self.progress * jSteps.length + 0.001));
        jSteps.forEach((s, i) => s.classList.toggle('on', i <= active));
      }
    });

    /* ---- Horizontal rail: What We Do ---- */
    const track = $('#railTrack');
    const dots = $$('#railDots i');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    ScrollTrigger.create({
      trigger: '#rail', start: 'top top', end: () => '+=' + (distance() + window.innerHeight * 0.4),
      pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(track, { x: -distance() * self.progress });
        const idx = Math.round(self.progress * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('on', i === idx));
      }
    });

    return () => { gsap.set(track, { x: 0 }); jSteps.forEach(s => s.classList.add('on')); };
  });

  // Mobile: make journey steps all visible (no pin)
  mm.add('(max-width:820px)', () => { $$('.x-jstep').forEach(s => s.classList.add('on')); });

  /* ============ Universal reveals (all viewports) ============ */
  // Why-choose items stagger
  gsap.from('.x-why-item', {
    scrollTrigger: { trigger: '.x-why-list', start: 'top 78%' },
    y: 40, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12
  });
  gsap.from('.x-why-sticky > *', {
    scrollTrigger: { trigger: '.x-why-sticky', start: 'top 80%' },
    y: 26, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08
  });

  // Generic data-reveal
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
  });

  // Split-panel paths pop
  gsap.from('.x-path', {
    scrollTrigger: { trigger: '.x-paths', start: 'top 80%' },
    y: 50, opacity: 0, scale: 0.98, duration: 0.8, ease: 'power3.out', stagger: 0.14
  });

  // Founder: word-by-word fade
  const fq = $('.x-founder blockquote');
  if (fq && typeof SplitType !== 'undefined') {
    const fs = new SplitType(fq, { types: 'words' });
    gsap.from(fs.words, {
      scrollTrigger: { trigger: fq, start: 'top 75%' },
      opacity: 0.12, duration: 0.6, ease: 'none', stagger: 0.03
    });
  }

  /* ============ Magnetic buttons ============ */
  if (!reduce && matchMedia('(hover:hover)').matches) {
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
  }

  /* ---- keep ScrollTrigger in sync after fonts/images/load ---- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
