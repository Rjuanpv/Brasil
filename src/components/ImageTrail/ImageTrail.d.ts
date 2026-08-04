/*
  Tipos para o componente vendorizado em ImageTrail.jsx.

  Mesma razão do SplashCursor: o componente é mantido em JavaScript, próximo do
  que o React Bits distribui, para que atualizações do upstream possam ser
  comparadas linha a linha. Como o projeto é TypeScript estrito e `allowJs` está
  desligado, esta declaração é o que permite importá-lo com tipos.
*/

export interface ImageTrailProps {
  /** URLs das imagens que entram no rastro, na ordem em que se revezam. */
  items?: readonly string[];
  /** Estilo de animação, de 1 a 8. Fora dessa faixa, cai na 1. */
  variant?: number;
  /**
   * Ref do elemento que escuta o ponteiro. Quando ausente, é o próprio contêiner
   * das imagens — que então precisa receber eventos, e portanto ficar por cima
   * do conteúdo. Informar uma superfície permite ao rastro passar ATRÁS do texto.
   *
   * É um ref, e não o elemento: um elemento seria `null` na primeira renderização.
   */
  surfaceRef?: { current: HTMLElement | null } | null;
}

declare function ImageTrail(props: ImageTrailProps): JSX.Element;

export default ImageTrail;
