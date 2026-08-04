import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { duration, easing } from "@/lib/motion";
import { manifestoFacts } from "./manifestoFacts";
import "./Manifesto.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * 03 — MANIFESTO. "O BRASIL NÃO PARA."
 *
 * Apresenta a ideia central. Depois da faixa amarela dos estados, a seção corta
 * para preto: é o contraste mais duro da página até aqui, e serve para separar
 * a afirmação de escala da argumentação.
 */
export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  /* O conteúdo entra pela esquerda conforme a página desce. */
  useSectionReveal(sectionRef, "left");

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".manifesto__fact");
      if (cards.length === 0) return;

      /*
        Sob redução de movimento os números aparecem no valor final, sem
        contagem nem deslocamento. O conteúdo é o mesmo; só o percurso sai.
      */
      if (reducedMotion) {
        cards.forEach((card) => {
          const output = card.querySelector<HTMLElement>(".manifesto__value");
          const index = Number(card.dataset.index);
          const fact = manifestoFacts[index];
          if (output && fact) {
            output.textContent = format(fact.value, fact);
          }
        });
        return;
      }

      cards.forEach((card, index) => {
        const fact = manifestoFacts[index];
        const output = card.querySelector<HTMLElement>(".manifesto__value");
        if (!fact || !output) return;

        const counter = { value: 0 };

        gsap
          .timeline({
            scrollTrigger: { trigger: card, start: "top 85%", once: true },
          })
          .fromTo(
            card,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: duration.slow, ease: easing.entrance },
          )
          .to(
            counter,
            {
              value: fact.value,
              duration: duration.cinematic,
              ease: easing.dramatic,
              // A contagem é o movimento: o número CRESCE até o valor, em vez de
              // aparecer pronto. É o que faz "não para" ser mostrado, não dito.
              onUpdate: () => {
                output.textContent = format(counter.value, fact);
              },
            },
            0.1,
          );
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    // `id` é o destino do botão EXPLORE da Hero — não remover sem atualizar lá.
    <section
      ref={sectionRef}
      id="manifesto"
      className="manifesto"
      aria-labelledby="manifesto-title"
    >
      <p className="manifesto__index label">03 — Manifesto</p>

      <SectionTitle id="manifesto-title" lines={["O Brasil", "não para."]} accentIndex={1} />

      <p className="manifesto__lead">
        Enquanto você lê esta frase, o país inteiro está em movimento. Gente que atravessa
        fronteiras internas, ritmos que nascem numa esquina e chegam ao mundo, florestas que
        respiram, cidades que não dormem.
      </p>

      {/*
        `data-self-reveal` mantém este bloco fora da entrada da seção: cada
        número tem o próprio ScrollTrigger com a contagem, e animá-lo dentro de
        um contêiner ainda invisível esconderia justamente esse movimento.
      */}
      <dl className="manifesto__facts" data-self-reveal>
        {manifestoFacts.map((fact, index) => (
          <div key={fact.label} className="manifesto__fact" data-index={index}>
            <dt className="manifesto__value display">
              {/* Valor inicial vazio: o texto é escrito pela contagem. */}
              {fact.prefix ?? ""}0{fact.suffix ?? ""}
            </dt>
            <dd className="manifesto__label label">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Formata um valor intermediário da contagem com as casas e afixos do dado. */
function format(value: number, fact: (typeof manifestoFacts)[number]): string {
  const number = value.toFixed(fact.decimals ?? 0).replace(".", ",");
  return `${fact.prefix ?? ""}${number}${fact.suffix ?? ""}`;
}
