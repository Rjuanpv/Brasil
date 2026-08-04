/**
 * 08 — FUTURO. As frentes em que o país já está trabalhando.
 *
 * Nada aqui é promessa: são coisas que existem hoje. O briefing pede tecnologia,
 * criatividade, inovação e transformação — e a seção só funciona se cada item
 * puder ser verificado, senão vira publicidade.
 */
export interface Front {
  /** Rótulo curto — o campo. */
  field: string;
  /** O que já aconteceu nele. */
  fact: string;
  /** Marcador temporal, quando existe um. */
  mark?: string;
}

export const futureFronts: readonly Front[] = [
  {
    field: "Pagamentos",
    fact: "O Pix virou o jeito padrão de pagar num país inteiro, em poucos anos.",
    mark: "2020",
  },
  {
    field: "Energia",
    fact: "Mais de 80% da eletricidade brasileira vem de fontes renováveis.",
  },
  {
    field: "Agro",
    fact: "Pesquisa tropical transformou solo pobre em uma das maiores lavouras do mundo.",
  },
  {
    field: "Biotecnologia",
    fact: "Vacinas produzidas aqui, para cá e para outros países.",
  },
  {
    field: "Aeroespacial",
    fact: "Aviões desenhados e montados no país voam em quase todos os continentes.",
  },
  {
    field: "Criação",
    fact: "Música, cinema, games e design saem daqui sem pedir licença a ninguém.",
  },
];
