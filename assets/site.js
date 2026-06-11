/* =========================================================================
   Lab-iMetrics — site.js
   Shared chrome injector (header + mega menu + footer) + all interactions.
   Every page loads ONLY this script. Active nav from <body data-page="...">.
   ========================================================================= */
(function () {
  'use strict';

  var LOGO =
    '<a class="logo" href="index.html" aria-label="Lab-iMetrics — Estudos Métricos da Informação">' +
    '<img src="assets/logo.png" alt="Lab-iMetrics — Estudos Métricos da Informação" /></a>';

  function headerHTML(page) {
    function lk(href, label, key) {
      return '<a href="' + href + '"' + (page === key ? ' class="active"' : '') + '>' + label + '</a>';
    }
    return '' +
    '<header class="site-header">' +
      '<div class="container nav">' +
        '<div class="nav-left">' + LOGO +
          '<nav class="nav-links" aria-label="Navegação principal">' +
            lk('sobre.html', 'Sobre', 'sobre') +
            lk('publicacoes.html', 'Pesquisas', 'publicacoes') +
            lk('equipe.html', 'Equipe', 'equipe') +
            '<button class="nav-more" data-menu-more aria-label="Mais">Mais <i data-lucide="chevron-down"></i></button>' +
          '</nav>' +
        '</div>' +
        '<div class="nav-actions">' +
          '<button class="menu-toggle" data-menu-toggle aria-label="Abrir menu"><i data-lucide="menu"></i><span class="lbl-open">Menu</span><span class="lbl-close">Fechar</span></button>' +
          '<a class="btn btn-primary btn-sm" href="publicacoes.html">Ver pesquisas</a>' +
        '</div>' +
      '</div>' +
      megaHTML() +
    '</header>';
  }

  function megaItem(href, ic, tt, dd, ext) {
    var t = ext ? ' target="_blank" rel="noopener"' : '';
    return '<a class="mega-item" href="' + href + '"' + t + '>' +
      '<span class="mega-top"><span class="ic"><i data-lucide="' + ic + '"></i></span><span class="tt">' + tt + '</span></span>' +
    '</a>';
  }
  function megaHTML() {
    return '' +
    '<div class="mega" aria-label="Menu expandido">' +
      '<div class="container mega-grid">' +
        '<div class="mega-col"><h4>Pesquisa</h4>' +
          megaItem('sobre.html#linhas', 'line-chart', 'Linha de pesquisa', 'Investigação do impacto científico na web') +
          megaItem('publicacoes.html', 'book-open', 'Publicações', 'Artigos em periódicos nacionais e internacionais') +
          megaItem('equipe.html', 'users', 'Equipe', 'Pesquisadores doutores e colaboradores') +
          megaItem('sobre.html', 'info', 'Sobre', 'História e missão do laboratório') +
        '</div>' +
        '<div class="mega-col"><h4>Recursos</h4>' +
          megaItem('publicacoes.html', 'database', 'Dados abertos', 'Conjuntos de dados públicos para pesquisa') +
          megaItem('publicacoes.html', 'wrench', 'Ferramentas', 'Plataformas de análise métrica') +
          megaItem('sobre.html', 'flask-conical', 'Metodologia', 'Abordagens quantitativas e qualitativas') +
        '</div>' +
        '<div class="mega-col"><h4>Institucional</h4>' +
          megaItem('https://ichca.ufal.br', 'building-2', 'ICHCA', 'Inst. de Ciências Humanas, Comunicação e Artes', true) +
          megaItem('https://ufal.br', 'graduation-cap', 'UFAL', 'Universidade Federal de Alagoas', true) +
          megaItem('http://dgp.cnpq.br', 'landmark', 'CNPq', 'Conselho Nac. de Desenvolvimento Científico', true) +
          megaItem('https://www.inctdd.org', 'network', 'INCT.DD', 'Inst. Nac. de C&T em Democracia Digital', true) +
        '</div>' +
        '<div class="mega-col"><h4>Comunidade</h4>' +
          megaItem('equipe.html', 'users', 'Colaboradores', 'Pesquisadores parceiros e redes de trabalho') +
          megaItem('https://tweetscovid-production.up.railway.app/', 'layout-dashboard', 'Dashboard', 'Visualização interativa de dados do laboratório', true) +
        '</div>' +
      '</div>' +
      '<div class="mega-bottom">' +
        '<span class="ask">Quer conhecer nosso trabalho?</span>' +
        '<span class="mb-actions">' +
        '<a href="publicacoes.html"><i data-lucide="search"></i> Explorar</a></span>' +
      '</div>' +
    '</div>';
  }

  function footerHTML() {
    function col(title, items) {
      var lis = items.map(function (it) { return '<li><a href="' + it[1] + '">' + it[0] + '</a></li>'; }).join('');
      return '<div class="foot-col"><h4>' + title + '</h4><ul>' + lis + '</ul></div>';
    }
    return '' +
    '<footer class="site-footer"><div class="container">' +
      '<div class="foot-news">' +
        '<div><h3>Receba novidades</h3><p class="sub">Acompanhe pesquisas e publicações do Lab-iMetrics</p></div>' +
        '<form class="foot-form" id="news-form" novalidate>' +
          '<div class="row"><input type="email" placeholder="Seu email" aria-label="Seu email" required />' +
          '<button type="submit" class="btn btn-secondary">Inscrever</button></div>' +
          '<p class="fine">Ao se inscrever, você concorda com nossa <a href="#">Política de Privacidade</a>.</p>' +
          '<p class="fine" data-ok hidden>Inscrição registrada — obrigado!</p>' +
        '</form>' +
      '</div>' +
      '<hr class="foot-divider" />' +
      '<div class="foot-links">' +
        col('Navegação', [['Sobre','sobre.html'],['Pesquisas','publicacoes.html'],['Equipe','equipe.html'],['Publicações','publicacoes.html']]) +
        col('Linhas ativas', [['Metodologia','sobre.html#linhas'],['Projetos','publicacoes.html'],['Estudos','sobre.html#linhas']]) +
        col('Maceió, AL', [['Email','mailto:ronaldfa@gmail.com'],['Comunidade','equipe.html'],['Recursos','publicacoes.html'],['Dados abertos','publicacoes.html']]) +
        col('Documentação', [['Ferramentas','publicacoes.html'],['Repositório','publicacoes.html'],['Sobre nós','sobre.html'],['Missão','sobre.html'],['Histórico','sobre.html']]) +
        col('Parcerias', [['Certificações','sobre.html'],['Políticas','#'],['Privacidade','#'],['Termos de uso','#'],['Código de conduta','#']]) +
      '</div>' +
      '<hr class="foot-divider" />' +
      '<div class="foot-credits">' + LOGO +
        '<span class="cp">© <span data-year>2026</span> Lab-iMetrics. Todos os direitos reservados.</span>' +
      '</div>' +
    '</div></footer>';
  }

  /* ---- Inject chrome ---- */
  function injectChrome() {
    var page = document.body.getAttribute('data-page') || '';
    var hMount = document.querySelector('[data-chrome="header"]');
    var fMount = document.querySelector('[data-chrome="footer"]');
    if (hMount) hMount.outerHTML = headerHTML(page);
    if (fMount) fMount.outerHTML = footerHTML();
  }

  /* ---- helpers ---- */
  function prefersReduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
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

  function initMega() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-menu-toggle]');
    var more = document.querySelector('[data-menu-more]');
    if (!header || !toggle) return;
    var open = function () { header.classList.toggle('menu-open'); };
    toggle.addEventListener('click', open);
    if (more) more.addEventListener('click', function (e) { e.preventDefault(); open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') header.classList.remove('menu-open'); });
    document.querySelectorAll('.mega a').forEach(function (a) { a.addEventListener('click', function () { header.classList.remove('menu-open'); }); });
  }

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

  function fmt(n) { return n.toLocaleString('pt-BR'); }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = parseInt(el.getAttribute('data-dur') || '1500', 10);
    if (prefersReduced()) { el.textContent = fmt(target) + suffix; return; }
    var start = null, ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(Math.round(target * ease(p))) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!nums.length) return;
    watchers.push(function () {
      for (var i = nums.length - 1; i >= 0; i--) { if (inView(nums[i], 30)) { animateCount(nums[i]); nums.splice(i, 1); } }
      return nums.length === 0;
    });
  }

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
      for (var i = pending.length - 1; i >= 0; i--) { if (inView(pending[i], 40)) { pending[i].classList.add('in'); pending.splice(i, 1); } }
      return pending.length === 0;
    });
  }

  /* ---- Publications filter ---- */
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

  /* ---- Forms (newsletter + contact) ---- */
  function initForms() {
    document.querySelectorAll('form[novalidate]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = form.querySelector('[data-ok]');
        form.querySelectorAll('input, textarea, select, button').forEach(function (el) { el.disabled = true; });
        if (ok) ok.hidden = false;
      });
    });
  }

  function initYear() { document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  function init() {
    injectChrome();
    initIcons();
    initHeader();
    initMega();
    initCarousel();
    initCounters();
    initReveal();
    initFilters();
    initForms();
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
