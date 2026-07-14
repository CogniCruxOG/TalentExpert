/* ==========================================================================
   TALENT EXPERT — Shared behaviour
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Heading highlight: only draw the marker once the web font has rendered, so the
     text and its highlight always appear together (never highlight-first). ---- */
  (function () {
    const ready = () => document.documentElement.classList.add('fonts-ready');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
    setTimeout(ready, 1400);            // fallback if fonts.ready never resolves
    addEventListener('load', ready);
  })();

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
  /* Resolve the scroll position to land at. If the section OWNS a pinned ScrollTrigger
     (the storytelling sections — Core Values, Founder's Message, etc.), land at that
     trigger's START so the section arrives at progress 0 (initial state) and its pin +
     scrub play from the beginning. A pinned element's getBoundingClientRect reports its
     FIXED position, so measuring it lands the section pre-completed — using the trigger's
     resolved start avoids that. Non-pinned targets use their normal document position. */
  const targetY = (el) => {
    const ST = window.ScrollTrigger;
    if (ST && typeof ST.getAll === 'function') {
      let best = null;
      ST.getAll().forEach((st) => {
        if (typeof st.start !== 'number') return;
        const trg = st.trigger, pin = st.pin;
        /* This ScrollTrigger "belongs to" the target section if the section IS, contains,
           or is pinned by the trigger/pin element — fully generic, no hard-coded ids, so it
           covers every current and future pinned section automatically. */
        const owns = trg === el || pin === el ||
                     (trg && el.contains && el.contains(trg)) ||
                     (pin && el.contains && el.contains(pin));
        if (!owns) return;
        if (!best) { best = st; return; }
        /* prefer a pinning trigger; among equals, the earliest start = the section's own
           pin engaging at its top = progress 0 */
        const bp = !!best.pin, tp = !!pin;
        if (tp !== bp) { if (tp) best = st; }
        else if (st.start < best.start) best = st;
      });
      if (best) {
        /* Optional per-section "navigation landing state": a section can expose
           data-nav-progress="0..1" to land at that point of its pinned timeline when
           reached via navigation, instead of progress 0. e.g. Core Values uses ~0.91 so
           it arrives with all cards already assembled (readable) — while a natural scroll
           from above still plays the full progressive reveal. Default 0 = initial state. */
        var p = parseFloat(el.getAttribute && el.getAttribute('data-nav-progress'));
        if (!isFinite(p)) p = 0;
        p = Math.max(0, Math.min(1, p));
        var start = best.start;
        var end = (typeof best.end === 'number' && best.end > start) ? best.end : start;
        return Math.round(start + (end - start) * p);
      }
    }
    return Math.round(el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0));
  };
  const jumpTo = (hash) => {
    let el; try { el = document.querySelector(hash); } catch (_) { return false; }
    if (!el) return false;
    const y = targetY(el);
    const lenis = window.__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(y, { immediate: true, force: true });
    } else {
      const root = document.documentElement, prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      root.style.scrollBehavior = prev;
    }
    // Land the destination in its FINISHED state so it's immediately ready to read — full
    // heading, all cards/forms/tables — without needing an extra scroll to trigger it.
    try { if (el && typeof el.__teFinish === 'function') el.__teFinish(); } catch (_) {}
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
  /* Arriving with a hash (cross-page CTA / mega-menu link): the browser would land at
     the pre-pin position and — because the pins grow the page after JS runs — end up on
     the wrong section, or smooth-scroll through them. Cancel that native landing, hold at
     the top, then jump cleanly to the true position ONCE the ScrollTrigger pins/spacers
     have been built — instantly, never animating through the storytelling. */
  if (location.hash && location.hash.length > 1) {
    try { history.scrollRestoration = 'manual'; } catch (_) {}
    const target = location.hash;
    const settleJump = () => { try { if (document.querySelector(target)) jumpTo(target); } catch (_) {} };
    window.scrollTo(0, 0);
    addEventListener('DOMContentLoaded', () => window.scrollTo(0, 0));
    addEventListener('load', () => {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => setTimeout(settleJump, 300));  // after pins are created
      setTimeout(settleJump, 850);                               // safety re-jump for slower inits
    });
  }

  /* ---- Reveal on scroll (replays) ---- */
  const revO = new IntersectionObserver(es => {
    es.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0.14 });
  $$('.reveal').forEach(el => revO.observe(el));

  /* ---- Shared "chapter" section intro (inner pages) ----
     Each configured section pins briefly below the navbar and floats its heading FIRST,
     then its content group, in ONCE (gentle rise + fade + slight scale, small stagger).
     No scrub, no replay. Desktop + motion only; mobile / reduced-motion show everything
     statically. Call from a page's inline script (after its Lenis is set up):
       window.TEChapter([{ sec:'#values', head:'.sec-head', items:'.cv-card', pinTarget:'.cv-pin' }, ...]) */
  /* ---- Auto-fit a full-screen chapter to ANY viewport --------------------------
     A "pin & pause" chapter can only lock if it fits within the screen height. Screens
     vary hugely (resolution, OS display-scaling, browser chrome), so a section that fits
     one laptop overflows another and won't pin there. This measures the section's content
     and, if it's taller than the available height, scales it down just enough to fit —
     using an OUTER wrapper sized to the scaled height (a bare transform:scale doesn't shrink
     layout height, so the section would still read as "too tall"). Written in ES5 style for
     broad browser support. Idempotent + re-runs on every ScrollTrigger refresh (resize). */
  function fitSection(sec) {
    if (!sec) return;
    var outer = sec.firstElementChild;
    if (!outer || !outer.classList || !outer.classList.contains('te-fit-outer')) {
      outer = document.createElement('div'); outer.className = 'te-fit-outer';
      var inner0 = document.createElement('div'); inner0.className = 'te-fit';
      while (sec.firstChild) inner0.appendChild(sec.firstChild);
      outer.appendChild(inner0);
      sec.appendChild(outer);
    }
    var inner = outer.firstElementChild;
    inner.style.transform = ''; outer.style.height = '';     // reset before measuring
    var cs = window.getComputedStyle(sec);
    var reserve = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    var avail = window.innerHeight - reserve - 6;
    // Use the LARGER of scrollHeight and the bounding box — scrollHeight catches content that
    // overflows the wrapper's own box (e.g. a tall form), which the bounding rect misses, so a
    // section that's actually too tall gets scaled down instead of silently refusing to pin.
    var natural = Math.max(inner.scrollHeight, Math.ceil(inner.getBoundingClientRect().height));
    if (natural > avail && avail > 0) {
      var s = avail / natural; if (s < 0.5) s = 0.5;
      inner.style.transform = 'scale(' + s.toFixed(4) + ')';
      outer.style.height = Math.ceil(natural * s) + 'px';
    }
  }
  window.TEFitSection = fitSection;   // exposed so the home engine (experience.js) can reuse it

  window.TEChapter = function (cfg) {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
    try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    const reduceM = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const desktop = matchMedia('(min-width:901px)').matches;
    const managed = [];
    (cfg || []).forEach((c) => {
      const sec = document.querySelector(c.sec); if (!sec) return;
      const head = c.head ? sec.querySelector(c.head) : null;
      const headKids = head ? [...head.children] : [];
      const items = c.items ? [...sec.querySelectorAll(c.items)] : [];
      // hand these to the chapter timeline: drop .reveal so the observer above and the
      // .reveal opacity:0 base don't fight the inline animation, and kill each element's
      // CSS transition so only GSAP drives it (a stray transition double-animates / can
      // leave content stuck). Base is no longer hidden, so content survives even if JS fails.
      [head, ...headKids, ...items].forEach((el) => { if (el) { el.classList.remove('reveal', 'in'); el.style.transition = 'none'; } });
      // One entrance: heading/label/description rise FIRST, then the whole content group
      // floats gently up + fades in together. fromTo with an explicit VISIBLE end state so
      // nothing can be left hidden regardless of each element's base CSS.
      // Gentle, unhurried entrance: power2.out reads softer than power3's hard decel, and the
      // slightly longer durations let the content settle instead of snapping into place.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      if (headKids.length) tl.fromTo(headKids, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 });
      else if (head) tl.fromTo(head, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 });
      if (items.length) tl.fromTo(items,
        { opacity: 0, y: 26, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.11 },
        (head || headKids.length) ? '-=0.28' : 0);   // heading settles, then cards float in
      if (reduceM) { tl.progress(1); return; }
      // Entrance plays ONCE PER BROWSER SESSION. sessionStorage remembers sections that have
      // already played, so returning to a page (via nav, mega menu, or the back button) renders
      // them complete immediately instead of hiding + replaying. finish() is also stored on the
      // section so navigation can land it in its completed state (see jumpTo).
      const seenKey = 'te:' + location.pathname + '|' + c.sec;
      let seen = false; try { seen = sessionStorage.getItem(seenKey) === '1'; } catch (_) {}
      const remember = () => { try { sessionStorage.setItem(seenKey, '1'); } catch (_) {} };
      let played = false;
      const playOnce = () => { if (!played) { played = true; remember(); tl.play(); } };
      const finish = () => { played = true; remember(); tl.progress(1); };
      sec.__teFinish = finish;   // nav uses this to land the section fully visible
      const doPin = desktop && c.pin !== false;
      const pinTargetEl = c.pinTarget ? sec.querySelector(c.pinTarget) : null;
      // Auto-fit the whole-section chapters so they ALWAYS fit the screen (any device / scaling)
      // and can therefore pin. Sections that pin a specific inner target are left to the normal
      // fits-test (they manage their own height).
      if (doPin && !pinTargetEl) { fitSection(sec); managed.push(sec); }
      const pinEl = doPin ? (pinTargetEl || sec) : null;
      // After auto-fit, whole-section chapters fit by construction; the test still guards the
      // pinTarget case and any section too short to bother.
      const fitsViewport = pinEl && pinEl.scrollHeight <= innerHeight + 4;
      if (pinEl && fitsViewport) {
        // Brief chapter pin. anticipatePin makes the lock-in read as a smooth continuation of
        // the scroll rather than a snap; it holds for a short reading pause, then releases.
        // NB: NO fastScrollEnd — that makes the pin jump straight to its end on fast scroll, so
        // a mouse wheel (big, fast jumps) would skip the pause entirely while a trackpad works.
        ScrollTrigger.create({
          trigger: sec, start: 'top top', end: '+=' + Math.round(innerHeight * (c.hold || 0.9)),
          pin: pinEl, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
          onEnter: playOnce, onEnterBack: finish,
          // If the page loads already scrolled into/past this chapter, show it complete.
          onRefresh: (self) => { if (!played && self.progress > 0.001) finish(); }
        });
      } else {
        ScrollTrigger.create({ trigger: sec, start: 'top 78%', once: true, onEnter: playOnce });
      }
      // Already viewed earlier this session → show it complete right now (no hide, no replay).
      // The pin is still created above, so the scroll pause keeps working; it just never
      // re-animates the content.
      if (seen) finish();
    });
    // Re-fit every managed chapter whenever ScrollTrigger recomputes (window resize, zoom,
    // orientation change) BEFORE it re-measures pin positions — so the fit stays correct.
    if (managed.length) {
      try { ScrollTrigger.addEventListener('refreshInit', function () { for (var i = 0; i < managed.length; i++) fitSection(managed[i]); }); } catch (_) {}
    }
    try { ScrollTrigger.refresh(); } catch (_) {}
  };

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

  /* ---- Custom dropdowns: replace the native OS <select> popup on every form.
     The native <select> is kept (transparent, tab-skipped) for its value,
     `required` validation and submission; a styled trigger + menu drive it. ---- */
  (function customSelects() {
    /* While a dropdown is open, pause Lenis so the wheel scrolls the MENU (which
       carries data-lenis-prevent), not the whole site — like a native <select>.
       No-op on pages without Lenis (they use the menu's native overflow). */
    const lockPage = (lock) => { if (window.__lenis) { lock ? window.__lenis.stop() : window.__lenis.start(); } };
    const closeAll = (except) => {
      $$('.sel.open').forEach(s => {
        if (s !== except) { s.classList.remove('open'); const f = s.closest('.fld'); if (f) f.classList.remove('sel-open'); s._trigger && s._trigger.setAttribute('aria-expanded', 'false'); }
      });
      if (!except) lockPage(false);
    };
    $$('.fld > select').forEach((select) => {
      if (select.dataset.sel) return;
      select.dataset.sel = '1';
      const fld = select.closest('.fld');
      select.classList.add('sel-native');
      select.tabIndex = -1;

      const sel = document.createElement('div'); sel.className = 'sel'; sel._trigger = null;
      const trigger = document.createElement('button');
      trigger.type = 'button'; trigger.className = 'sel-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      const lab = fld.querySelector('label');
      if (lab) { if (!lab.id) lab.id = 'sl' + Math.round(performance.now() * 1000) % 1e9 + (Math.floor(performance.now()) % 97); trigger.setAttribute('aria-labelledby', lab.id); }
      const val = document.createElement('span'); val.className = 'sel-val';
      const caret = document.createElement('span'); caret.className = 'sel-caret';
      caret.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
      trigger.append(val, caret);
      const menu = document.createElement('ul'); menu.className = 'sel-menu'; menu.setAttribute('role', 'listbox'); menu.setAttribute('data-lenis-prevent', '');

      const items = [];
      [...select.options].forEach((o) => {
        if (o.value === '' && o.disabled) return;               // skip empty placeholder
        const li = document.createElement('li');
        li.className = 'sel-opt'; li.setAttribute('role', 'option');
        li.dataset.value = o.value; li.textContent = o.textContent;
        li.addEventListener('click', () => pick(o.value));
        menu.appendChild(li); items.push(li);
      });
      menu.addEventListener('click', (e) => e.stopPropagation());
      sel.append(trigger, menu); sel._trigger = trigger; fld.appendChild(sel);

      let activeIdx = -1;
      const render = () => {
        const cur = select.options[select.selectedIndex];
        const has = cur && cur.value !== '';
        val.textContent = has ? cur.textContent : '';
        trigger.classList.toggle('placeholder', !has);
        items.forEach((li) => li.setAttribute('aria-selected', li.dataset.value === select.value ? 'true' : 'false'));
      };
      const setActive = (i) => {
        activeIdx = Math.max(0, Math.min(items.length - 1, i));
        items.forEach((li, j) => li.classList.toggle('active', j === activeIdx));
        const li = items[activeIdx];                        // scroll only the MENU, never the page
        if (li) {                                           // (scrollIntoView + scroll-behavior:smooth
          const top = li.offsetTop, bot = top + li.offsetHeight;   // would smooth-scroll the whole site = the "shake")
          if (top < menu.scrollTop) menu.scrollTop = top - 6;
          else if (bot > menu.scrollTop + menu.clientHeight) menu.scrollTop = bot - menu.clientHeight + 6;
        }
      };
      const open = () => {
        closeAll(sel); sel.classList.add('open'); fld.classList.add('sel-open');
        trigger.setAttribute('aria-expanded', 'true'); lockPage(true);
        const i = items.findIndex((li) => li.dataset.value === select.value);
        setActive(i >= 0 ? i : 0);
      };
      const close = () => { sel.classList.remove('open'); fld.classList.remove('sel-open'); trigger.setAttribute('aria-expanded', 'false'); lockPage(false); };
      const pick = (value) => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); render(); close(); trigger.focus(); };

      trigger.addEventListener('click', (e) => { e.stopPropagation(); sel.classList.contains('open') ? close() : open(); });
      trigger.addEventListener('keydown', (e) => {
        const isOpen = sel.classList.contains('open');
        if (e.key === 'ArrowDown') { e.preventDefault(); isOpen ? setActive(activeIdx + 1) : open(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); isOpen ? setActive(activeIdx - 1) : open(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isOpen && items[activeIdx]) pick(items[activeIdx].dataset.value); else open(); }
        else if (e.key === 'Escape' || e.key === 'Tab') { close(); }
      });
      render();
    });
    document.addEventListener('click', () => closeAll());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  })();

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

  /* Global ambient cursor glow: REMOVED (site-wide). It also ran a permanent
     requestAnimationFrame loop, so dropping it is a free performance win. */

  /* ---- Footer year ---- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Footer: magnetic buttons (the cursor-follow glow was removed site-wide) ---- */
  if (matchMedia('(hover:hover)').matches && !reduce) {
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
