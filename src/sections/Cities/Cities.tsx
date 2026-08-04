import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSectionReveal } from "@/hooks/useSectionReveal";
/* O arquivo de dados não se chama `cities.ts` de propósito: no Windows e no
   macOS ele colidiria com `Cities.tsx`, que difere apenas na caixa. */
import { cities } from "./cityProfiles";
import "./Cities.css";

gsap.registerPlugin(ScrollTrigger);

/* Fora do componente: um literal no JSX seria recriado a cada render. */
const TITLE_LINES = ["Cidades", "em movimento."];

/**
 * 07 — CIDADES. "CIDADES EM MOVIMENTO."
 *
 * Cinco nomes em escala extrema, cada um ocupando a linha de um jeito. O scroll
 * desloca cada nome horizontalmente na sua própria intensidade e sentido: as
 * cidades não passam juntas pela tela, e é isso que faz a seção parecer
 * trânsito e não lista.
 *
 * Como a Natureza, esta seção é transparente — ela acontece sobre o azul que a
 * maré deixou. Azul + creme, conforme a direção de arte.
 */
export function Cities() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  /* Entra pela direita — o sentido oposto ao da Natureza, logo acima. */
  useSectionReveal(sectionRef, "right");

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* O deslocamento horizontal é movimento contínuo puro: sai por inteiro. */
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".cities__city").forEach((city) => {
        const name = city.querySelector<HTMLElement>(".cities__name");
        const offset = Number(city.dataset.offset) || 0;
        if (!name) return;

        /*
          xPercent, e não x: o deslocamento é proporcional à largura do nome, e
          "SÃO PAULO" mede quase o dobro de "CURITIBA". Em pixels fixos os nomes
          curtos andariam proporcionalmente muito mais que os longos.

          `ease: "none"` porque quem dita o ritmo é o scroll — qualquer curva
          faria o nome continuar andando depois que a página parasse.
        */
        gsap.fromTo(
          name,
          { xPercent: offset },
          {
            xPercent: -offset,
            ease: "none",
            scrollTrigger: {
              trigger: city,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="cities"
      data-section-label="07 — Cidades"
      aria-labelledby="cities-title"
    >
      <p className="cities__index label">07 — Cidades</p>

      <SectionTitle id="cities-title" lines={TITLE_LINES} accentIndex={1} />

      <p className="cities__lead">
        Quatro séculos separam a primeira capital da última. Uma nasceu de um porto,
        outra de um risco no cerrado — e as duas amanhecem à mesma hora, cheias de gente
        indo para algum lugar.
      </p>

      {/*
        `data-self-reveal`: cada cidade tem o próprio deslocamento ligado ao
        scroll, e a entrada da seção brigaria com ele pela mesma propriedade.
      */}
      <ol className="cities__list" data-self-reveal>
        {cities.map((city) => (
          <li
            key={city.name}
            className="cities__city"
            data-offset={city.offset}
            style={{ "--city-align": city.align } as CSSProperties}
          >
            <span className="cities__name display">{city.name}</span>

            <span className="cities__meta">
              <span className="cities__trait">{city.trait}</span>
              <span className="cities__data label">
                <span>Desde {city.founded}</span>
                <span aria-hidden="true">·</span>
                <span>{city.people.toFixed(1).replace(".", ",")} mi de pessoas</span>
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="cities__source label">População — Censo 2022, IBGE</p>
    </section>
  );
}
