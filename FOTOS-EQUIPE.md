# Como adicionar as fotos das psicólogas

As quatro fotos abaixo **já estão no repositório** e aparecem normalmente na
página da equipe. A foto da recepção nova está em `img/espaco4.jpg`, na galeria
"Nosso Espaço" da página inicial.

| Profissional | Arquivo | Status |
|---|---|---|
| Ana Marcia Gimenez Rodrigues | `img/autor-anamarcia.png` | ok |
| Debora Kitayama dos Santos | `img/autor-debora.png` | ok |
| Rafaela de Oliveira Neto Ignacio | `img/autor-rafaela.png` | ok |
| Marcia Aparecida dos Santos Guerra | `img/autor-marcia.png` | ok |

## Adicionando novas fotos

Se um arquivo `autor-*.png` não existir, o site mostra o círculo com as iniciais
da profissional — não aparece imagem quebrada. Assim que o arquivo for adicionado
com o nome certo, a foto substitui as iniciais automaticamente.

Formato: **PNG 200×200 com recorte circular e fundo transparente**, igual aos demais
`img/autor-*.png`.

## Gerando o recorte circular

Para uma foto nova, rode na raiz do projeto:

```bash
tools/avatar.sh /caminho/Foto.jpeg img/autor-nome.png 12
```

O último número é o enquadramento vertical (0 = topo, 50 = centro). Confira o
resultado abrindo o arquivo gerado. Se o rosto ficar cortado ou pequeno demais,
rode de novo mudando só o último número.

## Depois de gerar

Nada mais precisa ser editado no HTML. Basta confirmar que o arquivo está em
`img/` com o nome referenciado na página e publicar. Para conferir localmente:

```bash
python3 -m http.server 8080
# abra http://localhost:8080/equipe.html
```
