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
| 02 | Hero | composição em camadas separadas, com parallax de mouse por profundidade |
| — | Faixa de estados | as 27 unidades federativas em movimento contínuo |
| 03 | Manifesto | números com contagem animada |
| 04 | Territórios | lista editorial das cinco regiões, com revelação de imagem por blocos |

Faltam: 05 Ritmos, 06 Natureza, 07 Cidades, 08 Futuro, 09 Encerramento e rodapé.

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

O efeito de cursor `SplashCursor` é adaptado de
[React Bits](https://reactbits.dev), com os desvios do original comentados no
próprio arquivo.

Fontes: [Anton](https://fonts.google.com/specimen/Anton) e
[Inter](https://fonts.google.com/specimen/Inter), ambas SIL Open Font License.
