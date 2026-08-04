import { useMediaQuery } from "./useMediaQuery";

/**
 * True quando não há nenhum ponteiro preciso disponível — ou seja, quando não
 * existe mouse ou trackpad para responder. Nesses casos o cursor customizado,
 * o efeito magnético e o parallax de mouse saem de cena.
 *
 * A verificação é `any-pointer`, não `pointer`, de propósito: `pointer` descreve
 * apenas o ponteiro *primário*. Num notebook Windows com tela sensível ao toque o
 * primário é reportado como grosseiro, e usar `pointer: coarse` desligaria toda a
 * interatividade de mouse numa máquina que tem mouse.
 *
 * `any-pointer: fine` responde à pergunta que de fato importa: existe algum
 * dispositivo apontador preciso? Um celular responde não; um notebook com
 * touchscreen responde sim.
 */
export function useIsTouch(): boolean {
  return !useMediaQuery("(any-pointer: fine)");
}
