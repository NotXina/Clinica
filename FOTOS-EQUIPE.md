# Como adicionar as fotos das psicólogas

A página da equipe já está preparada para quatro fotos que ainda **não** estão no
repositório. Enquanto os arquivos não existirem, o site mostra o círculo com as
iniciais normalmente — não aparece imagem quebrada. Assim que os arquivos forem
adicionados com o nome certo, a foto substitui as iniciais automaticamente.

## Arquivos esperados

| Profissional | Arquivo a criar | Iniciais hoje |
|---|---|---|
| Ana Marcia Gimenez Rodrigues | `img/autor-anamarcia.png` | AG |
| Debora Kitayama dos Santos | `img/autor-debora.png` | DK |
| Rafaela de Oliveira Neto Ignacio | `img/autor-rafaela.png` | RO |
| Marcia Aparecida dos Santos Guerra | `img/autor-marcia.png` | MG |

Formato: **PNG 200×200 com recorte circular e fundo transparente**, igual aos demais
`img/autor-*.png`.

## Gerando o recorte circular

Com as fotos originais em mãos, rode na raiz do projeto:

```bash
tools/avatar.sh /caminho/AnaMarcia.jpeg img/autor-anamarcia.png 10
tools/avatar.sh /caminho/Debora.jpeg    img/autor-debora.png    18
tools/avatar.sh /caminho/Rafaela.jpeg   img/autor-rafaela.png   10
tools/avatar.sh /caminho/Marcia.jpeg    img/autor-marcia.png    6
```

O último número é o enquadramento vertical (0 = topo, 50 = centro). Os valores acima
são sugestões para cada foto:

- **Ana Marcia** (`10`) — retrato vertical, rosto no terço superior.
- **Debora** (`18`) — foto vertical em que ela aparece mais ao centro.
- **Rafaela** (`10`) — retrato vertical, rosto no alto.
- **Marcia** (`6`) — foto mais aberta, de shopping; precisa subir bastante o recorte
  para o rosto preencher o círculo. É a que vale mais a pena substituir por uma foto
  de fundo neutro quando houver.

Confira o resultado abrindo o arquivo gerado. Se o rosto ficar cortado ou pequeno
demais, rode de novo mudando só o último número.

## Depois de gerar

Nada mais precisa ser editado no HTML. Basta confirmar que os quatro arquivos estão em
`img/` e publicar. Para conferir localmente:

```bash
python3 -m http.server 8080
# abra http://localhost:8080/equipe.html
```

---

## Usando fotos que já estão no Instagram

As quatro fotos que faltam provavelmente já existem no **@clinicaledesmasuarez**
(posts de apresentação da equipe). Como o Instagram bloqueia download automatizado,
o caminho é manual e leva ~5 minutos:

1. Abra o post no Instagram **logado na conta da clínica**.
2. Baixe a imagem em resolução cheia:
   - no celular, pelo próprio app (menu do post → compartilhar/salvar), ou
   - no desktop, botão direito → "Abrir imagem em nova guia" → salvar.
   Prefira sempre o **arquivo original** que foi enviado ao Instagram (geralmente está
   no celular de quem postou ou no drive da clínica), porque o Instagram recomprime e
   a foto chega ao site com menos qualidade.
3. Rode `tools/avatar.sh` normalmente, como descrito acima.

**Atenção:** só use fotos de profissionais da equipe, com autorização de uso de imagem.
Nunca reaproveite para o site imagens de posts que contenham pacientes, crianças
atendidas ou terceiros — além da questão de direito de imagem, isso fere o sigilo
profissional (Nota Técnica CFP nº 1/2022).

## Outros materiais do Instagram que valem para o site

| Material do perfil | Onde usa no site |
|---|---|
| Fotos de posts de equipe | `img/autor-*.png` (via `tools/avatar.sh`) |
| Fotos da fachada, salas e recepção | galeria da home (`img/espaco*.jpg`, `img/fachada.jpg`) |
| Capas de carrossel educativo | grade do Instagram na home (`assets/instagram.json` + `tools/instagram-thumb.sh`) |
| Textos de legendas longas | rascunho de novos artigos em `/artigos/` |
| Dúvidas recorrentes da caixinha de perguntas | novas perguntas no FAQ da home |
