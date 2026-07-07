/* ==========================================================================
   TALENT EXPERT — Home cinematic layer (NATIVE scroll)
   Requires: gsap, ScrollTrigger, SplitType.  (Lenis intentionally removed —
   the page uses the browser's native scroll for instant, fluid response.)
   Every section animates on enter with GPU transforms only (opacity/translate/
   scale). No pinning, no scroll hijacking, no layout-changing properties.
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
    $$('.x-who .wp, .x-who .ddd-stage').forEach(e => e.classList.add('on'));
    $$('.x-who .ddd-stage').forEach(e => e.classList.add('reached'));
    $$('.do-panel').forEach(e => e.classList.add('focus'));
    $$('.proof').forEach(e => e.classList.add('in'));
    const grow = $('.x-title .grow'); if (grow) grow.classList.add('drawn');
    loadTempleImg();
  }

  if (!hasGSAP || reduce) { revealAllStatic(); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---- Scroll progress bar ---- */
  const prog = $('#xProgress');
  if (prog) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => gsap.set(prog, { scaleX: self.progress }) });

  /* ---- Environmental temple backdrop drifts subtly through the whole page ---- */
  const pageTemple = $('#pageTemple');
  if (pageTemple) gsap.to(pageTemple, {
    yPercent: 9, ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
  });

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
    gsap.to('.x-temple-media', { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
    gsap.to('.x-hero-content', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
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

  /* ================= Generic reveal helper (GPU transforms, replays on scroll) ================= */
  const reveal = (els, opts) => els.forEach((el, i) => gsap.from(el, Object.assign({
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    y: 34, opacity: 0, duration: 0.8, ease: 'power2.out', delay: (i % 4) * 0.05
  }, opts)));

  // section headings + supporting blocks
  reveal($$('.x-who-head'));
  reveal($$('.x-why-head'));
  reveal($$('.x-do-left .eyebrow, .x-do-left .title, .x-do-left .lead'), { y: 24, delay: 0 });
  reveal($$('.x-finale-copy > *'), { y: 26 });

  /* ================= WHO WE ARE — progressive paragraphs + timeline (no pin) ================= */
  $$('.x-who .wp').forEach((w) => {
    ScrollTrigger.create({
      trigger: w, start: 'top 84%',
      onEnter: () => w.classList.add('on'),
      onLeaveBack: () => w.classList.remove('on')   // replays as you scroll back up
    });
  });
  const stages = $$('.x-who .ddd-stage');
  if (stages.length) {
    // non-pinned scrub over the timeline column: each step lights up, connectors fill
    ScrollTrigger.create({
      trigger: '.x-who-ddd', start: 'top 74%', end: 'bottom 62%', scrub: true,
      onUpdate: (self) => {
        const active = Math.min(stages.length - 1, Math.floor(self.progress * stages.length + 0.0001));
        stages.forEach((s, i) => { s.classList.toggle('on', i <= active); s.classList.toggle('reached', i < active); });
      }
    });
    // ensure the first is lit as soon as the section arrives
    ScrollTrigger.create({ trigger: '.x-who-ddd', start: 'top 80%', once: true, onEnter: () => stages[0].classList.add('on') });
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

  /* ================= WHY CHOOSE US — cards enter 1..6 in sequence (replays on scroll) ================= */
  const proofs = $$('.x-why .proof');
  if (proofs.length) {
    let timers = [];
    ScrollTrigger.create({
      trigger: '.x-why-stage', start: 'top 84%',
      onEnter: () => { timers.forEach(clearTimeout); timers = proofs.map((el, i) => setTimeout(() => el.classList.add('in'), i * 115)); },
      onLeaveBack: () => { timers.forEach(clearTimeout); proofs.forEach((el) => el.classList.remove('in')); }
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
