/* =========================================================================
   Lab-iMetrics — app.js
   Header state · mobile nav · scroll reveal · counters · altmetric scatter
   ========================================================================= */
(function () {
  'use strict';

  /* =======================================================================
     TWEAKS — persisted design controls (localStorage, cross-page)
     ======================================================================= */
  var TW_KEY = 'labimetrics.tweaks';
  var TW_DEFAULTS = { accent: 'amber', h1Scale: 1, rhythm: 'padrao', counters: true, dataviz: true };
  var ACCENTS = { amber: ['#F39C12', '#F5B942'], teal: ['#16A085', '#1ABC9C'] };
  var RHYTHM = { compacto: 'clamp(48px, 7vw, 100px)', padrao: 'clamp(72px, 11vw, 160px)', amplo: 'clamp(100px, 14vw, 210px)' };
  var TWEAKS = loadTweaks();

  function loadTweaks() {
    var t = {};
    try { t = JSON.parse(localStorage.getItem(TW_KEY)) || {}; } catch (e) { t = {}; }
    var out = {};
    for (var k in TW_DEFAULTS) out[k] = (k in t) ? t[k] : TW_DEFAULTS[k];
    return out;
  }
  function saveTweaks() { try { localStorage.setItem(TW_KEY, JSON.stringify(TWEAKS)); } catch (e) {} }
  function applyTweaks() {
    var root = document.documentElement;
    var a = ACCENTS[TWEAKS.accent] || ACCENTS.amber;
    root.style.setProperty('--accent', a[0]);
    root.style.setProperty('--accent-hover', a[1]);
    root.style.setProperty('--h1-scale', String(TWEAKS.h1Scale));
    root.style.setProperty('--section-y', RHYTHM[TWEAKS.rhythm] || RHYTHM.padrao);
    var dv = document.querySelector('.dataviz-sec');
    if (dv) dv.style.display = TWEAKS.dataviz ? '' : 'none';
    var dvDivider = dv && dv.previousElementSibling && dv.previousElementSibling.classList.contains('divider') ? dv.previousElementSibling : null;
    if (dvDivider) dvDivider.style.display = TWEAKS.dataviz ? '' : 'none';
  }
  // Apply ASAP (script runs at end of <body>, before DOMContentLoaded paint of below-fold)
  applyTweaks();

  function buildTweaksPanel() {
    if (document.querySelector('.tw-panel')) return;
    var p = document.createElement('aside');
    p.className = 'tw-panel';
    p.setAttribute('aria-label', 'Tweaks');
    p.innerHTML =
      '<div class="tw-head"><h5>Tweaks</h5><button class="tw-close" aria-label="Fechar"><i data-lucide="x"></i></button></div>' +
      '<div class="tw-body">' +
        '<div class="tw-row"><div class="tw-label">Cor de acento</div>' +
          '<div class="tw-swatches" data-tw="accent">' +
            '<button class="tw-swatch" data-val="amber" style="background:#F39C12" aria-label="Âmbar"></button>' +
            '<button class="tw-swatch" data-val="teal" style="background:#16A085" aria-label="Teal"></button>' +
          '</div></div>' +
        '<div class="tw-row"><div class="tw-label">Escala do título <span class="tw-val" data-tw-val="h1Scale">1.00×</span></div>' +
          '<input type="range" class="tw-range" data-tw="h1Scale" min="0.85" max="1.25" step="0.05" /></div>' +
        '<div class="tw-row"><div class="tw-label">Ritmo das seções</div>' +
          '<div class="tw-seg" data-tw="rhythm">' +
            '<button data-val="compacto">Compacto</button>' +
            '<button data-val="padrao">Padrão</button>' +
            '<button data-val="amplo">Amplo</button>' +
          '</div></div>' +
        '<div class="tw-row"><div class="tw-label">Animar contadores' +
          '<span class="tw-toggle"><span class="tw-switch" data-tw="counters" role="switch"></span></span></div></div>' +
        '<div class="tw-row"><div class="tw-label">Visualização de dados' +
          '<span class="tw-toggle"><span class="tw-switch" data-tw="dataviz" role="switch"></span></span></div>' +
          '<div class="tw-hint">Gráfico de altmetria (página inicial)</div></div>' +
      '</div>';
    document.body.appendChild(p);

    // Sync initial control states
    syncSwatch(p, 'accent', TWEAKS.accent);
    syncSeg(p, 'rhythm', TWEAKS.rhythm);
    var range = p.querySelector('[data-tw="h1Scale"]');
    range.value = TWEAKS.h1Scale;
    p.querySelector('[data-tw-val="h1Scale"]').textContent = Number(TWEAKS.h1Scale).toFixed(2) + '×';
    syncSwitch(p, 'counters', TWEAKS.counters);
    syncSwitch(p, 'dataviz', TWEAKS.dataviz);

    // Wire controls
    p.querySelectorAll('[data-tw="accent"] .tw-swatch').forEach(function (b) {
      b.addEventListener('click', function () { TWEAKS.accent = b.getAttribute('data-val'); syncSwatch(p, 'accent', TWEAKS.accent); applyTweaks(); saveTweaks(); });
    });
    p.querySelectorAll('[data-tw="rhythm"] button').forEach(function (b) {
      b.addEventListener('click', function () { TWEAKS.rhythm = b.getAttribute('data-val'); syncSeg(p, 'rhythm', TWEAKS.rhythm); applyTweaks(); saveTweaks(); });
    });
    range.addEventListener('input', function () {
      TWEAKS.h1Scale = parseFloat(range.value);
      p.querySelector('[data-tw-val="h1Scale"]').textContent = TWEAKS.h1Scale.toFixed(2) + '×';
      applyTweaks(); saveTweaks();
    });
    p.querySelector('[data-tw="counters"]').addEventListener('click', function () {
      TWEAKS.counters = !TWEAKS.counters; syncSwitch(p, 'counters', TWEAKS.counters); saveTweaks();
    });
    p.querySelector('[data-tw="dataviz"]').addEventListener('click', function () {
      TWEAKS.dataviz = !TWEAKS.dataviz; syncSwitch(p, 'dataviz', TWEAKS.dataviz); applyTweaks(); saveTweaks();
    });
    p.querySelector('.tw-close').addEventListener('click', function () {
      document.body.classList.remove('tweaks-open');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });
    if (window.lucide) window.lucide.createIcons();
  }
  function syncSwatch(p, key, val) { p.querySelectorAll('[data-tw="' + key + '"] .tw-swatch').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-val') === val); }); }
  function syncSeg(p, key, val) { p.querySelectorAll('[data-tw="' + key + '"] button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-val') === val); }); }
  function syncSwitch(p, key, on) { var s = p.querySelector('[data-tw="' + key + '"]'); if (s) s.classList.toggle('on', !!on); }

  function initTweaks() {
    buildTweaksPanel();
    window.addEventListener('message', function (e) {
      var t = e && e.data && e.data.type;
      if (t === '__activate_edit_mode') document.body.classList.add('tweaks-open');
      else if (t === '__deactivate_edit_mode') document.body.classList.remove('tweaks-open');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }

  /* ---- Lucide icons ---- */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ---- Header scrolled state ---- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  function initMobileNav() {
    var openBtn = document.querySelector('[data-menu-open]');
    var nav = document.querySelector('.mobile-nav');
    if (!openBtn || !nav) return;
    var closeBtn = nav.querySelector('[data-menu-close]');
    var open = function () { nav.classList.add('open'); document.body.style.overflow = 'hidden'; };
    var close = function () { nav.classList.remove('open'); document.body.style.overflow = ''; };
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---- Viewport visibility (rect-based — robust inside iframes) ---- */
  var watchers = [];
  function registerWatcher(fn) { watchers.push(fn); }
  function runWatchers() { for (var i = watchers.length - 1; i >= 0; i--) { if (watchers[i]() === true) watchers.splice(i, 1); } }
  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    margin = margin || 0;
    return r.top < h - margin && r.bottom > 0;
  }

  /* ---- Scroll reveal (only below-fold els get hidden, so above-fold never flashes) ---- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length || prefersReduced()) return;
    var pending = [];
    els.forEach(function (el) {
      if (inView(el, 40)) { el.classList.add('pre', 'in'); }
      else { el.classList.add('pre'); pending.push(el); }
    });
    if (!pending.length) return;
    registerWatcher(function () {
      for (var i = pending.length - 1; i >= 0; i--) {
        if (inView(pending[i], 40)) { pending[i].classList.add('in'); pending.splice(i, 1); }
      }
      return pending.length === 0;
    });
  }

  function prefersReduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---- Animated counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur = parseInt(el.getAttribute('data-dur') || '1600', 10);
    if (prefersReduced() || !TWEAKS.counters) { el.textContent = format(target, decimals); return; }
    var start = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = format(target * ease(p), decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target, decimals);
    }
    requestAnimationFrame(step);
  }
  function format(n, d) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function initCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!nums.length) return;
    registerWatcher(function () {
      for (var i = nums.length - 1; i >= 0; i--) {
        if (inView(nums[i], 30)) { animateCount(nums[i]); nums.splice(i, 1); }
      }
      return nums.length === 0;
    });
  }

  /* =======================================================================
     Altmetric scatter — menções sociais (x) vs. citações acadêmicas (y).
     A pesquisa carro-chefe do lab: correlação entre repercussão social e
     citação futura. Dados ilustrativos; substituíveis por dados reais.
     ======================================================================= */
  function initScatter() {
    var canvas = document.getElementById('altmetric-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var wrap = canvas.parentElement;
    var tip = document.getElementById('altmetric-tip');

    var css = getComputedStyle(document.documentElement);
    var C = {
      teal: css.getPropertyValue('--teal-500').trim() || '#16A085',
      tealL: css.getPropertyValue('--teal-400').trim() || '#1ABC9C',
      amber: css.getPropertyValue('--amber-500').trim() || '#F39C12',
      grid: 'rgba(160,160,192,0.10)',
      axis: 'rgba(160,160,192,0.32)',
      text: css.getPropertyValue('--text-secondary').trim() || '#A0A0C0'
    };

    // Seeded data: x = altmetric mentions, y = citations, r ~ recency/size
    var rng = mulberry32(20160422);
    var pts = [];
    var N = 46;
    for (var i = 0; i < N; i++) {
      var x = Math.pow(rng(), 1.5);                 // 0..1 mentions (skewed low)
      var noise = (rng() - 0.5) * 0.42;
      var y = Math.min(1, Math.max(0.02, x * 0.78 + 0.12 + noise)); // correlated
      var hot = x > 0.62 && y > 0.55;
      pts.push({ x: x, y: y, r: 3 + rng() * 4, hot: hot });
    }

    var dims = {};
    function resize() {
      var rect = wrap.getBoundingClientRect();
      var w = rect.width, h = Math.max(280, Math.min(420, rect.width * 0.6));
      var dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dims = { w: w, h: h, pad: { l: 52, r: 18, t: 18, b: 42 } };
      draw(1);
    }

    function px(p) {
      var d = dims, pad = d.pad;
      return {
        x: pad.l + p.x * (d.w - pad.l - pad.r),
        y: (d.h - pad.b) - p.y * (d.h - pad.t - pad.b)
      };
    }

    var progress = 0;
    function draw(prog) {
      progress = prog;
      var d = dims, pad = d.pad;
      ctx.clearRect(0, 0, d.w, d.h);

      // grid
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = C.text;
      var steps = 4;
      for (var g = 0; g <= steps; g++) {
        var gy = pad.t + (g / steps) * (d.h - pad.t - pad.b);
        ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(d.w - pad.r, gy); ctx.stroke();
      }
      // axes
      ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, d.h - pad.b); ctx.lineTo(d.w - pad.r, d.h - pad.b);
      ctx.stroke();

      // axis labels
      ctx.fillStyle = C.text;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('menções sociais  →', pad.l + (d.w - pad.l - pad.r) / 2, d.h - pad.b + 18);
      ctx.save();
      ctx.translate(15, pad.t + (d.h - pad.t - pad.b) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'bottom';
      ctx.fillText('citações  →', 0, 0);
      ctx.restore();

      // trend line (regression-ish: y = 0.78x + 0.12)
      if (prog > 0.4) {
        var a0 = px({ x: 0.0, y: 0.12 });
        var a1 = px({ x: 1.0, y: 0.90 });
        ctx.strokeStyle = C.tealL; ctx.globalAlpha = 0.5 * Math.min(1, (prog - 0.4) / 0.6);
        ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }

      // points
      pts.forEach(function (p, i) {
        var appear = Math.min(1, Math.max(0, prog * N - i) / 1.2);
        if (appear <= 0) return;
        var c = px(p);
        var r = p.r * appear;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        if (p.hot) {
          ctx.fillStyle = C.amber; ctx.globalAlpha = 0.92 * appear;
        } else {
          ctx.fillStyle = C.teal; ctx.globalAlpha = 0.62 * appear;
        }
        ctx.fill();
        if (p.hot) {
          ctx.globalAlpha = 0.32 * appear;
          ctx.beginPath(); ctx.arc(c.x, c.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.globalAlpha = 1;
        p._sx = c.x; p._sy = c.y; p._sr = r;
      });
    }

    function animateIn() {
      if (prefersReduced()) { draw(1); return; }
      var start = null, dur = 1700;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        draw(1 - Math.pow(1 - p, 2));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // hover tooltip
    canvas.addEventListener('mousemove', function (e) {
      if (!tip) return;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var found = null;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p._sx == null) continue;
        var dx = mx - p._sx, dy = my - p._sy;
        if (dx * dx + dy * dy < (p._sr + 5) * (p._sr + 5)) { found = p; break; }
      }
      if (found) {
        var mentions = Math.round(8 + found.x * 540);
        var cites = Math.round(found.y * 96);
        tip.style.opacity = '1';
        tip.style.left = found._sx + 'px';
        tip.style.top = (found._sy - 14) + 'px';
        tip.innerHTML = '<span class="t-m">' + mentions + ' menções</span><span class="t-c">' + cites + ' citações</span>';
        canvas.style.cursor = 'pointer';
      } else {
        tip.style.opacity = '0';
        canvas.style.cursor = 'default';
      }
    });
    canvas.addEventListener('mouseleave', function () { if (tip) tip.style.opacity = '0'; });

    var ro = new ResizeObserver(function () { resize(); });
    ro.observe(wrap);
    resize();

    var fired = false;
    registerWatcher(function () {
      if (inView(canvas, 60)) { if (!fired) { fired = true; animateIn(); } return true; }
      return false;
    });
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---- Publications filter (publicacoes.html) ---- */
  function initFilters() {
    var groups = document.querySelectorAll('[data-filter-group]');
    if (!groups.length) return;
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-pub]'));
    var state = { year: 'all', line: 'all', type: 'all' };
    var countEl = document.getElementById('pub-count');

    function apply() {
      var shown = 0;
      items.forEach(function (it) {
        var ok = (state.year === 'all' || it.dataset.year === state.year) &&
                 (state.line === 'all' || it.dataset.line === state.line) &&
                 (state.type === 'all' || it.dataset.type === state.type);
        it.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
    }
    groups.forEach(function (group) {
      var key = group.getAttribute('data-filter-group');
      group.querySelectorAll('[data-val]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          group.querySelectorAll('[data-val]').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          state[key] = btn.getAttribute('data-val');
          apply();
        });
      });
    });
    apply();
  }

  /* ---- Contact form (no backend — graceful demo) ---- */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = form.querySelector('[data-form-ok]');
      form.querySelectorAll('input, textarea, select, button').forEach(function (f) { f.setAttribute('disabled', ''); });
      if (ok) ok.hidden = false;
    });
  }

  /* ---- Year stamp ---- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function init() {
    initIcons();
    initHeader();
    initMobileNav();
    initReveal();
    initCounters();
    initScatter();
    initFilters();
    initForm();
    initYear();
    initTweaks();
    // Drive all rect-based watchers from scroll/resize + a settle pass
    var tick = function () { runWatchers(); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    runWatchers();
    requestAnimationFrame(runWatchers);
    setTimeout(runWatchers, 200);
    window.addEventListener('load', function () { setTimeout(runWatchers, 60); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
