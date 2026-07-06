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
    $$('.x-who .wp, .x-who .ddd-stage').forEach(e => e.classList.add('on'));
    const railR = $('#rail'); if (railR) railR.classList.add('static');
    const growR = $('.x-title .grow'); if (growR) growR.classList.add('drawn');
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

  // Temple: build up from the ground (clip reveal) + outline draw + gentle parallax
  const temple = $('#xTemple');
  if (temple) {
    gsap.fromTo(temple, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power2.out', delay: 0.6 });
    const tower = $('.x-tower', temple);
    if (tower && tower.getTotalLength) {
      const L = tower.getTotalLength();
      tower.style.strokeDasharray = L; tower.style.strokeDashoffset = L;
      gsap.to(tower, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', delay: 0.7 });
    }
    // stats fade + rise into place (no counting)
    gsap.from('.x-stat', { y: 34, opacity: 0, duration: 0.85, ease: 'power2.out', stagger: 0.13, delay: 0.85 });
    // subtle layered parallax as the hero scrolls away
    gsap.to(temple, { yPercent: -7, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.x-stats', { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ============ matchMedia: heavy pinned scenes (desktop only) ============ */
  const mm = gsap.matchMedia();

  mm.add('(min-width:821px) and (prefers-reduced-motion: no-preference)', () => {
    /* ---- Pinned Who We Are: progressive story + Discover/Develop/Sustain ---- */
    const wps = $$('.x-who .wp');
    const stages = $$('.x-who .ddd-stage');
    const dddFill = $('#dddFill');
    ScrollTrigger.create({
      trigger: '#journey', start: 'top top', end: '+=1900',
      pin: '.x-who-pin', scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        wps.forEach((w, i) => w.classList.toggle('on', p >= i / wps.length - 0.03));
        const active = Math.min(stages.length - 1, Math.floor(p * stages.length + 0.001));
        stages.forEach((s, i) => s.classList.toggle('on', i <= active));
        if (dddFill) dddFill.style.height = (p * 100) + '%';
      }
    });

    /* ---- Horizontal rail: What We Do ---- */
    const track = $('#railTrack');
    const dots = $$('#railDots i');
    const cards = $$('.x-rail-card', track);
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    ScrollTrigger.create({
      trigger: '#rail', start: 'top top', end: () => '+=' + (distance() + window.innerHeight * 0.4),
      pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(track, { x: -distance() * self.progress });
        // emphasise the card nearest the viewport centre
        const cx = window.innerWidth / 2;
        let best = 0, bestD = Infinity;
        cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - cx); if (d < bestD) { bestD = d; best = i; } });
        cards.forEach((c, i) => c.classList.toggle('focus', i === best));
        dots.forEach((d, i) => d.classList.toggle('on', i === best));
      }
    });

    return () => { gsap.set(track, { x: 0 }); wps.forEach(w => w.classList.add('on')); stages.forEach(s => s.classList.add('on')); };
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

  /* ============ THE GAP — kinetic mission reveal ============ */
  const gap = $('#gap');
  if (gap) {
    const gtl = gsap.timeline({ scrollTrigger: { trigger: gap, start: 'top 62%' } });
    gtl.from('[data-gap="k"]', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
       .from('[data-gap="head"]', { y: 34, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2')
       .from('[data-gap="pillar"]', { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.15 }, '-=0.2')
       .from('[data-gap="close"]', { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.1');
    // draw connecting line + spark travels across
    const gp = $('#gapPath'), spark = $('#gapSpark');
    if (gp && gp.getTotalLength) {
      const L = gp.getTotalLength();
      gp.style.strokeDasharray = L; gp.style.strokeDashoffset = L;
      ScrollTrigger.create({
        trigger: gap, start: 'top 55%',
        onEnter: () => {
          gsap.to(gp, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.5 });
          const o = { t: 0 };
          gsap.to(o, {
            t: 1, duration: 1.2, ease: 'power2.inOut', delay: 0.5,
            onUpdate: () => { const p = gp.getPointAtLength(o.t * L); spark.setAttribute('cx', p.x); spark.setAttribute('cy', p.y); }
          });
        }, once: true
      });
    }
  }

  /* ============ WHY CHOOSE US — scroll-driven proof-point spotlight ============ */
  const whyStage = $('#whyStage');
  if (whyStage) {
    const proofs = $$('.proof', whyStage);
    const wDots = $('#whyDots');
    let wcur = 0;
    proofs.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Reason ' + (i + 1)); wDots.appendChild(b); });
    const wdotEls = $$('button', wDots);
    const wshow = (i) => {
      if (i === wcur) return;
      wcur = i;
      proofs.forEach((p, k) => p.classList.toggle('on', k === i));
      wdotEls.forEach((d, k) => d.classList.toggle('on', k === i));
    };
    proofs.forEach((p, k) => p.classList.toggle('on', k === 0)); wdotEls[0].classList.add('on');
    wdotEls.forEach((d, i) => d.addEventListener('click', () => wshow(i)));
    // desktop: pin section and advance proofs with scroll
    mm.add('(min-width:821px)', () => {
      const st = ScrollTrigger.create({
        trigger: '#why', start: 'top top', end: '+=' + (proofs.length * 300), pin: '.x-why-pin', scrub: 0.4,
        onUpdate: (self) => wshow(Math.min(proofs.length - 1, Math.floor(self.progress * proofs.length * 0.999)))
      });
      return () => st.kill();
    });
    // mobile: stack all (handled by CSS) — no pin
    let wsx = 0, wsy = 0;
    whyStage.addEventListener('touchstart', (e) => { wsx = e.touches[0].clientX; wsy = e.touches[0].clientY; }, { passive: true });
    whyStage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - wsx, dy = e.changedTouches[0].clientY - wsy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) wshow((wcur + (dx < 0 ? 1 : -1) + proofs.length) % proofs.length);
    });
  }

  /* ============ VOICES — scroll-driven stories (desktop) / swipe (mobile) ============ */
  const stage = $('#voiceStage');
  if (stage) {
    const voices = $$('.x-voice', stage);
    const dotWrap = $('#voiceDots');
    let cur = 0;
    voices.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Story ' + (i + 1));
      dotWrap.appendChild(b);
    });
    const dots = $$('button', dotWrap);
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      voices.forEach((v, k) => v.classList.toggle('on', k === i));
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
    };
    dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
    voices.forEach((v, k) => v.classList.toggle('on', k === 0)); dots[0].classList.add('on');
    // desktop: pin the section and advance stories with scroll
    mm.add('(min-width:821px)', () => {
      const st = ScrollTrigger.create({
        trigger: '#voices', start: 'top top', end: '+=' + (voices.length * 320), pin: true, scrub: 0.4,
        onUpdate: (self) => show(Math.min(voices.length - 1, Math.floor(self.progress * voices.length * 0.999)))
      });
      return () => st.kill();
    });
    // mobile: swipe
    let sx = 0, sy = 0;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show((cur + (dx < 0 ? 1 : -1) + voices.length) % voices.length);
    });
  }

  /* ---- keep ScrollTrigger in sync after fonts/images/load ---- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
