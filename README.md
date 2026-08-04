# Brasil em Movimento

Experiência digital de página única sobre o Brasil. O conceito é que o país não
cabe numa imagem estática — o movimento é parte da narrativa, não decoração.

Projeto pessoal, em construção.

## Stack

React · Vite · TypeScript · GSAP + ScrollTrigger · Lenis · CSS moderno

Sem biblioteca de UI e sem framework de animação além do GSAP.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build
npm run typecheck
```

Em desenvolvimento, `?motion=full` ignora a preferência de movimento reduzido do
sistema e mantém a escolha pela sessão. `?motion=system` volta a obedecê-la.

## O que existe

| | seção | estado |
|---|---|---|
| 01 | Abertura | letras de BRASIL sobem de máscaras, formam a palavra, e o scroll a parte ao meio revelando a Hero |
| 02 | Hero | as camadas voltam pelas bordas conforme a palavra se parte, e depois ganham parallax de mouse por profundidade |
| — | Faixa de estados | as 27 unidades federativas em movimento contínuo |
| 03 | Manifesto | números com contagem animada |
| 04 | Territórios | lista editorial das cinco regiões, com revelação de imagem por blocos |
| 05 | Ritmos | quatro faixas de gêneros que aceleram conforme a velocidade do scroll |
| 06 | Natureza | os seis biomas revelados por recorte orgânico, a maré que vira, e um rastro de mar, praias e rios que segue o ponteiro sobre o azul |
| 07 | Cidades | cinco nomes em escala extrema, cada um com deslocamento próprio |
| 08 | Futuro | malha técnica em parallax, preto e verde vibrante |
| 09 | Encerramento | a última frase entra por caracteres, e o verde volta atrás dela |
| — | Rodapé | nome, links, créditos, ano |

A narrativa está fechada. O que falta é substituição de assets, não estrutura: as
camadas da Hero e as fotografias das regiões continuam sendo placeholders.

## A virada de cor

Nas quatro primeiras seções o chão é verde. Na Natureza, quando o bloco da costa
cruza 55% da tela, uma onda azul sobe pela viewport inteira e o fundo da
experiência muda — Cidades acontece sobre o mar, e o preto opaco do Futuro o
encerra.

A troca é de uma camada só, fixa, atrás de tudo (`WaveBackdrop`). As seções
anteriores nunca ficam sabendo: elas têm fundo opaco e simplesmente a escondem.
Quem aparece por cima do fundo são as duas seções que se declaram transparentes.

A decisão de quando virar é da Natureza, que contém o gatilho; o estado mora no
`App`; a pintura é do `WaveBackdrop`. Nenhum dos três precisa de referência para
os outros dois.

## Estrutura

```
src/
├── animations/     timelines reutilizáveis (entrada das letras, revelação, parallax)
├── components/     peças de interface e efeitos
├── sections/       blocos narrativos
├── hooks/          mouse global, scroll suave, media queries, revelação de seção
├── lib/            constantes do motion system, split de texto
├── styles/         tokens, reset, globais
└── assets/         camadas visuais por seção
```

Duas convenções que atravessam o projeto:

- **Um único listener de ponteiro**, distribuído por contexto e consumido via
  `gsap.quickTo`. Nenhum componente registra `mousemove` próprio.
- **Camadas visuais separadas por arquivo**, para que cada uma possa ser animada
  com profundidade própria. Os assets são placeholders procedurais até os
  exports finais chegarem.

- **Modo reduzido é redução, não remoção.** Sob `prefers-reduced-motion` o
  percurso sai e o conteúdo fica: a maré ainda troca de cor, as faixas de ritmos
  param mas ganham rolagem manual, os números aparecem no valor final. Quando a
  decisão precisa ser lida pelo CSS e pelo JavaScript ao mesmo tempo, ela é
  anunciada num `data-static` no DOM — a media query não enxerga o override de
  `?motion=full`, e os dois lados acabariam discordando.

## Créditos das imagens

As fotografias das regiões são **provisórias**, do Wikimedia Commons, e serão
substituídas. Estão aqui sob as licenças abaixo:

| Região | Autor | Licença |
|---|---|---|
| Norte — *Aerial view of the Amazon Rainforest* | lubasi | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| Nordeste — *Lençóis Maranhenses* | Julio Cesar Goncalves Corrêa; obra derivada de Aristeas | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Centro-Oeste — *Cerrado, Chapada dos Veadeiros* | Eliane de Castro | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Sudeste — *Panoramic view of São Paulo* | Wilfredor | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Sul — *Cânion Itaimbezinho* | Ricardo Freitas | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |

Links diretos para cada arquivo de origem em
[`src/assets/territories/CREDITS.md`](src/assets/territories/CREDITS.md).

As dez fotografias de **mar, praias e rios** do rastro da Natureza também vêm do
Wikimedia Commons, sob CC BY ou CC BY-SA — Praia do Gunga (AL), Taipu de Fora,
Caravelas e Cumuru (BA), Bombinhas e Guarda do Embaú (SC), rio Amazonas (PA),
cachoeira de Paulo Afonso (BA) e dois rios sem localização declarada. Todas
exigem atribuição: autor, licença e link de cada uma em
[`src/assets/water/CREDITS.md`](src/assets/water/CREDITS.md).

Os efeitos `SplashCursor` e `ImageTrail` são adaptados de
[React Bits](https://reactbits.dev), com os desvios do original comentados nos
próprios arquivos.

Fontes: [Anton](https://fonts.google.com/specimen/Anton) e
[Inter](https://fonts.google.com/specimen/Inter), ambas SIL Open Font License.
