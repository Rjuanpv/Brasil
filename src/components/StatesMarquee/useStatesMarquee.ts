import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/*
  Movimento contínuo da faixa de estados.

  O laço é feito com dois grupos idênticos: a trilha desliza exatamente a
  largura de um grupo e reinicia. No instante do reinício, o segundo grupo está
  precisamente onde o primeiro estava, então não há salto nem costura visível.

  Animar até uma posição arbitrária e voltar ao início produziria um pulo; é o
  deslocamento ser igual à largura do grupo que torna o retorno invisível.
*/

/** Velocidade em pixels por segundo. Lenta o bastante para ler os nomes. */
const PIXELS_PER_SECOND = 65;

/** Fator de velocidade enquanto o ponteiro está sobre a faixa. */
const HOVER_TIME_SCALE = 0.25;

export interface StatesMarqueeRefs {
  container: RefObject<HTMLElement>;
  track: RefObject<HTMLDivElement>;
  /** Primeiro grupo — é dele que sai a largura do ciclo. */
  group: RefObject<HTMLDivElement>;
}

export function useStatesMarquee({ container, track, group }: StatesMarqueeRefs) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const containerElement = container.current;
    const trackElement = track.current;
    const groupElement = group.current;
    if (!containerElement || !trackElement || !groupElement) return;

    /*
      O estado parado é anunciado no DOM, e não deduzido por media query no CSS.

      A regra `@media (prefers-reduced-motion: reduce)` não enxerga o override
      de `?motion=full`: o JavaScript animava a faixa enquanto o CSS a tratava
      como estática e liberava a barra de rolagem manual. Com o atributo, os
      dois lados leem a mesma decisão.
    */
    containerElement.dataset.static = String(reducedMotion);

    // Parada e legível; o CSS libera a rolagem horizontal manual para quem
    // quiser percorrer os nomes.
    if (reducedMotion) {
      gsap.set(trackElement, { x: 0 });
      return;
    }

    let animation: gsap.core.Tween | null = null;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;

      const groupWidth = groupElement.getBoundingClientRect().width;
      if (groupWidth <= 0) return;

      /*
        A duração sai da largura real, e não de um número fixo: com duração
        constante, uma tela larga faria a faixa correr muito mais rápido que
        uma estreita, porque o mesmo tempo cobriria mais pixels.
      */
      const duration = groupWidth / PIXELS_PER_SECOND;

      // Preserva o ponto do ciclo ao reconstruir, para que um resize não
      // teletransporte a faixa de volta ao começo.
      const progress = animation?.progress() ?? 0;
      const timeScale = animation?.timeScale() ?? 1;
      animation?.kill();

      animation = gsap.fromTo(
        trackElement,
        { x: 0 },
        { x: -groupWidth, duration, ease: "none", repeat: -1 },
      );

      animation.progress(progress);
      animation.timeScale(timeScale);
    };

    /*
      A largura depende da métrica do Anton. Medir antes de a fonte carregar
      daria a largura da fonte de fallback, e a faixa correria na velocidade
      errada — além de deixar uma fresta no ponto de emenda.
    */
    if (document.fonts?.status === "loaded") {
      build();
    } else {
      document.fonts.ready.then(build);
    }

    const observer = new ResizeObserver(build);
    observer.observe(groupElement);

    /*
      Desacelera em vez de parar: uma pausa instantânea quebra a leitura de
      fluxo contínuo. A interpolação do timeScale mantém a sensação de inércia.
    */
    const onEnter = () => {
      if (!animation) return;
      gsap.to(animation, { timeScale: HOVER_TIME_SCALE, duration: 0.5, ease: "power2.out" });
    };

    const onLeave = () => {
      if (!animation) return;
      gsap.to(animation, { timeScale: 1, duration: 0.7, ease: "power2.out" });
    };

    containerElement.addEventListener("pointerenter", onEnter);
    containerElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      observer.disconnect();
      containerElement.removeEventListener("pointerenter", onEnter);
      containerElement.removeEventListener("pointerleave", onLeave);
      if (animation) gsap.killTweensOf(animation);
      animation?.kill();
    };
  }, [container, track, group, reducedMotion]);
}
