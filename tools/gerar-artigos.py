#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de páginas de artigo + sitemap.xml para o site da Clínica Ledesma Suarez.

Como usar:
    1. Edite tools/posts.json (adicione/edite um post).
    2. Rode:  python3 tools/gerar-artigos.py
    3. Serão (re)gerados:
         artigos/<slug>.html      -> página individual, indexável, com schema.org
         sitemap.xml              -> atualizado com todas as URLs
         tools/cards-blog.html    -> trecho HTML com os cards (colar em blog.html)
         tools/cards-index.html   -> trecho HTML com os 3 cards mais recentes (index.html)

Cada post em posts.json aceita:
    slug, title, tag, excerpt, author, authorRole, crp, avatar, date (AAAA-MM-DD),
    readMin, keywords, body (HTML dos parágrafos)
"""
import json
import os
import re
from datetime import date
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://ledesmasuarez.com.br"
WA = "https://wa.me/5515998030909"
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
         "agosto", "setembro", "outubro", "novembro", "dezembro"]

PAGINAS_FIXAS = [
    ("/", "weekly", "1.0"),
    ("/equipe.html", "monthly", "0.8"),
    ("/blog.html", "weekly", "0.9"),
]


def data_extenso(iso):
    a, m, d = (int(x) for x in iso.split("-"))
    return f"{d} de {MESES[m - 1]} de {a}"


def nav(prefix=""):
    return f"""<nav class="nav">
  <a class="nav-brand" href="{prefix}index.html"><img src="{prefix}img/psi.png" alt="Logotipo Ledesma Suarez" width="28" height="28"><span>Ledesma Suarez</span></a>
  <button class="nav-toggle" type="button" aria-label="Abrir menu" aria-controls="menu-principal" aria-expanded="false"><span></span><span></span><span></span></button>
  <div class="nav-links" id="menu-principal">
    <a href="{prefix}index.html">Início</a>
    <a href="{prefix}equipe.html">Equipe</a>
    <a href="{prefix}blog.html">Publicações</a>
    <a href="{WA}" target="_blank" rel="noopener" class="nav-cta">Agendar</a>
  </div>
</nav>"""


def rodape(prefix=""):
    return f"""<footer>
  <img class="fpsi" src="{prefix}img/psi.png" alt="" width="30" height="30">
  <p>© Ledesma Suarez · Centro de Saúde e Desenvolvimento<br>
  Rua Capitão Alfredo Cardoso, 34 · Jardim Faculdade · Sorocaba – SP<br>
  WhatsApp (15) 99803-0909 · recepcao@ledesmasuarez.com</p>
  <div class="foot-links">
    <a href="{prefix}index.html">Início</a>
    <a href="{prefix}equipe.html">Equipe</a>
    <a href="{prefix}blog.html">Publicações</a>
    <a href="https://instagram.com/clinicaledesmasuarez" target="_blank" rel="noopener">Instagram</a>
  </div>
</footer>"""


def artigo_html(p, posts):
    url = f"{SITE}/artigos/{p['slug']}.html"
    titulo_seo = f"{p['title']} | Ledesma Suarez"
    if len(titulo_seo) > 65:
        titulo_seo = f"{p['title']} | Ledesma Suarez"
    desc = re.sub(r"\s+", " ", p["excerpt"]).strip()
    if len(desc) > 158:
        desc = desc[:155].rsplit(" ", 1)[0] + "…"

    texto = re.sub(r"<[^>]+>", " ", p["body"])
    palavras = len(texto.split())

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                "@id": url + "#article",
                "headline": p["title"][:110],
                "description": desc,
                "articleSection": p["tag"],
                "keywords": p["keywords"],
                "inLanguage": "pt-BR",
                "wordCount": palavras,
                "datePublished": p["date"],
                "dateModified": p.get("dateModified", p["date"]),
                "mainEntityOfPage": {"@type": "WebPage", "@id": url},
                "url": url,
                "image": f"{SITE}/img/og-image.jpg",
                "author": {
                    "@type": "Person",
                    "name": p["author"],
                    "jobTitle": p["authorRole"],
                    "identifier": p["crp"],
                    "url": f"{SITE}/equipe.html",
                    "worksFor": {"@type": "MedicalClinic", "name": "Clínica Ledesma Suarez"},
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Clínica Ledesma Suarez",
                    "url": SITE,
                    "logo": {"@type": "ImageObject", "url": f"{SITE}/img/psi.png"},
                },
                "isPartOf": {"@type": "Blog", "@id": f"{SITE}/blog.html#blog", "name": "Publicações Ledesma Suarez"},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Início", "item": SITE + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Publicações", "item": f"{SITE}/blog.html"},
                    {"@type": "ListItem", "position": 3, "name": p["title"], "item": url},
                ],
            },
        ],
    }

    outros = [q for q in posts if q["slug"] != p["slug"]]
    outros.sort(key=lambda q: (q["tag"] != p["tag"], q["date"]), reverse=False)
    outros = sorted(outros, key=lambda q: (0 if q["tag"] == p["tag"] else 1, q["date"]))[:3]
    rel = "\n".join(
        f"""      <a class="rel-card" href="{q['slug']}.html">
        <div class="t">{escape(q['tag'])}</div>
        <h3>{escape(q['title'])}</h3>
        <span>{escape(q['author'])} · {q['readMin']} min de leitura</span>
      </a>"""
        for q in outros
    )

    compartilhar_txt = escape(p["title"], quote=True)

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{escape(titulo_seo)}</title>
<meta name="description" content="{escape(desc, quote=True)}">
<meta name="keywords" content="{escape(p['keywords'], quote=True)}">
<meta name="author" content="{escape(p['author'], quote=True)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#3d1260">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{escape(p['title'], quote=True)}">
<meta property="og:description" content="{escape(desc, quote=True)}">
<meta property="og:image" content="{SITE}/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Clínica Ledesma Suarez">
<meta property="article:published_time" content="{p['date']}">
<meta property="article:author" content="{escape(p['author'], quote=True)}">
<meta property="article:section" content="{escape(p['tag'], quote=True)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(p['title'], quote=True)}">
<meta name="twitter:description" content="{escape(desc, quote=True)}">
<meta name="twitter:image" content="{SITE}/img/og-image.jpg">

<link rel="icon" href="../img/favicon.ico">
<link rel="apple-touch-icon" href="../img/psi.png">
<link rel="manifest" href="../manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/artigo.css">

<script type="application/ld+json">
{json.dumps(schema, ensure_ascii=False, indent=2)}
</script>
</head>
<body>
<a class="skip" href="#conteudo">Ir para o conteúdo</a>
<div class="progress" id="progress"></div>

{nav('../')}

<nav class="crumbs" aria-label="Você está aqui">
  <ol>
    <li><a href="../index.html">Início</a></li>
    <li><a href="../blog.html">Publicações</a></li>
    <li aria-current="page">{escape(p['tag'])}</li>
  </ol>
</nav>

<main class="artigo" id="conteudo">
  <article>
    <header class="art-head">
      <span class="art-tag">{escape(p['tag'])}</span>
      <h1>{escape(p['title'])}</h1>
      <p class="art-sub">{escape(p['excerpt'])}</p>
      <div class="art-meta">
        <img src="../{p['avatar']}" alt="{escape(p['author'], quote=True)}" width="48" height="48" loading="lazy">
        <div>
          <div class="nm">{escape(p['author'])}</div>
          <div class="rl">{escape(p['authorRole'])} · {escape(p['crp'])}</div>
        </div>
        <div class="dt"><time datetime="{p['date']}">{data_extenso(p['date'])}</time><br>{p['readMin']} min de leitura</div>
      </div>
    </header>

    <div class="art-body">
{p['body']}
    </div>
  </article>

  <section class="share" aria-label="Compartilhar este artigo">
    <p>Gostou? Compartilhe</p>
    <div class="share-row">
      <a class="wa" href="https://api.whatsapp.com/send?text={compartilhar_txt}%20-%20{url}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u={url}" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url={url}" target="_blank" rel="noopener">LinkedIn</a>
      <button type="button" data-copiar="{url}">Copiar link</button>
    </div>
  </section>

  <section class="autor-box" aria-label="Sobre o autor">
    <img src="../{p['avatar']}" alt="{escape(p['author'], quote=True)}" width="64" height="64" loading="lazy">
    <div>
      <div class="lbl">Sobre quem escreveu</div>
      <h2>{escape(p['author'])}</h2>
      <div class="rl">{escape(p['authorRole'])} · {escape(p['crp'])}</div>
      <p>Integra a equipe da Clínica Ledesma Suarez, Centro de Saúde e Desenvolvimento em Sorocaba&nbsp;/&nbsp;SP. <a href="../equipe.html">Conheça toda a equipe →</a></p>
    </div>
  </section>

  <section class="cta-box">
    <h2>Precisa conversar com um profissional?</h2>
    <p>Atendemos psicologia, psiquiatria, neuropsicologia, nutrição e endocrinologia em Sorocaba — por convênio (Eva Saúde, Hapvida, Amil, Funserv, Unimed, SulAmérica) ou particular.</p>
    <a class="cta-btn" href="{WA}" target="_blank" rel="noopener">Agendar pelo WhatsApp</a>
    <a class="cta-alt" href="../index.html#convenios">Ver convênios atendidos</a>
  </section>

  <section class="rel">
    <div class="lbl">Continue lendo</div>
    <div class="rel-grid">
{rel}
    </div>
  </section>
</main>

{rodape('../')}

<a class="wa-float" href="{WA}" target="_blank" rel="noopener" aria-label="Agendar pelo WhatsApp">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
  <span>Agendar</span>
</a>
<div class="toast" id="toast">Link copiado!</div>

<script src="../assets/site.js" defer></script>
</body>
</html>
"""


def main():
    posts = json.load(open(os.path.join(ROOT, "tools", "posts.json"), encoding="utf-8"))
    posts.sort(key=lambda p: p["date"], reverse=True)

    os.makedirs(os.path.join(ROOT, "artigos"), exist_ok=True)
    for p in posts:
        destino = os.path.join(ROOT, "artigos", p["slug"] + ".html")
        with open(destino, "w", encoding="utf-8") as f:
            f.write(artigo_html(p, posts))
        print("gerado:", os.path.relpath(destino, ROOT))

    # ---- sitemap ----
    hoje = date.today().isoformat()
    linhas = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ""]
    for loc, freq, pri in PAGINAS_FIXAS:
        linhas += ["  <url>", f"    <loc>{SITE}{loc}</loc>", f"    <lastmod>{hoje}</lastmod>",
                   f"    <changefreq>{freq}</changefreq>", f"    <priority>{pri}</priority>", "  </url>", ""]
    for p in posts:
        linhas += ["  <url>", f"    <loc>{SITE}/artigos/{p['slug']}.html</loc>",
                   f"    <lastmod>{p.get('dateModified', p['date'])}</lastmod>",
                   "    <changefreq>monthly</changefreq>", "    <priority>0.7</priority>", "  </url>", ""]
    linhas.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")
    print("gerado: sitemap.xml")

    # ---- feed RSS ----
    def rfc822(iso):
        a, m, d = (int(x) for x in iso.split("-"))
        from datetime import datetime
        return datetime(a, m, d, 9, 0, 0).strftime("%a, %d %b %Y %H:%M:%S +0000")

    itens = []
    for p in posts:
        itens.append(f"""    <item>
      <title>{escape(p['title'])}</title>
      <link>{SITE}/artigos/{p['slug']}.html</link>
      <guid isPermaLink="true">{SITE}/artigos/{p['slug']}.html</guid>
      <description>{escape(p['excerpt'])}</description>
      <category>{escape(p['tag'])}</category>
      <dc:creator>{escape(p['author'])}</dc:creator>
      <pubDate>{rfc822(p['date'])}</pubDate>
    </item>""")
    feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Publicações — Clínica Ledesma Suarez</title>
    <link>{SITE}/blog.html</link>
    <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Artigos sobre saúde mental, TDAH, autismo, neurodivergência e desenvolvimento, pela equipe da Clínica Ledesma Suarez em Sorocaba/SP.</description>
    <language>pt-BR</language>
    <lastBuildDate>{rfc822(hoje)}</lastBuildDate>
{chr(10).join(itens)}
  </channel>
</rss>
"""
    with open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8") as f:
        f.write(feed)
    print("gerado: feed.xml")

    # ---- cards do blog ----
    cards = []
    for p in posts:
        cards.append(f"""    <article class="card" data-cat="{escape(p['tag'], quote=True)}">
      <a class="card-link" href="artigos/{p['slug']}.html">
        <div class="card-tag"><span>{escape(p['tag'])}</span></div>
        <div class="card-body">
          <h2 class="card-title">{escape(p['title'])}</h2>
          <p class="card-excerpt">{escape(p['excerpt'])}</p>
          <div class="card-author">
            <img src="{p['avatar']}" alt="{escape(p['author'], quote=True)}" width="40" height="40" loading="lazy">
            <div class="card-author-info">
              <div class="name">{escape(p['author'])}</div>
              <div class="crp">{escape(p['crp'])}</div>
            </div>
          </div>
          <div class="card-foot">
            <time datetime="{p['date']}">{data_extenso(p['date'])}</time>
            <span class="card-read">Ler artigo <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
          </div>
        </div>
      </a>
    </article>""")
    with open(os.path.join(ROOT, "tools", "cards-blog.html"), "w", encoding="utf-8") as f:
        f.write("\n".join(cards) + "\n")

    idx = []
    for p in posts[:3]:
        idx.append(f"""      <a class="pub-card" href="artigos/{p['slug']}.html">
        <div class="pub-tag">{escape(p['tag'])}</div>
        <h3 class="pub-title">{escape(p['title'])}</h3>
        <div class="pub-author">
          <img src="{p['avatar']}" alt="{escape(p['author'], quote=True)}" width="34" height="34" loading="lazy">
          <div><div class="pub-name">{escape(p['author'])}</div><div class="pub-crp">{escape(p['crp'])}</div></div>
        </div>
      </a>""")
    with open(os.path.join(ROOT, "tools", "cards-index.html"), "w", encoding="utf-8") as f:
        f.write("\n".join(idx) + "\n")
    print("gerado: tools/cards-blog.html e tools/cards-index.html")


if __name__ == "__main__":
    main()
