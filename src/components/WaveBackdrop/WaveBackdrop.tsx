import type { CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./WaveBackdrop.css";

/*
  Respingos do tombo. Ficam fora do componente porque são constantes: um literal
  no JSX seria um array novo a cada render.

  Os valores são irregulares de propósito — gotas em progressão aritmética leem
  como uma régua, não como água.
*/
const SPRAY = [
  { x: "8%", size: 10, delay: 0.1, rise: 150 },
  { x: "17%", size: 6, delay: 0.26, rise: 110 },
  { x: "26%", size: 14, delay: 0.04, rise: 200 },
  { x: "35%", size: 8, delay: 0.34, rise: 130 },
  { x: "44%", size: 5, delay: 0.18, rise: 170 },
  { x: "53%", size: 12, delay: 0.42, rise: 190 },
  { x: "62%", size: 7, delay: 0.12, rise: 120 },
  { x: "71%", size: 11, delay: 0.3, rise: 165 },
  { x: "80%", size: 6, delay: 0.48, rise: 100 },
  { x: "89%", size: 13, delay: 0.2, rise: 185 },
] as const;

/** Um período e meio de senoide, fechado por baixo. O laço repete em -50%. */
const CREST_PATH =
  "M0,60 C90,10 270,10 360,60 C450,110 630,110 720,60 C810,10 990,10 1080,60 C1170,110 1350,110 1440,60 L1440,120 L0,120 Z";

interface WaveBackdropProps {
  /** Maré alta: o fundo da experiência está azul. */
  risen: boolean;
}

/**
 * Fundo fixo da página, e a transição de cor entre os dois atos da narrativa.
 *
 * Verde é o chão de toda a primeira metade. Quando a Natureza chega à água, a
 * maré sobe e o azul passa a ser o chão de Cidades — a troca acontece na página
 * inteira, de uma vez, em vez de seção por seção.
 *
 * O componente é pura pintura: quem decide QUANDO a maré vira é a seção que
 * contém o gatilho, e o estado mora no App. Assim a ordem do JSX não importa e
 * nenhuma referência precisa atravessar a árvore ao contrário.
 */
export function WaveBackdrop({ risen }: WaveBackdropProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="wave-backdrop"
      data-risen={risen}
      data-static={reducedMotion}
      aria-hidden="true"
    >
      <div className="wave-backdrop__sea">
        <div className="wave-backdrop__spray">
          {SPRAY.map((drop) => (
            <span
              key={drop.x}
              className="wave-backdrop__drop"
              style={
                {
                  "--drop-x": drop.x,
                  "--drop-size": `${drop.size}px`,
                  "--drop-delay": `${drop.delay}s`,
                  "--drop-rise": `${drop.rise}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/*
          Duas cristas com velocidades e sentidos diferentes. Uma só leria como
          um recorte deslizando; é o descompasso entre as duas que dá volume.
        */}
        <div className="wave-backdrop__wave wave-backdrop__wave--back">
          <div className="wave-backdrop__crest">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path d={CREST_PATH} />
            </svg>
          </div>
        </div>

        <div className="wave-backdrop__wave wave-backdrop__wave--front">
          <div className="wave-backdrop__crest">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path d={CREST_PATH} />
            </svg>
          </div>
        </div>

        <div className="wave-backdrop__water" />
      </div>
    </div>
  );
}
