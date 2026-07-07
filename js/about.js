/* ==========================================================================
   TALENT EXPERT — About page motion layer
   Vision & Mission = pinned, scrub-driven storytelling (per CLAUDE.md +
   docs/animation-system.md). Lenis + GSAP + ScrollTrigger. Fully reversible.
   Reduced-motion / no-GSAP: early return — CSS defaults already show the
   final (revealed) state.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (!hasGSAP || reduce) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---- Smooth scroll (same engine as the home page) ---- */
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis-on');
  }

  /* ================= VISION & MISSION ================= */
  const sec = $('#vision');
  if (sec) {
    const cards = $$('.feat-card', sec);
    const vCard = cards[0], mCard = cards[1];
    const eye = $('.vm-eye', sec), glow = $('.vm-glow', sec);
    const smoke = $('.vm-smoke', sec), rocket = $('.vm-rocket-ic', sec), flame = $('.vm-flame', sec);
    const sparks = $$('.vm-spark', sec);
    const vP = vCard ? $('.vm-p', vCard) : null;
    const mP = mCard ? $('.vm-p', mCard) : null;
    const aura = $('.vm-aura', sec), temple = $('.vm-temple', sec);

    // initial (pre-reveal) state: eye closed, text out of focus, rocket behind smoke
    const arm = () => {
      if (eye) gsap.set(eye, { '--open': 0 });
      if (glow) gsap.set(glow, { '--glow': 0 });
      if (vP) gsap.set(vP, { opacity: 0.12, filter: 'blur(6px)', y: 14, letterSpacing: '0.05em' });
      if (smoke) gsap.set(smoke, { '--smoke': 1 });
      if (rocket) gsap.set(rocket, { '--rocket': 0.16, '--lift': '0px' });
      if (flame) gsap.set(flame, { '--flame': 0 });
      if (sparks.length) gsap.set(sparks, { opacity: 0, x: 0, y: 0 });
      if (mP) gsap.set(mP, { opacity: 0.12, filter: 'blur(6px)', y: 14, letterSpacing: '0.05em' });
    };
    // final (fully revealed) state — mobile + cleanup
    const show = () => {
      if (eye) gsap.set(eye, { '--open': 1 });
      if (glow) gsap.set(glow, { '--glow': 0 });
      if (vP) gsap.set(vP, { opacity: 1, filter: 'blur(0px)', y: 0, letterSpacing: '0em' });
      if (smoke) gsap.set(smoke, { '--smoke': 0 });
      if (rocket) gsap.set(rocket, { '--rocket': 1, '--lift': '0px' });
      if (flame) gsap.set(flame, { '--flame': 0 });
      if (sparks.length) gsap.set(sparks, { opacity: 0 });
      if (mP) gsap.set(mP, { opacity: 1, filter: 'blur(0px)', y: 0, letterSpacing: '0em' });
    };

    const mm = gsap.matchMedia();

    // Desktop: pin + scrub. Vision (eye opens, text focuses) → Mission (smoke
    // disperses, rocket ignites & lifts, text resolves). Reverses perfectly.
    mm.add('(min-width:821px)', () => {
      arm();
      if (aura) gsap.set(aura, { xPercent: -50, yPercent: -50 });
      const tl = gsap.timeline({ scrollTrigger: {
        trigger: '#vision', start: 'top top', end: '+=1900',
        pin: true, invalidateOnRefresh: true, scrub: 0.5
      } });

      // ---- VISION (~0.05 .. 0.46): eye opens, golden glow awakens, text comes into focus
      tl.to(eye, { '--open': 1, ease: 'power2.out', duration: 0.15 }, 0.05)
        .to(glow, { '--glow': 1, ease: 'sine.out', duration: 0.11 }, 0.12)
        .to(glow, { '--glow': 0.1, ease: 'sine.inOut', duration: 0.16 }, 0.26)
        .to(vP, { opacity: 1, filter: 'blur(0px)', y: 0, letterSpacing: '0em', ease: 'power2.out', duration: 0.22 }, 0.2);

      // ---- MISSION (~0.52 .. 0.94): smoke disperses, rocket ignites + lifts, text resolves
      tl.to(smoke, { '--smoke': 0, ease: 'power2.out', duration: 0.18 }, 0.52)
        .to(rocket, { '--rocket': 1, ease: 'power2.out', duration: 0.16 }, 0.56)
        .to(flame, { '--flame': 1, ease: 'sine.out', duration: 0.12 }, 0.66)
        .to(rocket, { '--lift': '-5px', ease: 'sine.inOut', duration: 0.2 }, 0.68)
        .to(sparks, { opacity: 0.9, x: (i) => (i - 1) * 5, y: (i) => 8 + i * 3, ease: 'power1.out', duration: 0.1, stagger: 0.02 }, 0.68)
        .to(sparks, { opacity: 0, ease: 'power1.in', duration: 0.14 }, 0.8)
        .to(mP, { opacity: 1, filter: 'blur(0px)', y: 0, letterSpacing: '0em', ease: 'power2.out', duration: 0.22 }, 0.66);

      // ---- ambient: warm aura drifts vision→mission, temple drifts slowly
      if (aura) tl.fromTo(aura, { x: -150 }, { x: 150, ease: 'none', duration: 1 }, 0);
      if (temple) tl.fromTo(temple, { yPercent: 4 }, { yPercent: -6, ease: 'none', duration: 1 }, 0);

      // subtle idle float + shadow breathe (independent of the scrub)
      const floats = [vCard, mCard].filter(Boolean).map((c, i) =>
        gsap.to(c, { y: '-=3', duration: 2.6 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.35 }));

      return () => { if (tl.scrollTrigger) tl.scrollTrigger.kill(); tl.kill(); floats.forEach((f) => f.kill()); show(); };
    });

    // Mobile: no pin — show the revealed state (a light reveal handles entrance)
    mm.add('(max-width:820px)', () => {
      show();
      const t = gsap.from([vP, mP].filter(Boolean), {
        opacity: 0.15, filter: 'blur(5px)', y: 14, ease: 'power2.out', duration: 0.6, stagger: 0.12,
        scrollTrigger: { trigger: '#vision', start: 'top 78%' }
      });
      return () => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); show(); };
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
