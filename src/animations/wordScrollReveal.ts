import gsap from "gsap";

/*
  FASE 2 — abertura da palavra, controlada pelo scroll.

  A palavra é cortada no meio da altura das letras. A metade de cima sobe, a de
  baixo desce, e a Hero é revelada fisicamente pelo vão entre elas.

  Cada metade é um painel verde de viewport inteira, recortado, contendo uma
  cópia da palavra. Juntas elas ladrilham a tela e escondem a Hero por completo;
  afastando-se, o vão entre elas é a revelação. A Hero não aparece por fade —
  ela sempre esteve lá, atrás.
*/

/** Distância de scroll da abertura, em px, por breakpoint. */
export const OPENING_DISTANCE = {
  desktop: 1100,
  tablet: 850,
  mobile: 650,
} as const;

/**
 * Onde cortar a palavra, em px a partir do topo da viewport.
 *
 * O corte precisa cair no meio da ALTURA DAS LETRAS, e não no meio da caixa de
 * texto. Com Anton em caixa alta e line-height 0.82, as duas coisas não
 * coincidem: a caixa reserva espaço para descendentes que BRASIL não tem, então
 * seu centro fica abaixo do centro visual dos glifos.
 *
 * TextMetrics dá as extremidades reais da tinta, e daí sai o centro exato. Sem
 * isso a metade de cima levaria mais letra que a de baixo — um corte deslocado.
 */
export function measureCutLine(word: HTMLElement): number {
  const rect = word.getBoundingClientRect();
  const fallback = rect.top + rect.height / 2;

  const context = document.createElement("canvas").getContext("2d");
  if (!context) return fallback;

  const styles = window.getComputedStyle(word);
  context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

  const metrics = context.measureText(word.textContent ?? "BRASIL");
  const {
    actualBoundingBoxAscent: inkAscent,
    actualBoundingBoxDescent: inkDescent,
    fontBoundingBoxAscent: fontAscent,
    fontBoundingBoxDescent: fontDescent,
  } = metrics;

  // Navegadores antigos não expõem estas métricas.
  if ([inkAscent, inkDescent, fontAscent, fontDescent].some((v) => typeof v !== "number")) {
    return fallback;
  }

  // A caixa de linha centraliza a caixa da fonte; daí sai a posição da baseline.
  const halfLeading = (rect.height - (fontAscent + fontDescent)) / 2;
  const baselineY = rect.top + halfLeading + fontAscent;

  // A tinta vai de (baseline - ascent) a (baseline + descent).
  return baselineY + (inkDescent - inkAscent) / 2;
}

export interface WordRevealRefs {
  stage: HTMLElement;
  topHalf: HTMLElement;
  bottomHalf: HTMLElement;
}

/**
 * Timeline normalizada da abertura: 1 unidade de duração, que o ScrollTrigger
 * mapeia na distância de scroll. Nenhum valor de tempo aqui é em segundos.
 *
 * `cutLine` é relativo ao topo do palco.
 */
export function createWordScrollReveal(
  refs: WordRevealRefs,
  cutLine: number,
): gsap.core.Timeline {
  const { stage, topHalf, bottomHalf } = refs;

  const stageHeight = stage.getBoundingClientRect().height;

  /*
    Cada metade percorre exatamente a sua própria extensão visível, e não uma
    viewport inteira.

    O exemplo da spec usa yPercent ±100, mas as metades têm altura de viewport
    cheia e ocupam apenas metade dela: a de cima já saiu da tela depois de
    percorrer `cutLine` px. Com ±100 a revelação terminaria em ~50% do scroll e
    o resto da rolagem não mudaria nada na tela.

    Os 2px de folga evitam uma fresta por arredondamento.
  */
  const topTravel = cutLine + 2;
  const bottomTravel = stageHeight - cutLine + 2;

  /*
    ease "none" em tudo: quem dita o ritmo é o scroll. Qualquer curva aqui faria
    as metades continuarem se movendo depois que o usuário parasse de rolar.
  */
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  timeline.to(topHalf, { y: -topTravel, duration: 1 }, 0);
  timeline.to(bottomHalf, { y: bottomTravel, duration: 1 }, 0);

  /*
    A Hero fica PARADA durante a abertura. Quem a revela é o vão entre as
    metades, e nada mais.

    Havia aqui uma escala de 1.06 para 1 no wrapper da Hero. A escala acontece
    em torno do centro, então elementos centrais quase não se moviam mas os
    encostados nas bordas percorriam vários pixels — a imagem principal, na
    borda direita, encolhia e deslizava enquanto tudo ao redor parecia fixo.
    Lia-se como um elemento solto, não como profundidade.
  */

  return timeline;
}
