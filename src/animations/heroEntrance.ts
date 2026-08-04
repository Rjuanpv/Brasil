import gsap from "gsap";

/*
  Entrada da composição da Hero, junto com a abertura da palavra.

  Antes a Hero estava pronta atrás das metades e o vão apenas a descobria. O vão
  continua sendo o que revela — mas o que ele revela agora é uma composição
  chegando, e não uma imagem parada esperando ser vista.

  Cada elemento entra pelo lado em que vive: o círculo azul e o painel de imagem
  voltam pela direita, a forma amarela e a tipografia pela esquerda. É o mesmo
  princípio da composição em camadas — quem está mais ao fundo chega primeiro.

  O fundo e a textura NÃO entram. Os dois cobrem a viewport inteira; deslocá-los
  abriria uma faixa vazia na borda oposta durante todo o percurso.
*/

/** Atributo com que um elemento declara de que lado entra. */
const ATTRIBUTE = "data-enter-from";

/** Folga além da borda, para nada ficar espiando na largura exata. */
const CLEARANCE = 48;

/* Posições dentro da timeline normalizada da abertura, que dura 1. */
const START = 0.08;
const STEP = 0.045;
const TRAVEL = 0.58;

/**
 * Acrescenta a entrada da Hero à timeline da abertura.
 *
 * A timeline é dirigida pelo scroll, então a entrada é proporcional e
 * reversível como o resto da FASE 2: subir a página desmonta a composição na
 * mesma ordem em que ela se montou.
 *
 * `root` é o palco da abertura; só elementos marcados com `data-enter-from`
 * dentro dele são tocados.
 */
export function addHeroEntrance(
  timeline: gsap.core.Timeline,
  root: HTMLElement,
  reduced: boolean,
): void {
  const elements = gsap.utils.toArray<HTMLElement>(`[${ATTRIBUTE}]`, root);
  if (elements.length === 0) return;

  /*
    Sob movimento reduzido a composição não viaja: ela aparece. Deslocamento é o
    que causa desconforto vestibular — opacidade não é —, e a entrada continua
    existindo como leitura, só que sem percurso.
  */
  if (reduced) {
    timeline.fromTo(
      elements,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.45, ease: "none", stagger: 0.04 },
      START,
    );
    return;
  }

  const bounds = root.getBoundingClientRect();

  elements.forEach((element, index) => {
    const side = element.dataset.enterFrom === "right" ? "right" : "left";
    const rect = element.getBoundingClientRect();

    // Elemento sem largura medível (fonte ainda não aplicada, display: none no
    // breakpoint) não tem como ter distância calculada — fica onde está.
    if (rect.width === 0) return;

    /*
      A distância é MEDIDA, e não escolhida: cada elemento recua exatamente o
      necessário para sair pela sua borda, mais a folga.

      Números fixos não sobreviveriam aos breakpoints — o painel de imagem tem
      30vw no desktop e 58vw no celular, e o valor que o tira da tela num caso
      o deixaria a meio caminho no outro.
    */
    const distance =
      side === "right"
        ? bounds.right - rect.left + CLEARANCE
        : -(rect.right - bounds.left + CLEARANCE);

    /*
      xPercent, e não x.

      O parallax de mouse escreve `x` e `y` nestes mesmos elementos via
      quickTo. São componentes distintos do transform no GSAP, então as duas
      animações se somam em vez de disputar a propriedade — sem isso, mexer o
      mouse durante a abertura teleportaria a camada para o deslocamento do
      ponteiro, cancelando a entrada.
    */
    timeline.fromTo(
      element,
      { xPercent: (distance / rect.width) * 100 },
      {
        xPercent: 0,
        duration: TRAVEL,
        /*
          Uma curva suave, e não o `ease: "none"` que as metades usam.

          Lá o motivo era outro: as metades ladrilham a tela, e qualquer
          desencontro entre elas e o scroll abriria uma fresta. Estes elementos
          só precisam POUSAR, e chegar a velocidade constante num ponto fixo lê
          como mecânico. Com scrub, a curva apenas remapeia posição para
          rolagem — nada continua se movendo depois que a página para.
        */
        ease: "power2.out",
      },
      START + index * STEP,
    );
  });
}
