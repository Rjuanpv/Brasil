import { useRef } from "react";
import { Layer } from "@/components/Layer/Layer";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import { useParallax } from "@/hooks/useParallax";
import { scrollTo } from "@/hooks/useSmoothScroll";
import { heroLayers } from "./heroLayers";
import "./Hero.css";

interface HeroProps {
  /** Parallax de mouse — só depois que a abertura termina. */
  interactive: boolean;
}

/**
 * A Hero está renderizada e visível desde o primeiro frame, atrás das metades da
 * palavra BRASIL. Ela não tem animação de entrada: quem a revela é o vão que se
 * abre entre as metades, e a escala que a Intro anima no scroll.
 *
 * A composição é toda em HTML, com uma camada por elemento. A profundidade vem
 * da ordem de empilhamento e da diferença de deslocamento no parallax.
 */
export function Hero({ interactive }: HeroProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);

  const scrollHintRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  /*
    Parallax por camada. As intensidades vêm do motion system e são
    propositalmente distintas — o azul e o amarelo se movem em sentidos opostos
    para que a composição ganhe volume em vez de deslizar em bloco.

    A imagem principal está FORA da lista, de propósito.

    Ela tinha a maior profundidade de todas (30px), mas é a única camada com
    aresta reta e alto contraste contra o fundo. Nas outras o mesmo
    deslocamento acontece dentro de gradientes e silhuetas difusas, onde o olho
    não tem referência para medi-lo; aqui a borda do retângulo denuncia cada
    pixel, e o que deveria ler como profundidade lia como um elemento solto.

    Quando o export real do Canva substituir este placeholder — com recorte
    orgânico no lugar do retângulo — vale reintroduzi-la com um valor baixo.
  */
  useParallax(
    () => [
      { element: backgroundRef.current!, depth: "background" },
      { element: blueRef.current!, depth: "shapes", invert: true },
      { element: yellowRef.current!, depth: "shapes" },
      { element: titleRef.current!, depth: "type", invert: true },
      { element: scrollHintRef.current!, depth: "foreground" },
    ],
    interactive,
  );

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      {/* ---- Camadas, do fundo para a frente ---- */}
      <Layer ref={backgroundRef} src={heroLayers.background} className="hero__background" priority />
      <Layer ref={blueRef} src={heroLayers.shapeBlue} className="hero__blue" priority />
      <Layer ref={mainRef} src={heroLayers.main} className="hero__main" priority />
      <Layer ref={yellowRef} src={heroLayers.shapeYellow} className="hero__yellow" priority />

      {/* A textura é um azulejo repetido, não uma imagem esticada: rasterizar
          ruído fractal na viewport inteira custa caro e o grão não tem escala
          reconhecível de qualquer forma. */}
      <div
        className="hero__texture"
        style={{ backgroundImage: `url(${heroLayers.texture})` }}
        aria-hidden="true"
      />

      {/*
        Tipografia. O título e a chamada ficam em blocos separados de propósito:
        a forma amarela passa entre os dois, cruzando as letras sem nunca cobrir
        o texto de apoio nem o botão.
      */}
      <div className="hero__content">
        <h1 ref={titleRef} id="hero-title" className="hero__title display parallax-layer">
          <span className="hero__title-line">Brasil</span>
          <span className="hero__title-line hero__title-line--sub">Em Movimento</span>
        </h1>

        <div className="hero__copy">
          <p className="hero__support">Um país de ritmos, contrastes e transformações.</p>

          <div className="hero__action">
            <MagneticButton onClick={() => scrollTo("#manifesto")}>
              Explore <span aria-hidden="true">↓</span>
            </MagneticButton>
          </div>
        </div>
      </div>

      <div ref={scrollHintRef} className="hero__scroll-hint label parallax-layer" aria-hidden="true">
        Role para descobrir
      </div>
    </section>
  );
}
