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

  /* ---------- Load the exact uploaded temple illustration (used in both paths) ---------- */
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

  /* ---------- Reduced motion: show a clean static page, no animation ---------- */
  if (reduce) {
    $$('.x-who .wp, .x-who .ddd-stage').forEach(e => e.classList.add('on'));
    const railR = $('#rail'); if (railR) railR.classList.add('static');
    const growR = $('.x-title .grow'); if (growR) growR.classList.add('drawn');
    const t = $('#xTemple'); if (t) t.style.setProperty('--apex', 0.34);
    loadTempleImg();
    return;
  }

  /* ================= HERO — kinetic headline + temple reveal + rising stats ============ */
  // Kinetic headline
  const title = $('.x-title');
  if (title && typeof SplitType !== 'undefined') {
    const split = new SplitType(title, { types: 'words,chars' });
    gsap.set(title, { opacity: 1 });
    gsap.from(split.chars, {
      yPercent: 118, opacity: 0, rotateX: -40, transformOrigin: '0% 100%',
      stagger: 0.018, duration: 0.9, ease: 'power3.out', delay: 0.1
    });
    const grow = $('.x-title .grow');
    if (grow) gsap.delayedCall(0.1 + split.chars.length * 0.018 + 0.2, () => grow.classList.add('drawn'));
  }
  // Eyebrow / sub / rhythm / actions fade-up
  gsap.from('.x-eyebrow, .x-sub, .x-rhythm, .x-hero .hero-actions', {
    y: 26, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.09, delay: 0.45
  });

  /* ===== TRUST STATISTICS — temple (exact uploaded asset) + synchronized counters ===== */
  const temple = $('#xTemple');
  if (temple) {
    const media = $('.x-temple-media', temple);

    // 1) Load the EXACT uploaded illustration; it takes over the fallback SVG on success.
    loadTempleImg();

    // 2) Counter helper — counts a number up and formats with commas when asked.
    const runCount = (el) => {
      const target = +el.dataset.count || 0;
      const comma = el.hasAttribute('data-comma');
      const o = { v: 0 };
      gsap.to(o, {
        v: target, duration: 1.35, ease: 'power2.out',
        onUpdate() {
          const n = Math.round(o.v);
          el.textContent = comma ? n.toLocaleString('en-IN') : n;
        }
      });
    };

    // 3) Choreographed entry: temple illustration fades in first → tagline →
    //    counters animate left-to-right (once) → apex glow blooms → settle.
    const lead = $('.x-trust-quote');
    gsap.set(temple, { autoAlpha: 0 });
    if (lead) gsap.set(lead, { autoAlpha: 0, y: 20 });
    gsap.set('.x-stat', { autoAlpha: 0, y: 24 });
    gsap.set(temple, { '--amb': 0.12, '--apex': 0, '--ly': '58%', '--tglow': 0.05 });

    const stats = $$('.x-stat');
    const tl = gsap.timeline({ delay: 0.5 });
    tl.to(temple, { autoAlpha: 1, duration: 1.0, ease: 'power2.out' })
      .to(temple, { '--amb': 0.4, duration: 1.0, ease: 'sine.out' }, '<');
    if (lead) tl.to(lead, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.6');
    stats.forEach((st, idx) => {
      const num = $('.num', st);
      tl.to(st, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, idx === 0 ? '-=0.2' : '-=0.3')
        .add(() => { if (num) runCount(num); }, '<+0.04')          // count 0 -> value, once
        .to(temple, { '--apex': 0.16 + idx * 0.13, '--tglow': 0.08 + idx * 0.04, '--ly': (58 - idx * 5) + '%', duration: 0.8, ease: 'sine.out' }, '<');
    });
    tl.to(temple, { '--apex': 0.46, duration: 0.5, ease: 'sine.out' })
      .to(temple, { '--apex': 0.3, '--amb': 0.36, duration: 0.9, ease: 'sine.inOut' });

    // 4) Subtle parallax on the illustration (driven from the whole card).
    const host = $('#trust') || temple.parentElement;
    if (host && matchMedia('(hover:hover)').matches) {
      let raf = 0, mx = 0, my = 0;
      host.addEventListener('pointermove', (e) => {
        const r = host.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; gsap.to(media, { x: mx * 6, y: my * 5, duration: 0.6, ease: 'power2.out', overwrite: 'auto' }); });
      });
      host.addEventListener('pointerleave', () => gsap.to(media, { x: 0, y: 0, duration: 0.7, ease: 'power2.out', overwrite: 'auto' }));
    }

    // 5) Gentle layered parallax as the hero scrolls away.
    gsap.to(temple, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.x-stats', { yPercent: 3, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ============ matchMedia: heavy pinned scenes (desktop only) ============ */
  /* Reusable one-at-a-time stage: outgoing panel fully exits BEFORE incoming enters
     (no overlap, ever). Queues the latest target while a transition is in flight. */
  function makeStage(panels, onChange) {
    let cur = 0, animating = false, pending = null;
    gsap.set(panels, { autoAlpha: 0, y: 22 });
    gsap.set(panels[0], { autoAlpha: 1, y: 0 });
    if (onChange) onChange(0);
    const go = (i) => {
      i = Math.max(0, Math.min(panels.length - 1, i));
      if (i === cur) return;
      if (animating) { pending = i; return; }
      animating = true;
      const outEl = panels[cur], inEl = panels[i]; cur = i;
      if (onChange) onChange(i);
      gsap.timeline({ onComplete() { animating = false; if (pending !== null) { const p = pending; pending = null; go(p); } } })
        .to(outEl, { autoAlpha: 0, y: -18, duration: 0.3, ease: 'power2.in' })
        .fromTo(inEl, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '+=0.07');
    };
    return { go, reset: () => gsap.set(panels, { clearProps: 'all' }), get index() { return cur; } };
  }

  const mm = gsap.matchMedia();

  mm.add('(min-width:821px) and (prefers-reduced-motion: no-preference)', () => {
    /* ---- Pinned Who We Are: progressive story + Discover/Develop/Sustain ---- */
    const wps = $$('.x-who .wp');
    const stages = $$('.x-who .ddd-stage');
    const N = Math.max(wps.length, stages.length);
    ScrollTrigger.create({
      trigger: '#journey', start: 'top top', end: '+=1900',
      pin: '.x-who-pin', scrub: true,
      onUpdate: (self) => {
        const active = Math.min(N - 1, Math.floor(self.progress * N + 0.0001));
        wps.forEach((w, i) => w.classList.toggle('on', i === active));       // active paragraph is the focus
        stages.forEach((s, i) => {
          s.classList.toggle('on', i === active);                            // matching step lights up
          s.classList.toggle('reached', i < active);                         // completed connectors fill orange
        });
      }
    });

    /* ---- What We Do: sticky-left / changing-right, one level at a time ---- */
    const doPanels = $$('#doStage .do-panel');
    const doTrackLis = $$('#doTrack li');
    const doStage = makeStage(doPanels, (i) => doTrackLis.forEach((li, k) => li.classList.toggle('on', k === i)));
    doTrackLis.forEach((li, i) => li.addEventListener('click', () => doStage.go(i)));
    ScrollTrigger.create({
      trigger: '#rail', start: 'top top', end: '+=' + (doPanels.length * 320),
      pin: '.x-do-pin', scrub: 0.35,
      onUpdate: (self) => doStage.go(Math.min(doPanels.length - 1, Math.floor(self.progress * doPanels.length * 0.999)))
    });

    return () => {
      wps.forEach(w => w.classList.add('on')); stages.forEach(s => s.classList.add('on'));
      doStage.reset();
    };
  });

  // Mobile: reveal all Who-We-Are content (no pin)
  mm.add('(max-width:820px)', () => { $$('.x-who .wp, .x-who .ddd-stage').forEach(e => e.classList.add('on')); });

  /* ============ Universal reveals (all viewports) ============ */
  // Generic data-reveal
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
  });

  // Split-panel paths — reveal each card as it enters (no dead zone)
  $$('.x-path').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 92%' },
      y: 44, opacity: 0, scale: 0.985, duration: 0.75, ease: 'power3.out', delay: i * 0.08
    });
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

  /* ============ Interactive cards — cursor glow + 3D tilt ============ */
  if (matchMedia('(hover:hover)').matches) {
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

  /* ============ WHY CHOOSE US — pinned spotlight, one proof at a time (no overlap) ============ */
  const whyStage = $('#whyStage');
  if (whyStage) {
    const proofs = $$('.proof', whyStage);
    const wNodes = $$('#whyNodes button');
    const wStage = makeStage(proofs, (i) => wNodes.forEach((n, k) => n.classList.toggle('on', k === i)));
    wNodes.forEach((n, i) => n.addEventListener('click', () => wStage.go(i)));
    mm.add('(min-width:821px)', () => {
      const st = ScrollTrigger.create({
        trigger: '#why', start: 'top top', end: '+=' + (proofs.length * 320), pin: '.x-why-pin', scrub: 0.4,
        onUpdate: (self) => wStage.go(Math.min(proofs.length - 1, Math.floor(self.progress * proofs.length * 0.999)))
      });
      return () => { st.kill(); wStage.reset(); };
    });
    // mobile: swipe through proofs
    let wsx = 0, wsy = 0;
    whyStage.addEventListener('touchstart', (e) => { wsx = e.touches[0].clientX; wsy = e.touches[0].clientY; }, { passive: true });
    whyStage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - wsx, dy = e.changedTouches[0].clientY - wsy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) wStage.go((wStage.index + (dx < 0 ? 1 : -1) + proofs.length) % proofs.length);
    });
  }

  /* ---- keep ScrollTrigger in sync after fonts/images/load ---- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
