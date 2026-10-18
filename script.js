/* CYBORG / 01 — interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* =====================================================
     1. CURSOR + HERO PORTRAIT TILT
     ===================================================== */
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (finePointer && !reduced) document.documentElement.classList.add('has-cursor');
  document.addEventListener('pointerover', (e) => {
    ring.classList.toggle('hover', !!e.target.closest('a,button,summary,input,select,label,.lab-stage'));
  });

  const portrait = $('#hero-portrait');
  function frame() {
    mouse.rx = lerp(mouse.rx, mouse.x, 0.16);
    mouse.ry = lerp(mouse.ry, mouse.y, 0.16);
    if (dot) {
      dot.style.transform = `translate(${mouse.x}px,${mouse.y}px)`;
      ring.style.transform = `translate(${mouse.rx}px,${mouse.ry}px)`;
    }
    if (portrait && !reduced) {
      const r = portrait.getBoundingClientRect();
      if (r.bottom > -100 && r.top < innerHeight + 100) {
        const dx = clamp((mouse.rx - (r.left + r.width / 2)) / (innerWidth * 0.5), -1, 1);
        const dy = clamp((mouse.ry - (r.top + r.height / 2)) / (innerHeight * 0.5), -1, 1);
        portrait.style.setProperty('--ry', `${(dx * 10).toFixed(2)}deg`);
        portrait.style.setProperty('--rx', `${(-dy * 7).toFixed(2)}deg`);
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* =====================================================
     2. BOOT SEQUENCE
     ===================================================== */
  const boot = $('#boot');
  const root = document.documentElement;
  let introPlayed = false;

  function playIntro() {
    if (introPlayed) return;
    introPlayed = true;
    $$('.scramble').forEach((el, i) => setTimeout(() => scramble(el), 120 + i * 220));
  }

  if (!boot || root.classList.contains('no-boot') || reduced) {
    boot && boot.remove();
    playIntro();
  } else {
    const lines = [
      '> INITIALIZING CORE ........ OK',
      '> LOADING NEURAL LINK ...... OK',
      '> CALIBRATING OPTICS ....... OK',
      '> HUMAN-FIRST PROTOCOL ..... ACTIVE',
      '> WELCOME, HUMAN.',
    ];
    const log = $('#boot-log'), fill = $('#boot-fill'), pct = $('#boot-pct');
    let n = 0, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('cyborg-booted', '1'); } catch (e) {}
      fill.style.width = '100%'; pct.textContent = '100%';
      boot.classList.add('done');
      setTimeout(() => boot.remove(), 700);
      playIntro();
    };
    const tick = () => {
      if (finished) return;
      if (n < lines.length) {
        log.textContent += (n ? '\n' : '') + lines[n++];
        const p = Math.round((n / lines.length) * 100);
        fill.style.width = p + '%'; pct.textContent = p + '%';
        setTimeout(tick, 330);
      } else setTimeout(finish, 450);
    };
    tick();
    $('#boot-skip').addEventListener('click', finish);
    addEventListener('keydown', (e) => { if (!finished && (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ')) finish(); });
  }

  /* =====================================================
     3. SCRAMBLE / GLITCH HEADLINE
     ===================================================== */
  const GLYPHS = 'ABCDEFGHKLMNOPRSTUVXYZ#%&01';
  function scramble(el) {
    const text = el.dataset.text;
    if (reduced) { el.textContent = text; return; }
    if (el._busy) return;
    el._busy = true;
    el.style.minWidth = el.style.minWidth || el.offsetWidth + 'px';
    const total = 22;
    let f = 0;
    const run = () => {
      const lock = Math.floor((f / total) * text.length);
      el.textContent = [...text].map((c, i) => (i < lock || c === '.' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (f++ < total) setTimeout(run, 38);
      else { el.textContent = text; el._busy = false; }
    };
    run();
  }
  // pre-measure widths so the headline never jumps while scrambling
  $$('.scramble').forEach((el) => { el.style.minWidth = el.offsetWidth + 'px'; });
  $$('.hero h1').forEach((h) => h.addEventListener('pointerenter', () => $$('.scramble', h).forEach(scramble)));

  /* =====================================================
     4. HERO HUD (live values)
     ===================================================== */
  const hudLink = $('#hud-link'), hudTemp = $('#hud-temp'), hudLat = $('#hud-lat');
  if (!reduced) setInterval(() => {
    hudLink.textContent = `CONNECTED ${(98.6 + Math.random() * 1.3).toFixed(1)}%`;
    hudTemp.textContent = `${(36.6 + Math.random() * 0.5).toFixed(1)}°C`;
    hudLat.textContent = `${(0.3 + Math.random() * 0.3).toFixed(1)} ms`;
  }, 1400);

  /* =====================================================
     5. NAV, PROGRESS, SCROLL-LINKED EFFECTS
     ===================================================== */
  const menuToggle = $('.menu-toggle'), navLinks = $('.nav-links');
  const closeMenu = () => { navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); };
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', navLinks).forEach((a) => a.addEventListener('click', closeMenu));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) { closeMenu(); menuToggle.focus(); }
  });

  const hero = $('.hero'), bar = $('.progress i');
  const timeline = $('#timeline-list'), tlItems = $$('.tl-item');
  const sections = $$('main section[id]');
  const navAnchors = $$('a[href^="#"]', navLinks);

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
    // hero scroll-linked parallax (0 → 1 over the hero's height)
    if (!reduced) hero.style.setProperty('--p', clamp(y / (hero.offsetHeight * 0.85)).toFixed(3));
    // timeline fill
    const r = timeline.getBoundingClientRect();
    const mark = innerHeight * 0.62;
    timeline.style.setProperty('--fill', clamp((mark - r.top) / r.height).toFixed(3));
    tlItems.forEach((li) => li.classList.toggle('on', li.getBoundingClientRect().top < mark));
    // active nav link
    let current = '';
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= innerHeight * 0.35) current = s.id; });
    navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* =====================================================
     6. REVEAL, COUNTERS, METERS
     ===================================================== */
  function runCounter(el) {
    const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || '0', 10), int = el.dataset.format === 'int';
    const fmt = (v) => (int ? Math.round(v).toLocaleString('en-US') : v.toFixed(dec));
    if (reduced) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const k = clamp((t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function fillMeters(card) {
    $$('.meter', card).forEach((m, i) => {
      const i_ = $('i', m); const v = parseFloat(i_.dataset.v);
      setTimeout(() => { i_.style.width = v + '%'; }, 150 + i * 120);
      m._base = v;
    });
    card._live = true;
  }

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const t = en.target;
        t.classList.add('visible');
        $$('.count', t).forEach(runCounter);
        if (t.classList.contains('system-card')) fillMeters(t);
        if (t.classList.contains('lab-grid')) labIntro();
        io.unobserve(t);
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
    $$('.count').forEach(runCounter);
    $$('.system-card').forEach(fillMeters);
  }

  // live meter wobble
  if (!reduced) setInterval(() => {
    $$('.system-card').forEach((card) => {
      if (!card._live) return;
      $$('.meter', card).forEach((m) => {
        if (m._base >= 100) return;
        const v = clamp(m._base + (Math.random() * 6 - 3), 0, 100);
        $('i', m).style.width = v + '%';
        $('b', m).textContent = Math.round(v) + '%';
      });
    });
  }, 2200);

  // one capability panel open at a time
  const details = $$('.system-detail');
  details.forEach((d) => d.addEventListener('toggle', () => { if (d.open) details.forEach((o) => { if (o !== d) o.open = false; }); }));

  /* =====================================================
     7. CARD TILT + SPOTLIGHT
     ===================================================== */
  if (finePointer && !reduced) {
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
        card.style.transform = `rotateY(${((x - 0.5) * 10).toFixed(2)}deg) rotateX(${((0.5 - y) * 10).toFixed(2)}deg) translateZ(0)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* =====================================================
     8. LAB — HUMAN ⇄ ANDROID SLIDER (same woman, two photos)
     ===================================================== */
  const stage = $('#lab-stage'), robot = $('#lab-robot'), divider = $('#lab-div');
  const range = $('#lab-range');
  const out = {
    pct: $('#lab-pct'), state: $('#lab-state'),
    react: [$('#s-react'), $('#b-react')], str: [$('#s-str'), $('#b-str')],
    mem: [$('#s-mem'), $('#b-mem')], vis: [$('#s-vis'), $('#b-vis')],
  };
  let level = 0.55;

  function setLevel(v) {
    level = clamp(v);
    const x = (1 - level) * 100;                 // android layer is revealed from the right edge
    robot.style.clipPath = `inset(0 0 0 ${x}%)`;
    divider.style.left = x + '%';
    divider.style.opacity = level <= 0.005 || level >= 0.995 ? 0 : 1;
    range.value = Math.round(level * 100);
    out.pct.textContent = Math.round(level * 100) + '%';
    out.state.textContent = level < 0.04 ? 'BASELINE HUMAN' : level < 0.5 ? 'AUGMENTED' : level < 0.96 ? 'HYBRID' : 'ANDROID / 01';
    const set = (pair, text, v) => { pair[0].textContent = text; pair[1].style.width = (14 + v * 86) + '%'; };
    set(out.react, `${Math.round(250 - level * 210)} ms`, level);
    set(out.str, `${Math.round(60 + level * 340)} kg`, level);
    set(out.mem, `${Math.round(7 + level * 33)} items`, level);
    set(out.vis, `${Math.round(380 - level * 180)}–${Math.round(700 + level * 1000)} nm`, level);
    $$('.lab-presets button').forEach((b) => b.classList.toggle('on', Math.abs(parseFloat(b.dataset.set) / 100 - level) < 0.02));
  }

  function animateTo(target, ms = 700) {
    if (reduced) return setLevel(target);
    const from = level, t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setLevel(lerp(from, target, e));
      if (k < 1 && !dragging) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function labIntro() { setLevel(0); setTimeout(() => animateTo(0.55, 1400), 250); }

  let dragging = false;
  const fromEvent = (e) => {
    const r = stage.getBoundingClientRect();
    setLevel(1 - (e.clientX - r.left) / r.width);
  };
  stage.addEventListener('pointerdown', (e) => { dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e); });
  stage.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
  ['pointerup', 'pointercancel'].forEach((ev) => stage.addEventListener(ev, () => { dragging = false; }));
  range.addEventListener('input', () => setLevel(range.value / 100));
  $$('.lab-presets button').forEach((b) => b.addEventListener('click', () => animateTo(parseFloat(b.dataset.set) / 100)));
  setLevel(0.55);

  /* =====================================================
     9. ACCESS FORM → ID CARD (client-side demo, nothing stored)
     ===================================================== */
  const form = $('#access-form'), card = $('#id-card'), err = $('#f-error'), nameInput = $('#f-name');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) { err.hidden = false; nameInput.focus(); return; }
    err.hidden = true;
    let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    $('#id-name').textContent = name.toUpperCase();
    $('#id-num').textContent = `CB-${String(h % 10000).padStart(4, '0')}-${String((h >> 5) % 100).padStart(2, '0')}`;
    $('#id-sys').textContent = $('#f-sys').value;
    form.hidden = true; card.hidden = false;
    card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  $('#id-reset').addEventListener('click', () => { card.hidden = true; form.hidden = false; nameInput.value = ''; nameInput.focus(); });
  nameInput.addEventListener('input', () => { err.hidden = true; });
})();
