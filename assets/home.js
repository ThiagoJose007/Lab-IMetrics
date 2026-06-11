/* =========================================================================
   Lab-iMetrics — Home (Figma "Relume" style)
   Header state · mega-menu · hero carousel · counters · reveal
   ========================================================================= */
(function () {
  'use strict';

  function prefersReduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function inView(el, m) {
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    m = m || 0;
    return r.top < h - m && r.bottom > 0;
  }
  var watchers = [];
  function runWatchers() { for (var i = watchers.length - 1; i >= 0; i--) { if (watchers[i]() === true) watchers.splice(i, 1); } }

  function initIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  function initHeader() {
    var h = document.querySelector('.site-header');
    if (!h) return;
    var onScroll = function () { h.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mega menu ---- */
  function initMega() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-menu-toggle]');
    var more = document.querySelector('[data-menu-more]');
    if (!header || !toggle) return;
    var open = function () { header.classList.toggle('menu-open'); };
    toggle.addEventListener('click', open);
    if (more) more.addEventListener('click', function (e) { e.preventDefault(); open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') header.classList.remove('menu-open'); });
    // close when a mega link is clicked
    document.querySelectorAll('.mega a').forEach(function (a) {
      a.addEventListener('click', function () { header.classList.remove('menu-open'); });
    });
  }

  /* ---- Hero carousel ---- */
  function initCarousel() {
    var root = document.querySelector('[data-carousel]');
    if (!root) return;
    var track = root.querySelector('.slider-track');
    var slides = root.querySelectorAll('.slide');
    var dots = root.querySelectorAll('.slider-dots button');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var n = slides.length, cur = 0, timer = null;

    function go(i) {
      cur = (i + n) % n;
      track.style.transform = 'translateX(' + (-cur * 100) + '%)';
      dots.forEach(function (d, di) { d.classList.toggle('active', di === cur); });
    }
    function start() { if (prefersReduced()) return; stop(); timer = setInterval(function () { go(cur + 1); }, 6000); }
    function stop() { if (timer) clearInterval(timer); }

    if (prev) prev.addEventListener('click', function () { go(cur - 1); start(); });
    if (next) next.addEventListener('click', function () { go(cur + 1); start(); });
    dots.forEach(function (d, di) { d.addEventListener('click', function () { go(di); start(); }); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    go(0); start();
  }

  /* ---- Counters ---- */
  function fmt(n, d) { return n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function animateCount(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = parseInt(el.getAttribute('data-dur') || '1500', 10);
    if (prefersReduced()) { el.textContent = fmt(target, 0) + suffix; return; }
    var start = null, ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(Math.round(target * ease(p)), 0) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, 0) + suffix;
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!nums.length) return;
    watchers.push(function () {
      for (var i = nums.length - 1; i >= 0; i--) {
        if (inView(nums[i], 30)) { animateCount(nums[i]); nums.splice(i, 1); }
      }
      return nums.length === 0;
    });
  }

  /* ---- Reveal ---- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length || prefersReduced()) return;
    var pending = [];
    els.forEach(function (el) {
      if (inView(el, 40)) el.classList.add('pre', 'in');
      else { el.classList.add('pre'); pending.push(el); }
    });
    if (!pending.length) return;
    watchers.push(function () {
      for (var i = pending.length - 1; i >= 0; i--) {
        if (inView(pending[i], 40)) { pending[i].classList.add('in'); pending.splice(i, 1); }
      }
      return pending.length === 0;
    });
  }

  /* ---- Newsletter (demo) ---- */
  function initNews() {
    var f = document.getElementById('news-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = f.querySelector('[data-ok]');
      f.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });
      if (ok) ok.hidden = false;
    });
  }

  function initYear() { document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  function init() {
    initIcons();
    initHeader();
    initMega();
    initCarousel();
    initCounters();
    initReveal();
    initNews();
    initYear();
    var tick = function () { runWatchers(); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    runWatchers();
    requestAnimationFrame(runWatchers);
    setTimeout(runWatchers, 200);
    window.addEventListener('load', function () { setTimeout(runWatchers, 60); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
