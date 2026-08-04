import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { playOnEnter } from "@/animations/playOnEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { duration, easing } from "@/lib/motion";
import { futureFronts } from "./futureFronts";
import "./Future.css";

gsap.registerPlugin(ScrollTrigger);

/* Fora do componente: um literal no JSX seria recriado a cada render. */
const TITLE_LINES = ["O futuro", "também", "é Brasil."];

/**
 * 08 — FUTURO. "O FUTURO TAMBÉM É BRASIL."
 *
 * O corte mais escuro da página. Preto com uma malha verde vibrante ao fundo,
 * conforme a direção de arte — e é ele que encerra o azul: a seção tem fundo
 * opaco, então a maré desaparece atrás dela sem precisar baixar.
 *
 * A malha se desloca devagar com o scroll. É o único movimento contínuo aqui:
 * depois do barulho de Ritmos e do trânsito de Cidades, esta seção tinha que
 * ser a mais quieta das nove.
 */
export function Future() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  /* Sobe: depois do ziguezague de Cidades, a chegada é frontal. */
  useSectionReveal(sectionRef, "up");

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      /*
        A malha desce mais devagar que a página — parallax de fundo puro. O
        deslocamento é de uma célula inteira, para que a repetição do gradiente
        feche sem costura visível no fim do percurso.
      */
      gsap.fromTo(
        grid,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      const list = section.querySelector<HTMLElement>(".future__fronts");
      const fronts = gsap.utils.toArray<HTMLElement>(".future__front");
      if (!list) return;

      /*
        As frentes entram uma a uma, em cascata. Um `stagger` num tween só, e
        não um gatilho por item: elas dividem a mesma linha de chegada, e seis
        gatilhos independentes fariam a cascata depender de onde o scroll parou.

        As frentes nascem invisíveis, então o gatilho não pode falhar em
        silêncio — ver animations/playOnEnter.ts.
      */
      gsap.set(fronts, { autoAlpha: 0, y: 24 });

      const stop = playOnEnter([list], () => {
        gsap.to(fronts, {
          autoAlpha: 1,
          y: 0,
          duration: duration.slow,
          ease: easing.entrance,
          stagger: 0.08,
        });
      });

      return stop;
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="future"
      data-section-label="08 — Futuro"
      aria-labelledby="future-title"
    >
      {/* `data-self-reveal`: a malha é fundo, não conteúdo — a entrada da seção
          não pode deslocá-la nem escondê-la. */}
      <div ref={gridRef} className="future__grid" data-self-reveal aria-hidden="true" />

      <p className="future__index label">08 — Futuro</p>

      <SectionTitle id="future-title" lines={TITLE_LINES} accentIndex={2} />

      <p className="future__lead">
        O futuro costuma ser contado como algo que chega de fora. Mas as coisas abaixo já
        estão aqui — foram pensadas, testadas e postas de pé dentro do país.
      </p>

      {/*
        `data-self-reveal`: a cascata das frentes tem gatilho próprio, e animá-la
        dentro de um contêiner ainda invisível esconderia o movimento inteiro.
      */}
      <ol className="future__fronts" data-self-reveal>
        {futureFronts.map((front, index) => (
          <li key={front.field} className="future__front">
            <span className="future__number label" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="future__field display">{front.field}</h3>

            <p className="future__fact">{front.fact}</p>

            {front.mark && <span className="future__mark label">{front.mark}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
