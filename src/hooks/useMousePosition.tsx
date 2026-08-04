import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import type { NormalizedPointer } from "@/lib/motion";

type Subscriber = (pointer: NormalizedPointer) => void;

interface MouseContextValue {
  /** Registra um consumidor chamado uma vez por frame, só quando o ponteiro se move. */
  subscribe: (fn: Subscriber) => () => void;
  /** Leitura pontual, sem assinar. */
  read: () => NormalizedPointer;
}

const MouseContext = createContext<MouseContextValue | null>(null);

/*
  Um único listener de mousemove no documento inteiro, conforme o doc exige.
  O evento apenas grava números numa ref — nenhum trabalho de layout, nenhum estado
  React. A distribuição acontece no ticker do GSAP, no máximo uma vez por frame.
*/
export function MouseProvider({ children }: { children: ReactNode }) {
  const pointer = useRef<NormalizedPointer>({ x: 0, y: 0 });
  const subscribers = useRef(new Set<Subscriber>());
  const dirty = useRef(false);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
      dirty.current = true;
    };

    // Se o ponteiro sair da janela, as camadas voltam ao repouso em vez de congelar.
    const onPointerLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      dirty.current = true;
    };

    const tick = () => {
      if (!dirty.current) return;
      dirty.current = false;
      for (const fn of subscribers.current) fn(pointer.current);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      gsap.ticker.remove(tick);
    };
  }, []);

  const value = useMemo<MouseContextValue>(
    () => ({
      subscribe: (fn) => {
        subscribers.current.add(fn);
        return () => {
          subscribers.current.delete(fn);
        };
      },
      read: () => pointer.current,
    }),
    [],
  );

  return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>;
}

export function useMousePosition(): MouseContextValue {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error("useMousePosition precisa estar dentro de <MouseProvider>.");
  }
  return context;
}
