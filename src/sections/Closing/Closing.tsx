import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import { addTextReveal } from "@/animations/textReveal";
import { playOnEnter } from "@/animations/playOnEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollTo } from "@/hooks/useSmoothScroll";
import { duration, easing } from "@/lib/motion";
import "./Closing.css";

/** Uma linha por elemento — as quebras são autoradas, nunca calculadas. */
const LINES = ["O Brasil", "continua", "em movimento."];

/**
 * 09 — ENCERRAMENTO. "O BRASIL CONTINUA EM MOVIMENTO."
 *
 * A última frase entra por CARACTERES, e é a única da página que faz isso: o
 * motion system reserva a animação por caractere a momentos de destaque, e não
 * existe momento mais de destaque que o fim. Nas outras oito seções o título
 * entra por palavras.
 *
 * O verde volta atrás do preto conforme a seção sobe — a página termina na cor
 * em que começou, que é o que "continua" quer dizer.
 */
export function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    /*
      Sob redução de movimento nada é dividido em spans. Sem o split não existe
      `.split-char`, o estado inicial escondido do CSS não se aplica, e a frase
      simplesmente aparece — legível, sem depender de a animação rodar.
    */
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(".closing__text");
      if (targets.length === 0) return;

      const timeline = gsap.timeline({ paused: true });

      const reverts = targets.map((target, index) =>
        addTextReveal(timeline, target, index * 0.12, {
          mode: "chars",
          duration: duration.slow,
          ease: easing.dramatic,
        }),
      );

      /* O clarão verde abre junto com a última linha, não antes dela. */
      timeline.fromTo(
        glow,
        { scale: 0.4, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: duration.cinematic, ease: easing.dramatic },
        0.3,
      );

      /*
        A frase inteira nasce escondida dentro das máscaras: se o gatilho não
        disparar, o encerramento fica em branco. Ver animations/playOnEnter.ts.
      */
      const stop = playOnEnter([section], () => timeline.play(), { line: 0.65 });

      return () => {
        stop();
        reverts.forEach((revert) => revert());
      };
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="closing"
      aria-labelledby="closing-title"
    >
      {/* Verde vibrante difuso, atrás da frase: o país voltando à cor de origem. */}
      <div ref={glowRef} className="closing__glow" aria-hidden="true" />

      <h2 id="closing-title" className="closing__title display">
        {LINES.map((line, index) => (
          <span
            key={line}
            className={`closing__line${index === LINES.length - 1 ? " closing__line--accent" : ""}`}
            data-animate="mask-up"
          >
            <span className="closing__text">{line}</span>
          </span>
        ))}
      </h2>

      <div className="closing__action">
        <MagneticButton variant="secondary" onClick={() => scrollTo("#top")}>
          Voltar ao início <span aria-hidden="true">↑</span>
        </MagneticButton>
      </div>
    </section>
  );
}
