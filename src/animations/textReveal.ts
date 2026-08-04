// `gsap` é um namespace global declarado pelos tipos da lib — os tipos
// gsap.core.Timeline e gsap.Position não precisam de import.
import "gsap";
import { duration, easing } from "@/lib/motion";
import { splitChars, splitWords } from "@/lib/split";
import type { SplitResult } from "@/lib/split";

export interface RevealOptions {
  /** Caracteres só em momentos de destaque, conforme o motion system. */
  mode?: "words" | "chars";
  stagger?: number;
  duration?: number;
  ease?: string;
}

/**
 * Adiciona a revelação de um bloco de texto a uma timeline existente.
 *
 * O texto sobe de dentro do próprio recorte, sem fade — o doc é explícito em não
 * depender de fade-in. O estado inicial (translateY 110%) já está no CSS via
 * [data-animate="mask-up"], então nada pisca entre o primeiro paint e o GSAP.
 *
 * O tween é construído direto na timeline em vez de criado solto e adicionado
 * depois: um tween pausado adicionado a uma timeline não fica sob o controle dela.
 *
 * Devolve o `revert`, que restaura o markup original — chamar no cleanup.
 */
export function addTextReveal(
  timeline: gsap.core.Timeline,
  element: HTMLElement,
  position: gsap.Position,
  options: RevealOptions = {},
): () => void {
  const {
    mode = "words",
    stagger = mode === "chars" ? 0.05 : 0.08,
    duration: dur = duration.slow,
    ease = easing.entrance,
  } = options;

  const result: SplitResult = mode === "chars" ? splitChars(element) : splitWords(element);

  timeline.fromTo(
    result.targets,
    { yPercent: 110 },
    { yPercent: 0, duration: dur, ease, stagger },
    position,
  );

  return result.revert;
}
