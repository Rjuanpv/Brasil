// `gsap` é um namespace global declarado pelos tipos da lib — gsap.core.Timeline
// não precisa de import de valor.
import "gsap";

/*
  FASE 1 — formação da palavra, por revelação em máscara.

  Cada letra sobe de trás do seu próprio recorte até a posição final, escalonada
  da esquerda para a direita. A palavra se constrói letra a letra, sem que
  nenhuma se desloque no espaço da página.

  Isto reproduz o mecanismo do vídeo de referência. Medindo os pixels do título
  quadro a quadro na referência, a borda esquerda e a linha de base ficam
  cravadas enquanto largura e altura crescem — ou seja, as letras não viajam:
  elas emergem no lugar, em sequência. Na medição dá para ver a base do "O"
  aparecendo como uma cúpula antes do resto do glifo.

  O recorte é feito por um wrapper com overflow hidden por letra, e o movimento é
  translateY dentro dele. Nada de escala: escalar deformaria os glifos, e a
  referência mantém a forma da letra intacta enquanto ela sobe.
*/

export interface EntranceTiming {
  /** Espera antes de a primeira letra começar a subir. */
  hold: number;
  /** Duração da subida de cada letra. */
  reveal: number;
  /** Diferença de início entre letras consecutivas. */
  stagger: number;
  /** Curva da subida. */
  ease: string;
}

/*
  O ritmo da entrada se ajusta aqui — é o único lugar.

  Os valores saem do vídeo de referência: lá as doze letras do título resolvem em
  ~0,75s, com as letras se sobrepondo fortemente no tempo. Para as seis de
  BRASIL, manter o mesmo stagger preserva a cadência da referência.
*/
export const ENTRANCE_TIMING: EntranceTiming = {
  hold: 0.25,
  reveal: 0.6,
  stagger: 0.05,
  ease: "power4.out",
};

/**
 * Versão para prefers-reduced-motion.
 *
 * A revelação em máscara já é um movimento curto e contido — o deslocamento não
 * passa da altura de uma letra —, então aqui basta encurtar os tempos. Não há
 * motivo para trocar o mecanismo: quem tem a preferência ligada vê a mesma
 * animação, mais rápida.
 */
export const REDUCED_ENTRANCE_TIMING: EntranceTiming = {
  hold: 0.1,
  reveal: 0.35,
  stagger: 0.03,
  ease: "power3.out",
};

/**
 * Adiciona a revelação das letras a uma timeline.
 *
 * `pairs` são as duas cópias de cada letra (metade de cima e de baixo). Ambas
 * recebem o mesmo tween: enquanto isso valer, o usuário vê uma letra sólida e o
 * corte da fase 2 é invisível.
 *
 * Devolve o instante em que a última letra termina de subir.
 */
export function addLettersEntrance(
  timeline: gsap.core.Timeline,
  pairs: HTMLElement[][],
  timing: EntranceTiming,
): number {
  /*
    O stagger é aplicado POR PAR, e não por elemento.

    Escalonar os 12 elementos daria tempos diferentes para a metade de cima e a
    de baixo da mesma letra — as duas cópias sairiam de sincronia e o corte
    apareceria como um degrau no meio da letra.
  */
  /*
    `y: 0` explícito pelo mesmo motivo de animations/textReveal.ts: a letra nasce
    com `transform: translateY(100%)` no CSS, e o GSAP lê isso da matriz
    computada como pixels — `yPercent` viraria uma segunda translação somada à
    primeira, e a letra terminaria uma linha inteira abaixo da máscara.
  */
  pairs.forEach((pair, index) => {
    timeline.fromTo(
      pair,
      { yPercent: 100, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: timing.reveal,
        ease: timing.ease,
      },
      timing.hold + index * timing.stagger,
    );
  });

  return timing.hold + (pairs.length - 1) * timing.stagger + timing.reveal;
}
