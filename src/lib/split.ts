/*
  Split de texto para animações de entrada.

  As linhas dos títulos são autoradas no markup (um elemento por linha), então não
  há necessidade de medir quebras em tempo de execução — o que dispensa um plugin
  e o recálculo em resize.

  Cada palavra/caractere sai embrulhado num .split-line, que é a máscara de overflow.
*/

type SplitMode = "words" | "chars";

export interface SplitResult {
  /** Os elementos animáveis, na ordem do texto. */
  targets: HTMLElement[];
  /** Restaura o texto original — chamar no cleanup do gsap.context. */
  revert: () => void;
}

function createPart(text: string, className: string): HTMLElement {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

/**
 * Quebra o conteúdo de texto de `element` em spans animáveis.
 * O texto original é preservado e restaurado por `revert()`.
 */
export function split(element: HTMLElement, mode: SplitMode): SplitResult {
  const original = element.innerHTML;
  const text = element.textContent ?? "";

  const line = document.createElement("span");
  line.className = "split-line";

  const targets: HTMLElement[] = [];
  const partClass = mode === "words" ? "split-word" : "split-char";

  // Separa mantendo os espaços como tokens, para poder preservá-los.
  const tokens = mode === "words" ? text.split(/(\s+)/) : Array.from(text);

  for (const token of tokens) {
    if (token.length === 0) continue;

    if (/^\s+$/.test(token)) {
      line.appendChild(createPart(token, "split-space"));
      continue;
    }

    const part = createPart(token, partClass);
    line.appendChild(part);
    targets.push(part);
  }

  // O texto completo continua acessível a leitores de tela; os spans viram decoração.
  element.setAttribute("aria-label", text);
  line.setAttribute("aria-hidden", "true");

  element.replaceChildren(line);

  return {
    targets,
    revert: () => {
      element.innerHTML = original;
      element.removeAttribute("aria-label");
    },
  };
}

/** Quebra em palavras. Padrão para títulos e textos de apoio. */
export const splitWords = (element: HTMLElement) => split(element, "words");

/**
 * Quebra em caracteres. O doc restringe isso a momentos de destaque —
 * usar só na palavra BRASIL do loader e da hero.
 */
export const splitChars = (element: HTMLElement) => split(element, "chars");
