import { useRef, useState } from "react";
import gsap from "gsap";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { PixelReveal } from "@/components/PixelReveal/PixelReveal";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { regions } from "./regions";
import "./Territories.css";

/** Todas as imagens, para o componente pré-carregar e a troca ser instantânea. */
const REGION_IMAGES = regions.map((region) => region.image);

/* Fora do componente: um literal no JSX seria recriado a cada hover. */
const TITLE_LINES = ["Um país.", "Muitos mundos."];

/**
 * 04 — TERRITÓRIOS. "UM PAÍS. MUITOS MUNDOS."
 *
 * Lista editorial das cinco regiões. Apontar o conjunto recua todas as linhas;
 * apontar uma linha rola o texto para cima e traz no lugar uma cópia idêntica
 * na cor de destaque, enquanto a imagem daquela região se monta aos pedaços num
 * painel ao lado.
 *
 * Não é um mapa: o briefing proíbe o mapa escolar. O que diferencia as regiões
 * é a tipografia e a imagem, não o contorno geográfico.
 */
export function Territories() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  /* Entra pela direita — o sentido oposto ao do Manifesto, logo acima. */
  useSectionReveal(sectionRef, "right");

  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();
  /* Sem ponteiro não há hover: a lista funciona como texto puro. */
  const interactive = !isTouch && !reducedMotion;

  /*
    As duas cópias de cada rótulo são renderizadas no JSX, e não injetadas por
    JavaScript: o React continua dono da árvore. Clonar nós por fora dele
    deixaria elementos que nenhuma renderização subsequente conhece.
  */
  const rollIn = (row: HTMLElement) => {
    if (!interactive) return;
    gsap.to(row.querySelectorAll("p:nth-child(1)"), { top: "-100%", duration: 0.3 });
    gsap.to(row.querySelectorAll("p:nth-child(2)"), { top: "0%", duration: 0.3 });
  };

  const rollOut = (row: HTMLElement) => {
    if (!interactive) return;
    gsap.to(row.querySelectorAll("p:nth-child(1)"), { top: "0%", duration: 0.3 });
    gsap.to(row.querySelectorAll("p:nth-child(2)"), { top: "100%", duration: 0.3 });
  };

  return (
    <section ref={sectionRef} className="territories" aria-labelledby="territories-title">
      <p className="territories__index label">04 — Territórios</p>

      <SectionTitle id="territories-title" lines={TITLE_LINES} accentIndex={1} />

      <div className="territories__stage">
        {/* Sair da lista inteira apaga a imagem. */}
        <div
          className="territories__list"
          onMouseLeave={() => setActiveImage(null)}
        >
          {regions.map((region) => (
            <div
              key={region.name}
              className="territories__row"
              onMouseEnter={(event) => {
                rollIn(event.currentTarget);
                if (interactive) setActiveImage(region.image);
              }}
              onMouseLeave={(event) => rollOut(event.currentTarget)}
            >
              <div className="territories__info">
                <p>{region.info}</p>
                <p aria-hidden="true">{region.info}</p>
              </div>

              <div className="territories__name display">
                <p>{region.name}</p>
                <p aria-hidden="true">{region.name}</p>
              </div>

              <div className="territories__tag">
                <p>{region.tag}</p>
                <p aria-hidden="true">{region.tag}</p>
              </div>
            </div>
          ))}
        </div>

        {/*
          Painel da imagem. Fica sobre a lista, à direita: a região aponta para
          o próprio retrato sem que o nome saia do eixo de leitura.
        */}
        <div className="territories__reveal">
          <PixelReveal src={activeImage} sources={REGION_IMAGES} />
        </div>
      </div>
    </section>
  );
}
