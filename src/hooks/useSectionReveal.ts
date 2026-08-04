import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { duration, easing } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

/*
  Entrada de seção conforme a página desce.

  Duas decisões estruturais:

  1. IntersectionObserver, e não ScrollTrigger. ScrollTrigger é a ferramenta
     para scrub — ele guarda posições calculadas contra a altura do documento, e
     essa altura muda depois da montagem porque o pin da abertura insere um
     espaçador de mais de mil pixels. O observer não guarda posição nenhuma: ele
     apenas vê o elemento entrar na viewport.

  2. Os FILHOS DIRETOS são animados, nunca a caixa da seção. Deslocar a seção
     inteira revelaria uma faixa do fundo da página na borda oposta — verde
     aparecendo ao lado do preto do Manifesto durante todo o movimento.

  Só transform e opacity: compostas na GPU, nenhuma causa reflow.
*/

export type RevealDirection = "left" | "right" | "up";

/** Deslocamento inicial, em px. */
const OFFSET = 72;

/** Quanto da seção precisa aparecer para a revelação começar. */
const THRESHOLD = 0.12;

/**
 * Revela o conteúdo de uma seção quando ela entra na viewport.
 *
 * Filhos marcados com `data-self-reveal` são ignorados: serve para blocos que
 * já têm animação própria — os números do Manifesto, por exemplo. Sem isso eles
 * animariam dentro de um contêiner ainda invisível, e o usuário perderia
 * justamente o movimento que importa.
 */
export function useSectionReveal(
  ref: RefObject<HTMLElement>,
  direction: RevealDirection = "up",
) {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const targets = Array.from(section.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.dataset.selfReveal === undefined,
    );

    if (targets.length === 0) return;

    /*
      Sob movimento reduzido a entrada é REDUZIDA, não cancelada: um fade curto,
      sem deslocamento. Suprimi-la por completo transformava a preferência do
      sistema num interruptor que apagava a seção inteira do roteiro — e opacidade
      não é o que causa desconforto vestibular; deslocamento é.
    */
    const from = reducedMotion
      ? { x: 0, y: 0 }
      : direction === "left"
        ? { x: -OFFSET, y: 0 }
        : direction === "right"
          ? { x: OFFSET, y: 0 }
          : { x: 0, y: OFFSET };

    const ctx = gsap.context(() => {
      // Estado inicial imediato: o conteúdo não pode piscar visível antes de
      // o observer disparar.
      gsap.set(targets, { ...from, autoAlpha: 0 });

      const animation = gsap.to(targets, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: reducedMotion ? duration.fast : duration.slow,
        ease: easing.entrance,
        stagger: reducedMotion ? 0.02 : 0.09,
        paused: true,
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          // Uma vez só: reanimar a cada passagem viraria ruído para quem rola
          // de volta.
          observer.disconnect();
          animation.play();
        },
        { threshold: THRESHOLD },
      );

      observer.observe(section);

      return () => observer.disconnect();
    }, section);

    return () => ctx.revert();
  }, [ref, direction, reducedMotion]);
}
