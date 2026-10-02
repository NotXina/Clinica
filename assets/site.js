/* Interações compartilhadas — Clínica Ledesma Suarez */
(function () {
  'use strict';

  /* Menu mobile */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu-principal');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var aberto = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', aberto);
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Barra de progresso de leitura */
  var barra = document.getElementById('progress');
  if (barra) {
    var atualizar = function () {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (h.scrollTop || document.body.scrollTop) / total * 100 : 0;
      barra.style.width = Math.min(100, pct) + '%';
    };
    document.addEventListener('scroll', atualizar, { passive: true });
    atualizar();
  }

  /* Copiar link */
  var toast = document.getElementById('toast');
  function mostrarToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  document.querySelectorAll('[data-copiar]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copiar') || location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { mostrarToast('Link copiado!'); });
      } else {
        var i = document.createElement('input');
        i.value = url; document.body.appendChild(i); i.select();
        document.execCommand('copy'); document.body.removeChild(i);
        mostrarToast('Link copiado!');
      }
    });
  });

  /* Filtro de categorias no blog */
  var filtros = document.querySelectorAll('[data-filtro]');
  if (filtros.length) {
    filtros.forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-filtro');
        filtros.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('active');
        b.setAttribute('aria-pressed', 'true');
        document.querySelectorAll('.card[data-cat]').forEach(function (c) {
          c.style.display = (cat === 'todos' || c.getAttribute('data-cat') === cat) ? '' : 'none';
        });
      });
    });
  }

  /* Perguntas frequentes (acordeão) */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement;
      var aberto = item.classList.toggle('open');
      q.setAttribute('aria-expanded', aberto);
    });
  });
})();
