/*
  Fotografias provisórias do Wikimedia Commons, com licença livre — ver
  CREDITS.md na mesma pasta.

  Elas existem para tornar o efeito de revelação por blocos avaliável: sobre um
  SVG chapado a dissolução quase não aparece, porque não há textura para os
  blocos revelarem.

  A DIREÇÃO DE ARTE pede para evitar fotografia de banco e imagens turísticas
  previsíveis — então isto é andaime, não decisão de design. Os exports do Canva
  substituem mantendo o retrato 4:5.
*/
import norte from "@/assets/territories/territories-norte.jpg";
import nordeste from "@/assets/territories/territories-nordeste.jpg";
import centroOeste from "@/assets/territories/territories-centro-oeste.jpg";
import sudeste from "@/assets/territories/territories-sudeste.jpg";
import sul from "@/assets/territories/territories-sul.jpg";

/**
 * As cinco regiões, como linhas de uma lista editorial.
 *
 * Cada linha tem três rótulos, na ordem em que aparecem: contagem à esquerda,
 * nome grande ao centro, característica à direita.
 *
 * As imagens são placeholders procedurais. Os exports do Canva entram no lugar
 * mantendo o retrato 4:5 que o cartão de preview espera.
 */
export interface Region {
  /** Rótulo curto à esquerda. */
  info: string;
  /** Nome da região — o elemento tipográfico da linha. */
  name: string;
  /** Rótulo curto à direita. */
  tag: string;
  image: string;
}

export const regions: readonly Region[] = [
  { info: "7 estados", name: "Norte", tag: "Floresta", image: norte },
  { info: "9 estados", name: "Nordeste", tag: "Litoral e sertão", image: nordeste },
  { info: "4 estados", name: "Centro-Oeste", tag: "Cerrado", image: centroOeste },
  { info: "4 estados", name: "Sudeste", tag: "Densidade", image: sudeste },
  { info: "3 estados", name: "Sul", tag: "Serra e pampa", image: sul },
];
