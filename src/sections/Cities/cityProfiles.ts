/**
 * 07 — CIDADES. As cinco que o briefing nomeia.
 *
 * A população é a do Censo 2022 do IBGE, arredondada — número de censo, e não
 * de estimativa, para que a fonte seja única e verificável.
 *
 * `offset` e `align` são composição, não dado: cada cidade ocupa a linha de um
 * jeito diferente, porque a direção de arte proíbe repetir o mesmo layout em
 * todas as entradas.
 */
export interface City {
  name: string;
  /** Ano de fundação. */
  founded: number;
  /** População em milhões, Censo 2022. */
  people: number;
  /** O que a cidade faz, em duas ou três palavras. */
  trait: string;
  /** Alinhamento do bloco na linha. */
  align: "start" | "center" | "end";
  /** Deslocamento horizontal no scroll, em % da largura do nome. */
  offset: number;
}

export const cities: readonly City[] = [
  {
    name: "São Paulo",
    founded: 1554,
    people: 11.5,
    trait: "Não desacelera nunca",
    align: "start",
    offset: -5,
  },
  {
    name: "Rio de Janeiro",
    founded: 1565,
    people: 6.2,
    trait: "Entre a serra e o mar",
    align: "end",
    offset: 6,
  },
  {
    name: "Salvador",
    founded: 1549,
    people: 2.4,
    trait: "A primeira capital",
    align: "center",
    offset: -4,
  },
  {
    name: "Brasília",
    founded: 1960,
    people: 2.8,
    trait: "Desenhada do zero",
    align: "end",
    offset: 5,
  },
  {
    name: "Curitiba",
    founded: 1693,
    people: 1.8,
    trait: "Planejada para caber",
    align: "start",
    offset: -6,
  },
];
