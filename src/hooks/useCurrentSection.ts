import { useEffect, useState } from "react";

/*
  Qual seção está sendo lida agora.

  A navegação anunciava "01 — Hero" fixo desde a primeira seção construída. Com
  nove seções na página, um rótulo imóvel deixa de ser simplificação e passa a
  ser informação errada.

  IntersectionObserver com uma FAIXA FINA no meio da viewport, e não
  ScrollTrigger: não há scrub nenhum aqui, só a pergunta "quem está no meio da
  tela". O observer também não guarda posições calculadas — e a altura do
  documento muda depois da montagem, porque o pin da abertura insere um
  espaçador de mais de mil pixels.
*/

/**
 * Recorte do root até uma faixa central de 10% da altura da tela.
 * A seção que cruza essa faixa é a que a pessoa está lendo.
 */
const CENTER_BAND = "-45% 0px -45% 0px";

/** Atributo que uma seção usa para se declarar. */
const ATTRIBUTE = "data-section-label";

/**
 * Devolve o rótulo da seção no centro da viewport.
 *
 * As seções se declaram com `data-section-label`; o hook não conhece nenhuma
 * delas por nome. Acrescentar a décima seção não exige tocar aqui.
 */
export function useCurrentSection(fallback: string): string {
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(`[${ATTRIBUTE}]`));
    if (sections.length === 0) return;

    /*
      Duas seções podem tocar a faixa no mesmo instante, na transição entre elas.
      O conjunto guarda todas as que estão lá dentro e a escolha é sempre a
      primeira na ordem do documento — sem isso, o rótulo piscaria entre as duas
      conforme a ordem em que os callbacks chegassem.
    */
    const visible = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visible.add(target);
          } else {
            visible.delete(target);
          }
        });

        const current = sections.find((section) => visible.has(section));
        if (current?.dataset.sectionLabel) {
          setLabel(current.dataset.sectionLabel);
        }
      },
      { rootMargin: CENTER_BAND, threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return label;
}
