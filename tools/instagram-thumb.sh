#!/usr/bin/env bash
# Prepara uma imagem baixada do Instagram para a grade do site:
# recorta em quadrado, redimensiona para 600x600 e remove metadados.
#
# Uso:
#   tools/instagram-thumb.sh FOTO_ORIGINAL img/ig/ig-01.jpg [POSICAO_VERTICAL]
#
# POSICAO_VERTICAL é de 0 a 100 (0 = topo, 50 = centro, padrão 50).
# Posts do feed já são quadrados; Reels (9:16) precisam de ajuste — use 25 ou 30
# para manter o rosto/título dentro do recorte.
#
# Exemplo:
#   tools/instagram-thumb.sh ~/Downloads/post-tdah.jpg img/ig/ig-01.jpg
#   tools/instagram-thumb.sh ~/Downloads/reels-equipe.jpg img/ig/ig-02.jpg 25

set -euo pipefail

src="${1:?informe a imagem de origem}"
out="${2:?informe o arquivo de saida, ex: img/ig/ig-01.jpg}"
off="${3:-50}"
size=600

mkdir -p "$(dirname "$out")"

w=$(identify -format "%w" "${src}[0]")
h=$(identify -format "%h" "${src}[0]")

if [ "$w" -lt "$h" ]; then side=$w; else side=$h; fi
x=$(( (w - side) / 2 ))
y=$(( (h - side) * off / 100 ))

convert "$src" \
  -auto-orient \
  -crop "${side}x${side}+${x}+${y}" +repage \
  -resize "${size}x${size}^" \
  -gravity center -extent "${size}x${size}" \
  -strip -quality 82 \
  "$out"

echo "gerado: $out  ($(identify -format '%wx%h, %b' "$out"))"
echo "Agora adicione a entrada correspondente em assets/instagram.json."
