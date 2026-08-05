import { useLayoutEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OPENING_DISTANCE, measureCutLine } from "@/animations/wordScrollReveal";
import { isMotionForced } from "@/lib/env";
import { setScrollLocked } from "@/hooks/useSmoothScroll";
import { createEntranceTimeline, createOpeningTimeline } from "./introAnimation";
import styles from "./Intro.module.css";

gsap.registerPlugin(ScrollTrigger);

const LETTERS = ["B", "R", "A", "S", "I", "L"] as const;

interface IntroProps {
  /** A Hero, renderizada atrás das metades desde o primeiro frame. */
  children: ReactNode;
  /** FASE 1 terminou: a palavra está formada e o scroll pode ser liberado. */
  onFormed: () => void;
  /** FASE 2 terminou: a Hero está aberta e a interatividade completa entra. */
  onOpened: () => void;
}

/**
 * Abertura do site, em duas fases sequenciais que não se misturam.
 *
 * FASE 1, automática: as seis letras de BRASIL entram espalhadas pela viewport
 * e viajam até o centro, formando a palavra. O scroll fica travado — não é
 * possível pular a entrada rolando.
 *
 * FASE 2, dirigida pelo scroll: a palavra é cortada no meio da altura das letras
 * e se abre. A de cima sobe, a de baixo desce, e a Hero é revelada pelo vão.
 * Contínua, proporcional e reversível.
 *
 * A troca entre as fases é invisível: são as mesmas letras, nas mesmas posições,
 * apenas passando do controle do tempo para o controle do scroll.
 */
export function Intro({ children, onFormed, onOpened }: IntroProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const topWordRef = useRef<HTMLParagraphElement>(null);
  const bottomWordRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const stage = stageRef.current;
    const topHalf = topHalfRef.current;
    const bottomHalf = bottomHalfRef.current;
    const topWord = topWordRef.current;
    const bottomWord = bottomWordRef.current;

    if (!scroll || !stage || !topHalf || !bottomHalf || !topWord || !bottomWord) {
      return;
    }

    const topLetters = gsap.utils.toArray<HTMLElement>(`.${styles.letter}`, topWord);
    const bottomLetters = gsap.utils.toArray<HTMLElement>(`.${styles.letter}`, bottomWord);

    if (topLetters.length !== LETTERS.length || bottomLetters.length !== LETTERS.length) {
      // Falha silenciosa aqui deixaria a palavra invisível para sempre, sem pista
      // nenhuma no console — as letras nascem com visibility: hidden.
      console.error(
        `[Intro] Esperava ${LETTERS.length} letras por cópia, encontrei ${topLetters.length} e ${bottomLetters.length}.`,
      );
      return;
    }

    let cancelled = false;
    let mm: gsap.MatchMedia | null = null;

    const build = () => {
      if (cancelled) return;

      /*
        matchMedia dá a cada breakpoint sua composição espalhada e sua distância
        de rolagem, e limpa a anterior automaticamente. Redimensionar reconstrói
        tudo, o que também remede a linha de corte para o novo tamanho de fonte.
      */
      mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1025px)",
          isTablet: "(min-width: 769px) and (max-width: 1024px)",
          isMobile: "(max-width: 768px)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isTablet, isMobile, isReduced } = context.conditions as Record<string, boolean>;

          // `?motion=full` em dev ignora a preferência do sistema — ver lib/env.ts.
          const reduced = isReduced && !isMotionForced();

          if (import.meta.env.DEV) {
            console.info("[Intro] ambiente resolvido", {
              breakpoint: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
              prefersReducedMotion: isReduced,
              motionForcado: isMotionForced(),
              caminho: reduced ? "REDUZIDO (expansão curta)" : "COMPLETO (expansão do centro)",
              fonteAnton: document.fonts.check('1em "Anton"'),
            });
          }

          /*
            A linha de corte é medida uma vez e usada nos dois lugares: o CSS
            recorta as metades com ela, e a FASE 2 calcula a partir dela quanto
            cada metade percorre. Medir separadamente arriscaria o corte e o
            movimento divergirem.
          */
          const stageTop = stage.getBoundingClientRect().top;
          const cutLine = measureCutLine(topWord) - stageTop;
          topHalf.style.setProperty("--cut", `${cutLine}px`);
          bottomHalf.style.setProperty("--cut", `${cutLine}px`);

          const refs = { stage, topHalf, bottomHalf, topLetters, bottomLetters };

          const distance = isMobile
            ? OPENING_DISTANCE.mobile
            : isTablet
              ? OPENING_DISTANCE.tablet
              : OPENING_DISTANCE.desktop;

          let trigger: ScrollTrigger | null = null;
          let opening: gsap.core.Timeline | null = null;
          let openedFired = false;

          /*
            A FASE 2 só é construída depois que o scroll é destravado.

            Criá-la antes era o bug: com o scroll travado o documento não é
            rolável, então o pin e as distâncias nasciam medidos contra uma
            página de altura zero e a rolagem não movia nada. E ao renderizar o
            progresso 0, o ScrollTrigger grava o valor inicial de cada tween —
            com a FASE 1 ainda por acontecer, ele gravaria o estado de antes da
            entrada, e todo refresh forçaria a tela de volta para lá.

            Destravando primeiro, as duas coisas se resolvem: a medição enxerga a
            página rolável e os valores iniciais gravados são os que a entrada
            deixou na tela.
          */
          const handleFormed = () => {
            // Síncrono: ao voltar, o overflow já saiu do body.
            setScrollLocked(false);

            opening = createOpeningTimeline(refs, cutLine, reduced);

            trigger = ScrollTrigger.create({
              trigger: scroll,
              start: "top top",
              end: `+=${distance}`,
              pin: true,
              anticipatePin: 1,
              scrub: 1,
              animation: opening,
              onUpdate: (self) => {
                if (!openedFired && self.progress > 0.92) {
                  openedFired = true;
                  onOpened();
                }
              },
            });

            /*
              Recalcula TODOS os gatilhos da página.

              O pin acima insere um espaçador da altura da abertura — mais de
              mil pixels — e empurra para baixo tudo o que vem depois. As seções
              abaixo criam seus gatilhos na montagem, contra um documento que
              ainda não tinha esse espaçador: sem este refresh, as posições de
              início delas ficam defasadas por toda a altura da abertura, e a
              revelação dispara no lugar errado ou não dispara.
            */
            ScrollTrigger.refresh();

            onFormed();
          };

          // O scroll fica travado durante toda a FASE 1 — não dá para pular a
          // entrada rolando.
          setScrollLocked(true);

          const entrance = createEntranceTimeline(refs, reduced, handleFormed);

          return () => {
            trigger?.kill();
            opening?.kill();
            entrance.kill();
            setScrollLocked(false);
          };
        },
      );
    };

    /*
      Tudo aqui é medido a partir da métrica do Anton: a posição natural das
      letras e a linha de corte. Construir antes da fonte carregar mede o
      fallback — o espalhamento sai deslocado e o corte cai no lugar errado.
      Até lá a palavra fica invisível (visibility no CSS), então a espera não aparece.
    */
    if (document.fonts?.status === "loaded") {
      build();
    } else {
      document.fonts.ready.then(build);
    }

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, [onFormed, onOpened]);

  // As duas cópias são idênticas de propósito: qualquer diferença entre elas
  // apareceria como um degrau na linha de corte.
  const word = (ref: RefObject<HTMLParagraphElement>) => (
    <p ref={ref} className={styles.word} aria-hidden="true">
      {LETTERS.map((letter, index) => (
        // O wrapper é o recorte; a letra sobe de dentro dele.
        <span key={`${letter}-${index}`} className={styles.letterMask}>
          <span className={styles.letter}>{letter}</span>
        </span>
      ))}
    </p>
  );

  return (
    <section ref={scrollRef} className={styles.introScroll}>
      <div ref={stageRef} className={styles.stage}>
        {/* Camada intermediária — a Hero, sempre presente. */}
        <div className={styles.heroStage}>
          {children}
        </div>

        {/* Camadas de transição — as duas metades da palavra. */}
        <div ref={topHalfRef} className={`${styles.half} ${styles.top}`}>
          {word(topWordRef)}
        </div>
        <div ref={bottomHalfRef} className={`${styles.half} ${styles.bottom}`}>
          {word(bottomWordRef)}
        </div>
      </div>
    </section>
  );
}
