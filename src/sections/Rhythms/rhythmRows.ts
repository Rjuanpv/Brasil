/**
 * 05 — RITMOS. As faixas que atravessam a seção.
 *
 * Cada linha é um grupo de gêneros que dialogam entre si — a primeira é a
 * herança afro-brasileira do carnaval, a segunda é o Nordeste do forró, a
 * terceira é a sala de estar do choro e da bossa, a quarta é o que toca hoje.
 * A leitura vertical conta a mesma história que a horizontal.
 *
 * Direções e velocidades diferentes por linha são o ponto: o briefing pede
 * "ritmo visual", e ritmo é o descompasso entre camadas, não o movimento em si.
 * Faixas paralelas na mesma velocidade leriam como um bloco só deslizando.
 */
export interface RhythmRow {
  words: readonly string[];
  /** Velocidade de repouso, em pixels por segundo. */
  speed: number;
  /** 1 desliza para a esquerda; -1 para a direita. */
  direction: 1 | -1;
  /** Linha vazada, só contorno — alterna com as cheias para criar profundidade. */
  outlined?: boolean;
}

export const rhythmRows: readonly RhythmRow[] = [
  {
    words: ["Samba", "Frevo", "Maracatu", "Carimbó", "Coco", "Jongo"],
    speed: 58,
    direction: 1,
  },
  {
    words: ["Forró", "Baião", "Xote", "Xaxado", "Repente", "Arrocha"],
    speed: 82,
    direction: -1,
    outlined: true,
  },
  {
    words: ["Choro", "Bossa Nova", "Samba-Canção", "Modinha", "Seresta"],
    speed: 46,
    direction: 1,
    outlined: true,
  },
  {
    words: ["Funk", "Axé", "Tecnobrega", "Manguebeat", "Rap", "Brega-Funk"],
    speed: 96,
    direction: -1,
  },
];

/** O que a seção afirma, em cinco palavras — os eixos que o briefing lista. */
export const rhythmTopics = [
  "Música",
  "Dança",
  "Cultura",
  "Festas",
  "Criatividade",
] as const;
