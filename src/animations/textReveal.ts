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

  /*
    `y: 0` explícito nos dois estados, e não é redundância — é o que faz a
    revelação terminar visível.

    O estado inicial escondido vive no CSS como `transform: translate3d(0, 110%, 0)`.
    Só que `getComputedStyle` NUNCA devolve isso: devolve `matrix(1,0,0,1,0,179.5)`,
    com a porcentagem já resolvida em pixels. O GSAP, ao tocar o elemento pela
    primeira vez, lê essa matriz e a guarda como `y: 179.5px` — ele não tem como
    saber que aquilo era uma porcentagem.

    A partir daí `yPercent` vira uma SEGUNDA translação, somada à primeira: a
    palavra ficava a 220% no início, e ao animar `yPercent` até 0 sobravam os
    179.5px de `y` que ninguém tinha zerado. O título terminava exatamente uma
    linha abaixo da máscara — invisível, sem erro nenhum.

    Zerando `y` no `from`, a única translação passa a ser a porcentagem, e o fim
    do percurso é de fato o zero.
  */
  timeline.fromTo(
    result.targets,
    { yPercent: 110, y: 0 },
    { yPercent: 0, y: 0, duration: dur, ease, stagger },
    position,
  );

  return result.revert;
}
