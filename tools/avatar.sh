#!/usr/bin/env bash
# Gera um avatar circular 200x200 no mesmo padrão dos arquivos img/autor-*.png
# (PNG com fundo transparente fora do círculo).
#
# Uso:
#   tools/avatar.sh FOTO_ORIGINAL img/autor-nome.png [POSICAO_VERTICAL]
#
# POSICAO_VERTICAL é de 0 a 100 e define de onde o quadrado é recortado:
#   0   = topo da foto        (rosto bem no alto do enquadramento)
#   12  = padrão, bom para retratos de meio corpo
#   50  = centro exato
#   100 = base da foto
#
# Exemplo:
#   tools/avatar.sh ~/fotos/Marcia.jpeg img/autor-marcia.png 8

set -euo pipefail

src="${1:?informe a foto de origem}"
out="${2:?informe o arquivo de saida, ex: img/autor-nome.png}"
off="${3:-12}"
size=200

w=$(identify -format "%w" "${src}[0]")
h=$(identify -format "%h" "${src}[0]")

# lado do quadrado = menor dimensao da foto
if [ "$w" -lt "$h" ]; then side=$w; else side=$h; fi
x=$(( (w - side) / 2 ))
y=$(( (h - side) * off / 100 ))

r=$(echo "$size" | awk '{print ($1-1)/2}')

convert "$src" \
  -auto-orient \
  -crop "${side}x${side}+${x}+${y}" +repage \
  -resize "${size}x${size}^" \
  -gravity center -extent "${size}x${size}" \
  \( -size "${size}x${size}" xc:none -fill white -draw "circle $r,$r $r,0" \) \
  -alpha set -compose DstIn -composite \
  -strip "$out"

echo "gerado: $out  ($(identify -format '%wx%h, alpha=%A' "$out"))"
