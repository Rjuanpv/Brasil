import { useEffect } from "react";
import { createMouseParallax } from "@/animations/mouseParallax";
import type { ParallaxTarget } from "@/animations/mouseParallax";
import { useMousePosition } from "./useMousePosition";
import { useReducedMotion } from "./useReducedMotion";
import { useIsTouch } from "./useIsTouch";

/**
 * Liga camadas ao parallax global de mouse.
 *
 * `collect` roda depois da montagem, então pode ler refs com segurança. Camadas
 * ainda não montadas devem ser omitidas — a função é reexecutada quando `enabled`
 * ou o ambiente mudam.
 */
export function useParallax(collect: () => ParallaxTarget[], enabled = true) {
  const { subscribe, read } = useMousePosition();
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    if (!enabled || reducedMotion || isTouch) return;

    const targets = collect().filter((target) => target.element);
    if (targets.length === 0) return;

    // A posição atual do ponteiro entra como estado inicial, para o parallax
    // começar já correto em vez de deslizar até lá.
    const parallax = createMouseParallax(targets, read());
    const unsubscribe = subscribe(parallax.apply);

    return () => {
      unsubscribe();
      parallax.kill();
    };
    // `collect` é intencionalmente omitido: a Hero a redefine a cada render e
    // incluí-la recriaria o parallax em todo ciclo, matando os tweens em curso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reducedMotion, isTouch, subscribe, read]);
}
