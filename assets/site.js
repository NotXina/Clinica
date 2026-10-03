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



  /* Guia rápido: "não sei qual profissional procurar" */
  var guideData = {
    ansiedade: {
      title: 'Psicologia',
      text: 'A psicoterapia pode ajudar a compreender emoções, criar estratégias de enfrentamento e construir mudanças possíveis no dia a dia.',
      tags: ['Psicoterapia individual', 'Adultos, adolescentes ou crianças'],
      page: 'especialidades/psicologia-sorocaba.html',
      whats: 'Olá, gostaria de orientação sobre psicoterapia.'
    },
    infantil: {
      title: 'Psicologia infantil, Psiquiatria infantil ou Neuropsicologia',
      text: 'Quando a demanda envolve comportamento, escola, emoções, TDAH ou autismo, a recepção ajuda a identificar o melhor primeiro passo para a criança ou adolescente.',
      tags: ['Crianças e adolescentes', 'Orientação familiar', 'Encaminhamento interno'],
      page: 'especialidades/psicologia-sorocaba.html',
      whats: 'Olá, gostaria de orientação para atendimento infantil ou adolescente.'
    },
    avaliacao: {
      title: 'Avaliação Neuropsicológica',
      text: 'Indicada para investigar funções como atenção, memória, aprendizagem, linguagem e funções executivas, com processo estruturado e laudo ao final.',
      tags: ['Atenção e aprendizagem', 'Laudo neuropsicológico', 'Processo em etapas'],
      page: 'especialidades/avaliacao-neuropsicologica-sorocaba.html',
      whats: 'Olá, gostaria de informações sobre avaliação neuropsicológica.'
    },
    psiquiatria: {
      title: 'Psiquiatria',
      text: 'A psiquiatria realiza avaliação médica em saúde mental, diagnóstico, acompanhamento e, quando indicado, tratamento medicamentoso.',
      tags: ['Adulto ou infantil', 'Avaliação médica', 'Acompanhamento'],
      page: 'especialidades/psiquiatria-sorocaba.html',
      whats: 'Olá, gostaria de informações sobre psiquiatria.'
    },
    casal: {
      title: 'Terapia de Casal',
      text: 'Um espaço para trabalhar comunicação, conflitos, acordos, decisões importantes e reconstrução do vínculo com apoio profissional.',
      tags: ['Relacionamento', 'Comunicação', 'Acordos'],
      page: 'especialidades/terapia-de-casal-sorocaba.html',
      whats: 'Olá, gostaria de informações sobre terapia de casal.'
    },
    metabolico: {
      title: 'Nutrição ou Endocrinologia',
      text: 'Para questões de alimentação, peso, crescimento, puberdade, tireoide, diabetes e saúde metabólica, a recepção orienta entre nutrição e endocrinologia.',
      tags: ['Nutrição', 'Endocrinologia adulto e pediátrica', 'Saúde metabólica'],
      page: 'especialidades/endocrinologia-sorocaba.html',
      whats: 'Olá, gostaria de orientação sobre nutrição ou endocrinologia.'
    }
  };

  function setGuide(option) {
    var data = guideData[option];
    if (!data) return;
    var title = document.getElementById('guide-title');
    var text = document.getElementById('guide-text');
    var tags = document.getElementById('guide-tags');
    var page = document.getElementById('guide-page');
    var wa = document.getElementById('guide-whatsapp');
    if (title) title.textContent = data.title;
    if (text) text.textContent = data.text;
    if (tags) {
      tags.innerHTML = '';
      data.tags.forEach(function (tag) {
        var span = document.createElement('span');
        span.textContent = tag;
        tags.appendChild(span);
      });
    }
    if (page) page.href = data.page;
    if (wa) wa.href = 'https://wa.me/5515998030909?text=' + encodeURIComponent(data.whats);
  }

  document.querySelectorAll('[data-guide-option]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-guide-option]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      setGuide(btn.getAttribute('data-guide-option'));
    });
  });

  /* Pré-agendamento: monta mensagem e abre WhatsApp, sem armazenar dados */
  var preForm = document.getElementById('preAgendamentoForm');
  if (preForm) {
    preForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var get = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      var linhas = [
        'Olá, gostaria de fazer um pré-agendamento pela Clínica Ledesma Suarez.',
        '',
        'Nome: ' + get('preNome'),
        'WhatsApp: ' + (get('preTelefone') || 'não informado'),
        'Idade do paciente: ' + (get('preIdade') || 'não informada'),
        'Especialidade: ' + get('preEspecialidade'),
        'Convênio/particular: ' + (get('preConvenio') || 'não informado'),
        'Melhor período: ' + (get('prePeriodo') || 'não informado')
      ];
      var msg = get('preMensagem');
      if (msg) linhas.push('Mensagem: ' + msg);
      linhas.push('', 'Enviado pelo site.');
      window.open('https://wa.me/5515998030909?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
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
