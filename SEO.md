# SEO e engajamento — Clínica Ledesma Suarez

Documento de referência do que foi implementado no site e do que precisa ser feito
fora dele (Google, redes sociais, conteúdo).

---

## 1. O que já está implementado

### Estrutura de conteúdo indexável
- **6 páginas individuais de artigo** em `/artigos/<slug>.html`. Antes todo o conteúdo
  do blog vivia dentro de modais numa única URL (`blog.html`) — o Google só conseguia
  ranquear uma página para seis assuntos diferentes. Agora cada texto tem URL própria,
  título, meta description, imagem social e dados estruturados.
- `blog.html` virou um **índice real**: os cards são links `<a href>` rastreáveis,
  com filtro por tema, data visível e chamada para ação.
- **Links internos** entre home → artigos → equipe → blog, que distribuem autoridade
  e aumentam páginas por sessão.

### Metadados
- Títulos reescritos com a palavra-chave + cidade
  (ex.: `Psicólogo e Psiquiatra em Sorocaba | Clínica Ledesma Suarez`).
- Meta descriptions com até ~158 caracteres em **todas** as páginas
  (`blog.html` e os artigos não tinham nenhuma).
- `canonical`, `robots` com `max-image-preview:large` (habilita miniatura grande na busca),
  Open Graph e Twitter Card em todas as páginas.
- Metatags geográficas (`geo.region`, `geo.position`, `ICBM`) para busca local.
- `<meta charset>` movido para o início do `<head>` — antes vinha depois do Meta Pixel,
  fora dos primeiros 1024 bytes exigidos pela especificação.

### Dados estruturados (schema.org / rich results)
- **Home**: grafo com `MedicalClinic` + `LocalBusiness` (endereço, geo, horários,
  formas de pagamento, cidades atendidas, catálogo de 8 especialidades, fundadores,
  ação de agendamento), `WebSite`, `WebPage` e **`FAQPage`**.
- **Artigos**: `BlogPosting` completo (autor com CRP, data, seção, contagem de palavras,
  publisher) + `BreadcrumbList`.
- **Blog**: `Blog` com a lista de posts + `BreadcrumbList`.
- **Equipe**: `AboutPage` com os 20 profissionais como `Person` (cargo e registro).

### Novos arquivos de descoberta
- `sitemap.xml` regenerado com as 9 URLs e `lastmod` correto (antes tinha 3 URLs e data fixa).
- `feed.xml` — feed RSS das publicações (agregadores, newsletters, Google Discover).
- `robots.txt` com sitemap, bloqueio de `/tools/` e liberação explícita para bots de IA
  (GPTBot, OAI-SearchBot, PerplexityBot, Google-Extended, ClaudeBot) — isso é o que faz
  o site ser citado em respostas de IA.
- `manifest.webmanifest` + `theme-color` (instalável no celular, barra colorida no Android).
- `404.html` com navegação, para não perder visitante em link quebrado.

### Engajamento e conversão
- **Seção de Perguntas Frequentes** na home (7 perguntas reais sobre convênios, endereço,
  horários, idade mínima, especialidades, agendamento e avaliação neuropsicológica),
  em acordeão e marcada como `FAQPage` — pode aparecer como resultado expandido no Google.
- **Texto institucional "Sobre a Clínica"** com as palavras-chave que as pessoas realmente
  pesquisam e links internos.
- **Botão flutuante de WhatsApp** em todas as páginas.
- **Botões de compartilhamento** (WhatsApp, Facebook, LinkedIn, copiar link / Web Share API)
  nos artigos.
- **Barra de progresso de leitura**, tempo estimado de leitura, box do autor e
  **"Continue lendo"** com artigos relacionados — aumentam tempo na página e páginas/sessão.
- **CTA de agendamento** ao final de cada artigo e da página de equipe.
- **Rastreamento de conversão**: todo clique em link do WhatsApp dispara `clique_whatsapp`
  no Google Ads/GA e `Contact` no Meta Pixel.

### Performance e acessibilidade (fatores de ranqueamento)
- `preconnect` para Google Fonts e `dns-prefetch` para o Tag Manager.
- `width`/`height`, `loading="lazy"` e `decoding="async"` nas imagens — evita o
  deslocamento de layout (CLS) que penaliza no Core Web Vitals.
  A imagem do topo recebeu `fetchpriority="high"`.
- `alt` descritivos (antes muitos eram "Ψ", "ID", "LF").
- Link "Ir para o conteúdo", landmarks `<main>`, `<header>`, `<article>`, breadcrumbs
  visíveis e `aria-*` nos componentes interativos.

---

## 2. Como publicar um novo artigo

1. Edite `tools/posts.json` e acrescente um objeto:

```json
{
  "slug": "endereco-da-url-sem-acento",
  "title": "Título do artigo",
  "tag": "TDAH",
  "excerpt": "Resumo de 1 a 3 frases (vira a meta description e o card).",
  "author": "Nome do profissional",
  "authorRole": "Psicóloga",
  "crp": "CRP 06/000000",
  "avatar": "img/autor-nome.png",
  "date": "2026-10-15",
  "readMin": 4,
  "keywords": "palavra-chave 1, palavra-chave 2, termo + Sorocaba",
  "body": "<p>Primeiro parágrafo…</p><h3>Subtítulo</h3><p>…</p>"
}
```

2. Rode:

```bash
python3 tools/gerar-artigos.py
```

Isso regenera as páginas em `artigos/`, o `sitemap.xml`, o `feed.xml` e os trechos
`tools/cards-blog.html` / `tools/cards-index.html` — cole esses dois trechos no
`blog.html` (dentro de `.articles-grid`) e no `index.html` (dentro de `.pub-grid`).

---

## 3. Pendências que só você pode resolver (alto impacto)

| Ação | Por que importa |
|---|---|
| **Google Business Profile** (Perfil da Empresa) completo, com fotos, horários, serviços e posts semanais | Para clínica local, é a maior fonte de visitas. Ranqueia no mapa e no "perto de mim". |
| **Pedir avaliações no Google** aos pacientes | Nota e volume de avaliações são o principal fator do ranking local. |
| **Google Search Console** — verificar o domínio e enviar `https://ledesmasuarez.com.br/sitemap.xml` | Acelera a indexação das novas páginas e mostra quais buscas trazem visitas. |
| **Bing Webmaster Tools** — enviar o mesmo sitemap | Alimenta Bing e o Copilot. |
| **Google Analytics 4** | Hoje só existe a tag do Google Ads (`AW-…`) e o Meta Pixel; falta medir tráfego orgânico. |
| **Confirmar as datas dos artigos** em `tools/posts.json` | Usei datas estimadas de fevereiro/2026 com base no tema (Carnaval). Ajuste para as reais. |
| **Imagem de capa por artigo** (1200×630) | Hoje todos usam a `og-image.jpg` genérica. Capas próprias aumentam muito o clique no WhatsApp e redes. |
| **Publicar 2 a 4 artigos por mês** | Frequência é o que faz o blog crescer. Temas com mais busca em Sorocaba: "laudo de TDAH", "avaliação neuropsicológica preço", "psiquiatra infantil", "terapia pelo convênio". |
| **Citações locais** (listar a clínica no Doctoralia, Apontador, páginas da Unimed/Hapvida) | NAP consistente (nome, endereço, telefone) reforça o SEO local. |
| **Comprimir as imagens e servir em WebP** | `fachada.jpg`, `espaco*.jpg` e `fundadores.jpg` são o maior peso da página. |
| **Reduzir o widget de avaliações (Elfsight)** | É um script de terceiros pesado; se o PageSpeed acusar, considere trocar por avaliações estáticas. |

---

## 4. Sugestões de pauta com busca local

- "Quanto custa uma avaliação neuropsicológica em Sorocaba?"
- "Como conseguir laudo de TDAH pelo convênio"
- "Psicólogo infantil: a partir de que idade levar meu filho?"
- "Diferença entre psicólogo, psiquiatra e neuropsicólogo"
- "Terapia de casal funciona? O que esperar das primeiras sessões"
- "Sinais de ansiedade em crianças em idade escolar"
- "Endocrinologista pediátrico: quando procurar?"

Cada um desses textos deve terminar com o CTA de agendamento e linkar para a página
da equipe e para artigos relacionados — exatamente o padrão já gerado pelo script.
