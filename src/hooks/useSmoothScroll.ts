import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

/**
 * Trava e destrava o scroll.
 *
 * A trava usa `overflow: hidden` no body somada a `lenis.stop()`. Enquanto ela
 * está ativa o documento NÃO é rolável, então nenhum ScrollTrigger pode ser
 * criado nesse intervalo: ele nasceria medindo uma página de altura zero.
 * Quem depende de scroll deve se construir depois de destravar.
 *
 * A chamada é síncrona: ao voltar, o atributo já saiu do body e a próxima
 * medição de layout enxerga a página rolável.
 */
export function setScrollLocked(locked: boolean) {
  document.body.dataset.locked = String(locked);

  if (locked) {
    lenisInstance?.stop();
  } else {
    lenisInstance?.start();
  }
}

/** Rola até um elemento respeitando o scroll suave ativo. */
export function scrollTo(target: string | HTMLElement, offset = 0) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset, duration: 1.4 });
    return;
  }

  const element = typeof target === "string" ? document.querySelector(target) : target;
  element?.scrollIntoView({ behavior: "auto", block: "start" });
}

/**
 * Lenis dirigindo o scroll, com o ScrollTrigger lendo a mesma fonte de verdade.
 * Sem essa integração o ScrollTrigger calcula posições sobre o scroll nativo e as
 * animações ficam fora de sincronia com o que está na tela.
 */
export function useSmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Com redução de movimento o scroll interpolado é justamente o que incomoda.
    if (reducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // O toque mantém o scroll nativo: interpolá-lo quebra a sensação no celular.
      syncTouch: false,
    });

    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Um único relógio para Lenis e GSAP; sem isso o GSAP compensa quedas de frame
    // e os dois passam a divergir.
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reducedMotion]);
}
