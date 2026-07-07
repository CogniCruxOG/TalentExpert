/* ==========================================================================
   TALENT EXPERT — About page motion layer
   Vision & Mission storytelling. Lenis smooth scroll (same engine as home) +
   a single TIMED timeline that PLAYS when the section scrolls into view and
   REVERSES when it scrolls back out. Deliberately NOT pinned and NOT scrubbed
   (that felt stuck / overloaded low-end GPUs). GPU-cheap: transform + opacity
   + CSS vars + a tiny clip-path only — no blur / mix-blend / layout props.
   Reduced-motion / no-GSAP: early return; CSS defaults show the final state.
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

  /* ================= VISION & MISSION — play-on-enter, reverses on exit ================= */
  const sec = $('#vision');
  if (sec) {
    const cards = $$('.feat-card', sec);
    const vCard = cards[0], mCard = cards[1];
    const eye = $('.vm-eye', sec), glow = $('.vm-glow', sec);
    const smoke = $('.vm-smoke', sec), rocket = $('.vm-rocket-ic', sec), flame = $('.vm-flame', sec);
    const sparks = $$('.vm-spark', sec);
    const vP = vCard ? $('.vm-p', vCard) : null;
    const mP = mCard ? $('.vm-p', mCard) : null;
    const aura = $('.vm-aura', sec);

    // ---- initial (pre-reveal) state ----
    gsap.set([vCard, mCard].filter(Boolean), { opacity: 0, y: 34, scale: 0.965 });
    if (eye) gsap.set(eye, { '--open': 0 });
    if (glow) gsap.set(glow, { '--glow': 0 });
    if (vP) gsap.set(vP, { opacity: 0, y: 14, scale: 0.99 });
    if (smoke) gsap.set(smoke, { '--smoke': 1 });
    if (rocket) gsap.set(rocket, { '--rocket': 0.16, '--lift': '0px' });
    if (flame) gsap.set(flame, { '--flame': 0 });
    if (sparks.length) gsap.set(sparks, { opacity: 0, x: 0, y: 0 });
    if (mP) gsap.set(mP, { opacity: 0, y: 14, scale: 0.99 });
    if (aura) gsap.set(aura, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.9 });

    // ---- one timed timeline; plays in on enter, reverses on leave-back ----
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '#vision', start: 'top 72%', toggleActions: 'play none none reverse' }
    });

    if (aura) tl.to(aura, { opacity: 0.85, scale: 1, duration: 1.3, ease: 'sine.out' }, 0);

    // VISION — card rises in → eye opens → golden glow awakens & settles → text focuses
    tl.to(vCard, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0.0)
      .to(eye, { '--open': 1, duration: 0.75, ease: 'power2.out' }, 0.25)
      .to(glow, { '--glow': 0.85, duration: 0.35, ease: 'sine.out' }, 0.45)
      .to(glow, { '--glow': 0.08, duration: 0.7, ease: 'sine.inOut' }, 0.82)
      .to(vP, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0.55);

    // MISSION — card rises in → smoke clears → rocket ignites, sparks, lifts → text resolves
    tl.to(mCard, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0.34)
      .to(smoke, { '--smoke': 0, duration: 0.8, ease: 'power2.out' }, 0.78)
      .to(rocket, { '--rocket': 1, duration: 0.5, ease: 'power2.out' }, 0.9)
      .to(flame, { '--flame': 1, duration: 0.35, ease: 'sine.out' }, 1.12)
      .to(rocket, { '--lift': '-5px', duration: 0.6, ease: 'power2.out' }, 1.12)
      .to(sparks, { opacity: 0.9, x: (i) => (i - 1) * 5, y: (i) => 10 + i * 3, duration: 0.35, stagger: 0.05, ease: 'power1.out' }, 1.12)
      .to(sparks, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.5)
      .to(mP, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 1.0);
  }

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
