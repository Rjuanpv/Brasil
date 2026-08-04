import { forwardRef } from "react";
import type { CSSProperties } from "react";
import "./Layer.css";

export interface LayerProps {
  /** URL do asset. Hoje aponta para o placeholder SVG; amanhã, para o export do Canva. */
  src: string;
  /**
   * Texto alternativo. Omitir marca a camada como decorativa (`aria-hidden`),
   * que é o caso de fundos, formas e texturas.
   */
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Camadas acima da dobra não devem esperar o lazy loading. */
  priority?: boolean;
  /**
   * De que borda a camada entra em cena. Apenas marca o elemento com
   * `data-enter-from`; quem anima é quem monta a timeline — ver
   * animations/heroEntrance.ts.
   */
  enterFrom?: "left" | "right";
}

/**
 * Uma camada visual da composição.
 *
 * Existe para que trocar um placeholder procedural pelo asset real do Canva seja
 * uma mudança de import, sem tocar em posicionamento ou animação — o elemento
 * animado pelo GSAP é sempre o wrapper, nunca a imagem.
 */
export const Layer = forwardRef<HTMLDivElement, LayerProps>(function Layer(
  { src, alt, className, style, priority = false, enterFrom },
  ref,
) {
  const decorative = alt === undefined;

  return (
    <div
      ref={ref}
      className={`layer parallax-layer${className ? ` ${className}` : ""}`}
      style={style}
      data-enter-from={enterFrom}
      aria-hidden={decorative || undefined}
    >
      <img
        src={src}
        alt={decorative ? "" : alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    </div>
  );
});
