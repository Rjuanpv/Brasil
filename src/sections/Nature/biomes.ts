/**
 * Os seis biomas brasileiros.
 *
 * As participações são as do IBGE (mapa de biomas, revisão de 2019) e somam
 * ~99,6% — o resto é o sistema costeiro. Como no Manifesto, o número só sustenta
 * a ideia se for verdadeiro; o valor fica separado do texto para que a
 * formatação seja do CSS, não do dado.
 */
export interface Biome {
  name: string;
  /** Participação no território brasileiro, em %. */
  share: number;
  /** Uma frase — o que distingue o bioma, não o que ele tem. */
  note: string;
}

export const biomes: readonly Biome[] = [
  {
    name: "Amazônia",
    share: 49.5,
    note: "A maior floresta tropical do planeta, e metade do país.",
  },
  {
    name: "Cerrado",
    share: 23.3,
    note: "A savana mais rica em plantas que existe. Nasce água aqui.",
  },
  {
    name: "Mata Atlântica",
    share: 13.0,
    note: "O bioma mais fragmentado — e onde vive a maioria dos brasileiros.",
  },
  {
    name: "Caatinga",
    share: 9.9,
    note: "Só existe aqui. Fica cinza, chove, e vira verde em dois dias.",
  },
  {
    name: "Pampa",
    share: 2.1,
    note: "Campo aberto até a linha do horizonte, no extremo sul.",
  },
  {
    name: "Pantanal",
    share: 1.8,
    note: "A maior planície alagável contínua do mundo. Enche e seca todo ano.",
  },
];
