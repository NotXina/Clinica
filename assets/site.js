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

  /* Grade do Instagram — alimentada por assets/instagram.json.
     Imagens ficam em img/ig/ e os links apontam para o post original.
     Se não houver posts cadastrados (ou o arquivo falhar), a seção permanece oculta. */
  var igSec = document.getElementById('instagram');
  if (igSec && window.fetch) {
    fetch('assets/instagram.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (dados) {
        if (!dados || !Array.isArray(dados.posts) || !dados.posts.length) return;
        var perfil = dados.perfil || 'clinicaledesmasuarez';
        var grade = igSec.querySelector('.ig-grid');
        var sub = igSec.querySelector('.ig-sub');
        if (sub && dados.chamada) { sub.textContent = dados.chamada; } else if (sub) { sub.remove(); }

        dados.posts.slice(0, 8).forEach(function (p) {
          if (!p || !p.imagem) return;
          var a = document.createElement('a');
          a.className = 'ig-card';
          a.href = p.url || ('https://instagram.com/' + perfil);
          a.target = '_blank';
          a.rel = 'noopener';

          var fig = document.createElement('figure');
          var img = document.createElement('img');
          img.src = p.imagem;
          img.alt = p.alt || p.legenda || 'Publicação da Clínica Ledesma Suarez no Instagram';
          img.width = 600;
          img.height = 600;
          img.loading = 'lazy';
          img.decoding = 'async';
          fig.appendChild(img);

          if (p.tipo) {
            var badge = document.createElement('span');
            badge.className = 'ig-badge';
            badge.textContent = p.tipo;
            fig.appendChild(badge);
          }
          if (p.legenda) {
            var cap = document.createElement('figcaption');
            cap.textContent = p.legenda;
            fig.appendChild(cap);
          }
          a.appendChild(fig);
          grade.appendChild(a);
        });

        if (grade.children.length) { igSec.removeAttribute('hidden'); }
      })
      .catch(function () { /* mantém a seção oculta */ });
  }

  /* Visualização ampliada das fotos */
  var fotos = document.querySelectorAll('.js-ampliar-foto');
  if (fotos.length) {
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Foto ampliada');
    lightbox.hidden = true;
    lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Fechar foto ampliada">&times;</button><img class="lightbox-image" alt="">';
    document.body.appendChild(lightbox);

    var lightboxImage = lightbox.querySelector('.lightbox-image');
    var fecharLightbox = function () {
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
    };
    var abrirLightbox = function (foto) {
      lightboxImage.src = foto.currentSrc || foto.src;
      lightboxImage.alt = foto.alt || 'Foto ampliada';
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      lightbox.querySelector('.lightbox-close').focus();
    };

    fotos.forEach(function (foto) {
      foto.setAttribute('tabindex', '0');
      foto.setAttribute('role', 'button');
      foto.setAttribute('aria-label', (foto.alt || 'Foto') + '. Clique para ampliar');
      foto.addEventListener('click', function () { abrirLightbox(foto); });
      foto.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          abrirLightbox(foto);
        }
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', fecharLightbox);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) fecharLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (!lightbox.hidden && event.key === 'Escape') fecharLightbox();
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
