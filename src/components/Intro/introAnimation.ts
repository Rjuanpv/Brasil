import gsap from "gsap";
import {
  ENTRANCE_TIMING,
  REDUCED_ENTRANCE_TIMING,
  addLettersEntrance,
} from "@/animations/lettersEntrance";
import { createWordScrollReveal } from "@/animations/wordScrollReveal";
import { addHeroEntrance } from "@/animations/heroEntrance";

/*
  As duas fases da abertura são construídas separadamente, e não ao mesmo tempo.

  A FASE 2 depende de um documento rolável para medir o pin e a distância, e de
  a palavra já estar na tela para gravar os valores iniciais corretos dos seus
  tweens. Nada disso é verdade enquanto a FASE 1 roda com o scroll travado —
  por isso ela só pode ser criada depois que a palavra se forma.
*/

/** Pausa com a palavra formada, antes de liberar o scroll. */
const RECOGNITION_PAUSE = 0.55;
const REDUCED_RECOGNITION_PAUSE = 0.3;

export interface IntroRefs {
  stage: HTMLElement;
  topHalf: HTMLElement;
  bottomHalf: HTMLElement;
  /** Seis letras da cópia de cima, na ordem B R A S I L. */
  topLetters: HTMLElement[];
  /** Seis letras da cópia de baixo, nas mesmas posições. */
  bottomLetters: HTMLElement[];
}

/**
 * FASE 1 — as letras sobem de trás dos seus recortes e formam BRASIL.
 * Roda sozinha assim que a fonte carrega.
 */
export function createEntranceTimeline(
  refs: IntroRefs,
  reduced: boolean,
  onFormed: () => void,
): gsap.core.Timeline {
  const { topLetters, bottomLetters } = refs;

  const pairs = topLetters.map((top, index) => [top, bottomLetters[index]]);

  const entrance = gsap.timeline({ onComplete: onFormed });

  const formedAt = addLettersEntrance(
    entrance,
    pairs,
    reduced ? REDUCED_ENTRANCE_TIMING : ENTRANCE_TIMING,
  );

  /*
    A palavra permanece inteira e parada. A pausa existe para o usuário
    reconhecer a palavra antes de qualquer outra coisa acontecer.

    Ela é reservada por um espaço vazio na timeline, e não por um elemento que
    esteja animando. Antes quem a ocupava era o convite "role para abrir"; sem
    ele, a timeline terminaria no instante em que a última letra chega, o
    `onComplete` liberaria o scroll na mesma hora e a palavra formada nunca
    chegaria a ficar parada na tela. O silêncio aqui é conteúdo.
  */
  const pause = reduced ? REDUCED_RECOGNITION_PAUSE : RECOGNITION_PAUSE;

  entrance.to({}, { duration: pause }, formedAt);

  return entrance;
}

/**
 * FASE 2 — a palavra se parte ao meio e revela a Hero, que entra junto.
 *
 * Pausada: quem a move é o ScrollTrigger. Só pode ser criada com o scroll já
 * destravado e a palavra já visível.
 *
 * A entrada da Hero é acrescentada aqui, e não numa timeline própria: as duas
 * coisas são o mesmo gesto e precisam do mesmo relógio. Em timelines separadas,
 * cada uma com seu gatilho, o vão e a composição fatalmente sairiam de sincronia
 * a cada refresh de medida.
 *
 * Nada aqui sabe o que a Hero tem dentro. A busca é por `data-enter-from`, que
 * as camadas declaram — a abertura é dona do scroll, não do conteúdo.
 */
export function createOpeningTimeline(
  refs: IntroRefs,
  cutLine: number,
  reduced: boolean,
): gsap.core.Timeline {
  const timeline = createWordScrollReveal(refs, cutLine);

  addHeroEntrance(timeline, refs.stage, reduced);

  return timeline;
}
