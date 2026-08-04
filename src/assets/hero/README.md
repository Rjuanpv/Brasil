# Camadas da Hero — especificação de produção (Canva)

Os arquivos `.svg` aqui são **placeholders procedurais**. Eles existem para que a Hero
já tenha profundidade real hoje. Cada um deve ser substituído pelo export equivalente
do Canva — o código de animação não muda.

## Como substituir

1. Exporte a camada do Canva no formato indicado abaixo.
2. Coloque o arquivo nesta pasta, com o **nome exato** da tabela.
3. Em `src/sections/Hero/heroLayers.ts`, troque a extensão do import
   (`hero-main.svg` → `hero-main.webp`). Nada mais precisa mudar.

## Camadas

| Arquivo | Formato | Dimensão sugerida | O que deve conter | Parallax |
|---|---|---|---|---|
| `hero-background.webp` | WebP | 2400×1350 | Campo verde profundo (`#063D2B`) com variação sutil de luz. Sem elementos reconhecíveis — é a base, não a composição. | 5px |
| `hero-shape-blue.svg` | SVG | vetor | Uma forma sólida em azul profundo (`#073B7A`). Círculo ou losango. Sem gradiente, sem borda. | 15px |
| `hero-main.webp` | WebP | 1600×2000 (retrato) | A imagem principal — o sujeito da composição. **Fundo transparente ou recortado.** Alto contraste, corte editorial ousado. | 30px |
| `hero-shape-yellow.svg` | SVG | vetor | Forma sólida em amarelo (`#FFD500`), com aresta orgânica. É ela que passa na frente da tipografia. | 15px |
| `hero-texture.webp` | WebP | 1200×1200 | Grão ou textura discreta, tileável, em escala de cinza. Será aplicada com opacidade baixa e blend mode. | — |

## Regras que valem para todas

- **Uma camada por arquivo.** Não exporte a composição achatada: sem separação não há
  profundidade, e o GSAP só consegue mover o bloco inteiro.
- **Transparência onde houver sobreposição** — `hero-main` e as formas precisam de
  fundo transparente (por isso PNG/WebP com alpha, nunca JPG).
- **Mesmo enquadramento em todas as camadas raster.** Se o fundo e o sujeito forem
  exportados com recortes diferentes, eles não se alinham em tela.
- **Margem de segurança**: as camadas se deslocam até 30px. Deixe folga nas bordas
  para que o movimento não revele um vazio.
- Nada de branco puro — use `#F4F0E6`.
- Cor dominante verde profundo, destaque amarelo, apoio azul. Não use as três com o
  mesmo peso.

## Nomes

Descritivos e estáveis. `hero-main.webp`, não `imagem-final-2.png`.
