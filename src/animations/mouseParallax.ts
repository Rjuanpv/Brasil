import gsap from "gsap";
import { PARALLAX_SMOOTHING, parallaxDepth } from "@/lib/motion";
import type { NormalizedPointer, ParallaxDepth } from "@/lib/motion";

export interface ParallaxTarget {
  element: HTMLElement;
  /** Profundidade nomeada do motion system, ou um valor em px. */
  depth: ParallaxDepth | number;
  /** Inverte o sentido — camadas contrárias reforçam a sensação de volume. */
  invert?: boolean;
}

function resolveDepth(depth: ParallaxDepth | number): number {
  return typeof depth === "number" ? depth : parallaxDepth[depth];
}

/**
 * Liga um conjunto de camadas ao ponteiro, cada uma com sua intensidade.
 *
 * A inércia, o atraso e o retorno suave que o doc pede vêm do próprio `quickTo`:
 * ele mantém um tween vivo por propriedade e apenas redireciona o alvo, em vez de
 * recalcular posição a cada evento.
 *
 * Devolve a função que aplica uma posição de ponteiro, e um `kill` para o cleanup.
 */
export function createMouseParallax(targets: ParallaxTarget[], initial?: NormalizedPointer) {
  const setters = targets.map(({ element, depth, invert }) => {
    const distance = resolveDepth(depth) * (invert ? -1 : 1);

    /*
      Assume a posição correspondente ao ponteiro ANTES de criar o quickTo.

      Sem isto, o tween nasce em zero e viaja até o deslocamento do mouse ao
      longo de 0,8s. Como o parallax só é ligado quando a abertura termina, o
      usuário via as camadas deslizarem sozinhas no meio do scroll — e a imagem
      principal, que tem a maior profundidade, era a que mais saltava.
    */
    if (initial) {
      gsap.set(element, { x: initial.x * distance, y: initial.y * distance });
    }

    return {
      distance,
      x: gsap.quickTo(element, "x", PARALLAX_SMOOTHING),
      y: gsap.quickTo(element, "y", PARALLAX_SMOOTHING),
    };
  });

  const apply = (pointer: NormalizedPointer) => {
    for (const setter of setters) {
      setter.x(pointer.x * setter.distance);
      setter.y(pointer.y * setter.distance);
    }
  };

  const kill = () => {
    for (const { element } of targets) {
      gsap.killTweensOf(element);
      gsap.set(element, { x: 0, y: 0 });
    }
  };

  return { apply, kill };
}
