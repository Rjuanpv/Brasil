import { useCallback, useState } from "react";
import { Intro } from "@/components/Intro/Intro";
import { StatesMarquee } from "@/components/StatesMarquee/StatesMarquee";
import { Navigation } from "@/components/Navigation/Navigation";
import { CustomCursor } from "@/components/CustomCursor/CustomCursor";
import SplashCursor from "@/components/SplashCursor/SplashCursor";
import { Hero } from "@/sections/Hero/Hero";
import { Manifesto } from "@/sections/Manifesto/Manifesto";
import { Territories } from "@/sections/Territories/Territories";
import { MouseProvider } from "@/hooks/useMousePosition";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Em produção a abertura roda uma vez por sessão, não a cada volta ao topo. */
const LOADER_SEEN_KEY = "bem:loader-seen";

/**
 * Em desenvolvimento a abertura roda sempre: refinar uma animação que só toca
 * uma vez por sessão exigiria uma aba anônima a cada ajuste.
 * Para checar o comportamento real de sessão, use `npm run build && npm run preview`.
 */
function shouldSkipIntro(): boolean {
  if (import.meta.env.DEV) return false;
  return sessionStorage.getItem(LOADER_SEEN_KEY) === "1";
}

function Experience() {
  const [seenIntro] = useState(shouldSkipIntro);

  /*
    A trava do scroll durante a formação é do Intro, não daqui: a ordem entre
    destravar e criar o ScrollTrigger precisa ser síncrona, e passar por estado
    do React introduziria um frame de defasagem no meio dela.

    Aqui fica só `interactive`: a abertura terminou, e o parallax das camadas e
    a navegação entram. Os efeitos de ponteiro não esperam por isso — ver abaixo.
  */
  const [interactive, setInteractive] = useState(seenIntro);

  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();

  /*
    Os efeitos de ponteiro entram desde o primeiro frame, e não ao fim da
    abertura: eles são a resposta imediata ao mouse, e esperar o scroll terminar
    fazia a página parecer morta justamente quando o usuário chega.

    O que os desliga é o ambiente, não o tempo: toque (sem ponteiro para
    rastrear) e redução de movimento.
  */
  const pointerEffects = !isTouch && !reducedMotion;

  useSmoothScroll();

  const handleFormed = useCallback(() => {
    /* A palavra está formada e o scroll já foi liberado pelo Intro. */
  }, []);

  const handleOpened = useCallback(() => {
    sessionStorage.setItem(LOADER_SEEN_KEY, "1");
    setInteractive(true);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>

      {/*
        Rastro de fluido do ponteiro.

        RAINBOW_MODE fica desligado: o modo padrão cicla cores aleatórias, o que
        contraria a paleta do projeto. A cor é o amarelo da identidade, que o
        briefing reserva justamente para estados de interação.

        DYE_RESOLUTION abaixo do padrão de 1440 — é o parâmetro que mais pesa na
        GPU, e a página já estava no limite antes deste efeito.
      */}
      {pointerEffects && (
        <SplashCursor
          COLOR="#FFD500"
          RAINBOW_MODE={false}
          DYE_RESOLUTION={1024}
          DENSITY_DISSIPATION={4}
          VELOCITY_DISSIPATION={2.5}
          CURL={8}
          SPLAT_RADIUS={0.18}
          SPLAT_FORCE={5200}
          PRESSURE={0.18}
        />
      )}

      <CustomCursor />
      <Navigation section="01 — Hero" visible={interactive} />

      <main id="main">
        <Intro onFormed={handleFormed} onOpened={handleOpened}>
          <Hero interactive={interactive} />
        </Intro>

        {/* A faixa entra logo depois da Hero: é a primeira afirmação de escala
            territorial, antes de o Manifesto começar a argumentar. */}
        <StatesMarquee />

        <Manifesto />
        <Territories />

        {/* TODO: 05 Ritmos, 06 Natureza, 07 Cidades, 08 Futuro, 09 Encerramento, rodapé. */}
      </main>
    </>
  );
}

export default function App() {
  return (
    <MouseProvider>
      <Experience />
    </MouseProvider>
  );
}
