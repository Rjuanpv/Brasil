import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useIsTouch";
import { duration, easing } from "@/lib/motion";
import "./CustomCursor.css";

/** Rótulos por tipo de alvo, conforme o motion system. */
const LABELS: Record<string, string> = {
  image: "EXPLORAR",
  link: "VER",
  move: "MOVER",
};

/**
 * Cursor customizado: um círculo que segue o ponteiro com atraso e cresce sobre
 * elementos interativos, trocando o rótulo conforme o `data-cursor` do alvo.
 *
 * Não renderiza em touch nem sob redução de movimento — nos dois casos ele seria
 * ruído sem função.
 */
export function CustomCursor() {
  const { subscribe } = useMousePosition();
  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();
  const active = !isTouch && !reducedMotion;

  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  // O cursor nativo só some quando o customizado está de fato em cena.
  useEffect(() => {
    document.body.dataset.customCursor = String(active);
    return () => {
      delete document.body.dataset.customCursor;
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return;

    const ctx = gsap.context(() => {
      const cursor = cursorRef.current;
      const dot = dotRef.current;
      if (!cursor || !dot) return;

      // O ponteiro chega normalizado -1..1; aqui vira pixel de viewport.
      const moveX = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power3.out" });
      const moveY = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power3.out" });

      const unsubscribe = subscribe(({ x, y }) => {
        moveX(((x + 1) / 2) * window.innerWidth);
        moveY(((y + 1) / 2) * window.innerHeight);
      });

      // Um só listener delegado: o alvo declara o tipo, o cursor reage.
      const onOver = (event: PointerEvent) => {
        const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
        const kind = target?.dataset.cursor;
        const next = kind ? (LABELS[kind] ?? null) : null;

        setLabel(next);

        /*
          Quem escala é o CÍRCULO, nunca o rótulo.

          Antes o texto vivia dentro do elemento escalado, a 3,5px de corpo, e
          era ampliado 3,4× pela transform — o navegador rasterizava a 3,5px e
          esticava o bitmap, o que produzia um serrilhado grosseiro. Com o
          rótulo fora da escala, ele é desenhado no seu tamanho real e sai nítido.
        */
        gsap.to(dot, {
          scale: next ? 3.4 : 1,
          duration: duration.fast,
          ease: easing.entrance,
        });
      };

      document.addEventListener("pointerover", onOver);

      return () => {
        unsubscribe();
        document.removeEventListener("pointerover", onOver);
      };
    });

    return () => ctx.revert();
  }, [active, subscribe]);

  // O rótulo aparece só depois do círculo ter crescido.
  useLayoutEffect(() => {
    if (!labelRef.current) return;
    gsap.to(labelRef.current, {
      opacity: label ? 1 : 0,
      duration: duration.fast,
      ease: easing.smooth,
    });
  }, [label]);

  if (!active) return null;

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      {/* O círculo é o que escala. */}
      <span ref={dotRef} className="custom-cursor__dot" />
      {/* O rótulo é irmão dele, fora da escala, desenhado no tamanho real. */}
      <span ref={labelRef} className="custom-cursor__label">
        {label}
      </span>
    </div>
  );
}
