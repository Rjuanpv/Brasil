/*
  Dispara uma animação quando o elemento entra na viewport.

  É a mesma decisão já tomada em hooks/useSectionReveal.ts, agora aplicada a
  todas as revelações que NÃO são scrub — títulos, números, listas.

  Por que não ScrollTrigger aqui:

  1. Ele guarda posições calculadas contra a altura do documento, e essa altura
     muda depois da montagem: o pin da abertura insere um espaçador de mais de
     mil pixels. Existe um `ScrollTrigger.refresh()` para corrigir isso, mas ele
     depende de ordem — e quando falha, falha em silêncio.

  2. E o silêncio é o problema real. Estas animações não são enfeite: elas são o
     que TORNA O CONTEÚDO VISÍVEL. O texto nasce escondido dentro da máscara
     (ver styles/animations.css) esperando ser trazido para cima. Um gatilho que
     não dispara não deixa a página menos animada — deixa a seção em branco.

  3. IntersectionObserver não pode "perder" o momento. Ele não guarda posição
     nenhuma, e ao observar um elemento reporta o estado ATUAL, mesmo que ele já
     esteja na tela desde antes. Um gatilho de scroll só reage ao próximo evento
     de rolagem, e se o cálculo estiver errado, nunca reage.

  Só transform e opacity do outro lado: nada aqui causa reflow.
*/

export interface EnterOptions {
  /**
   * Fração da altura da viewport onde está a linha de disparo, contada do topo.
   * 0.82 equivale ao `start: "top 82%"` do ScrollTrigger.
   */
  line?: number;
}

/**
 * Chama `play` uma vez para cada elemento, quando ele cruza a linha de disparo.
 *
 * Devolve a função de desmonte — chamar no cleanup.
 */
export function playOnEnter(
  elements: HTMLElement[],
  play: (element: HTMLElement, index: number) => void,
  { line = 0.82 }: EnterOptions = {},
): () => void {
  if (elements.length === 0) return () => {};

  /* O índice acompanha a ordem do documento: é dele que sai qualquer cascata. */
  const order = new Map(elements.map((element, index) => [element, index]));

  /*
    A borda inferior do root sobe até a linha de disparo. O elemento passa a
    intersectar exatamente quando o seu topo cruza essa altura — a tradução
    literal de `start: "top {line}%"`.
  */
  const rootMargin = `0px 0px -${Math.round((1 - line) * 100)}% 0px`;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target as HTMLElement;
        // Uma vez só: reanimar a cada passagem viraria ruído para quem rola de
        // volta.
        observer.unobserve(element);
        play(element, order.get(element) ?? 0);
      });
    },
    { rootMargin, threshold: 0 },
  );

  elements.forEach((element) => observer.observe(element));

  return () => observer.disconnect();
}
