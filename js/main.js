/* ==========================================================================
   TALENT EXPERT — Shared behaviour
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Sticky nav shadow ---- */
  const nav = $('#nav');
  if (nav) addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 30);
  }, { passive: true });

  /* ---- Mobile menu ---- */
  const mnav = $('#mnav');
  window.toggleMenu = (open) => { if (mnav) mnav.classList.toggle('open', open); };
  $$('#mnav a').forEach(a => a.addEventListener('click', () => window.toggleMenu(false)));

  /* ---- Instant in-page navigation --------------------------------------
     CTAs, navbar dropdown items and anchor links jump STRAIGHT to their
     section instead of smooth-scrolling through every pinned scene (which
     would fast-forward all the scroll-triggered animations). Uses the shared
     Lenis instance if the page has one, else a one-off auto-scroll. Manual
     scrolling keeps the full storytelling. */
  const samePageHash = (a) => {
    const href = a.getAttribute('href') || '';
    if (!href) return null;
    if (href.charAt(0) === '#') return href.length > 1 ? href : null;
    try {
      const u = new URL(a.href, location.href);
      if (u.pathname === location.pathname && u.host === location.host && u.hash.length > 1) return u.hash;
    } catch (_) {}
    return null;
  };
  const jumpTo = (hash) => {
    let el; try { el = document.querySelector(hash); } catch (_) { return false; }
    if (!el) return false;
    const lenis = window.__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(el, { immediate: true, force: true });
    } else {
      const root = document.documentElement, prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, el.getBoundingClientRect().top + (window.pageYOffset || root.scrollTop || 0));
      root.style.scrollBehavior = prev;
    }
    if (window.ScrollTrigger && typeof window.ScrollTrigger.update === 'function') window.ScrollTrigger.update();
    return true;
  };
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank') return;
    const hash = samePageHash(a);
    if (!hash) return;
    let el; try { el = document.querySelector(hash); } catch (_) { return; }
    if (!el) return;
    e.preventDefault();
    if (mnav && mnav.classList.contains('open')) window.toggleMenu(false);
    jumpTo(hash);
    try { history.pushState(null, '', hash); } catch (_) {}
  }, false);
  /* Arriving with a hash (e.g. a cross-page CTA): jump cleanly once layout +
     pins have settled, so the page doesn't animate through to the target. */
  if (location.hash && location.hash.length > 1) {
    addEventListener('load', () => {
      const h = location.hash;
      setTimeout(() => { try { if (document.querySelector(h)) jumpTo(h); } catch (_) {} }, 400);
    });
  }

  /* ---- Reveal on scroll (replays) ---- */
  const revO = new IntersectionObserver(es => {
    es.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0.14 });
  $$('.reveal').forEach(el => revO.observe(el));

  /* ---- Animated counters ---- */
  function animCount(el) {
    const target = +el.dataset.count, suf = el.dataset.suffix || '', comma = el.dataset.comma;
    const dur = 1500, t0 = performance.now();
    (function tick(now) {
      let p = Math.min((now - t0) / dur, 1);
      p = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * p);
      el.textContent = (comma ? v.toLocaleString('en-IN') : v) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  $$('[data-statgroup]').forEach(group => {
    new IntersectionObserver((es, o) => {
      es.forEach(e => {
        if (e.isIntersecting) {
          $$('.stat-num', e.target).forEach(animCount);
        } else {
          $$('.stat-num', e.target).forEach(n => n.textContent = '0');
        }
      });
    }, { threshold: 0.4 }).observe(group);
  });

  /* ---- Values roadmap: tap-to-expand on touch ---- */
  const road = $('#road');
  if (road && matchMedia('(hover:none)').matches) {
    const cards = $$('.road-card', road);
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const item = card.closest('.road-item');
        const wasOpen = card.classList.contains('open');
        cards.forEach(c => { c.classList.remove('open'); c.closest('.road-item').classList.remove('open'); });
        if (!wasOpen) { card.classList.add('open'); item.classList.add('open'); }
      });
    });
  }

  /* ---- Services radial reveal ---- */
  const svc = $('#svcFloat');
  if (svc) {
    const nodes = $$('.svc-node', svc);
    nodes.forEach(n => { n.style.opacity = 0; n.style.transition = 'opacity .7s var(--ease)'; });
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) nodes.forEach((n, i) => { n.style.transitionDelay = (i * 0.1) + 's'; n.style.opacity = 1; });
    }), { threshold: 0.25 }).observe(svc);
  }

  /* ---- Industries marquee: duplicate for seamless loop ---- */
  const marq = $('#marqRow');
  if (marq) marq.innerHTML += marq.innerHTML;

  /* ---- Hiring-model switch ---- */
  $$('[data-hm-switch]').forEach(sw => {
    const faces = $$('.hm-face', sw.closest('section') || document);
    $$('button', sw).forEach((btn, i) => btn.addEventListener('click', () => {
      $$('button', sw).forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      faces.forEach(f => f.classList.toggle('on', +f.dataset.i === i));
    }));
  });

  /* ---- FAQ accordion ---- */
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item), a = $('.faq-a', item);
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
    });
  });

  /* ---- Select field "filled" state for floating labels ---- */
  $$('.fld select').forEach(sel => {
    const set = () => sel.closest('.fld').classList.toggle('filled', !!sel.value);
    sel.addEventListener('change', set); set();
  });

  /* ---- Forms → Formspree (progressive enhancement) ---- */
  $$('form[data-formspree]').forEach(form => {
    const msg = $('.form-msg', form);
    const successText = () => {
      const name = ((form.querySelector('[name="name"]') || {}).value || '').trim();
      return (form.dataset.success || 'Thank you! We will be in touch shortly.').replace('{name}', name || 'there');
    };
    const done = (text, ok) => {
      if (msg) { msg.textContent = text; msg.classList.add('show'); }
      if (ok) { form.reset(); $$('.fld', form).forEach(f => f.classList.remove('filled')); }
    };
    form.addEventListener('submit', async (e) => {
      const endpoint = form.getAttribute('action') || '';
      // No real endpoint configured yet → show inline confirmation (demo).
      if (!/formspree\.io\/f\/(?!YOUR_)/.test(endpoint)) {
        e.preventDefault();
        done(successText(), true);
        return;
      }
      // Real Formspree endpoint → submit via fetch for inline success.
      e.preventDefault();
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (res.ok) done(successText(), true);
        else done('Something went wrong. Please call us on +91 95978 51600.', false);
      } catch (_) {
        done('Network error. Please call us on +91 95978 51600.', false);
      }
    });
  });

  /* ---- Audience routing: remember portal choice ---- */
  window.rememberPortal = (type) => {
    try { document.cookie = 'user_type=' + type + ';path=/;max-age=2592000;SameSite=Lax'; } catch (_) {}
  };
  $$('[data-portal-choice]').forEach(el =>
    el.addEventListener('click', () => window.rememberPortal(el.dataset.portalChoice)));

  /* ---- Global ambient cursor glow (site-wide) ---- */
  if (matchMedia('(hover:hover)').matches && !reduce) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let tx = innerWidth / 2, ty = innerHeight / 2, gx = tx, gy = ty, shown = false, raf = 0;
    const tick = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.setProperty('--cx', gx.toFixed(1) + 'px');
      glow.style.setProperty('--cy', gy.toFixed(1) + 'px');
      raf = requestAnimationFrame(tick);
    };
    addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; glow.classList.add('on'); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { shown = false; glow.classList.remove('on'); });
    tick();
  }

  /* ---- Footer year ---- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Footer: cursor-follow glow + magnetic buttons ---- */
  if (matchMedia('(hover:hover)').matches && !reduce) {
    const foot = $('footer.site');
    if (foot) {
      let fraf = 0, fx = 50, fy = 50;
      foot.addEventListener('pointermove', (e) => {
        const r = foot.getBoundingClientRect();
        fx = ((e.clientX - r.left) / r.width) * 100;
        fy = ((e.clientY - r.top) / r.height) * 100;
        if (!fraf) fraf = requestAnimationFrame(() => {
          fraf = 0;
          foot.style.setProperty('--fx', fx + '%');
          foot.style.setProperty('--fy', fy + '%');
        });
      }, { passive: true });
    }
    // Magnetic hover — footer subscribe button only (home hero CTAs are handled
    // by experience.js). Button drifts toward the cursor, springs back on leave.
    $$('.news-btn.magnetic').forEach((btn) => {
      let mraf = 0, dx = 0, dy = 0;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        dx = ((e.clientX - r.left) / r.width - 0.5) * 14;
        dy = ((e.clientY - r.top) / r.height - 0.5) * 10;
        if (!mraf) mraf = requestAnimationFrame(() => {
          mraf = 0; btn.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
        });
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }
})();
