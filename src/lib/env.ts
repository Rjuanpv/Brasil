/**
 * Em desenvolvimento, `?motion=full` força a experiência completa mesmo com
 * `prefers-reduced-motion: reduce` ativo no sistema.
 *
 * Existe porque a flag costuma estar ligada sem que a pessoa saiba — no Windows,
 * desativar "Mostrar animações" em Acessibilidade já a liga — e nesse estado o
 * site inteiro cai no modo reduzido: sem espalhamento das letras, sem cursor,
 * sem parallax, sem magnético. Sem uma forma de contornar, é impossível avaliar
 * o design que se está construindo.
 *
 * Nunca vale em produção: a preferência do usuário final é definitiva.
 */
const MOTION_KEY = "bem:motion-forced";

export function isMotionForced(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;

  /*
    O override é lembrado pela sessão, e não só enquanto o parâmetro está na
    URL.

    Depender da query string o tornava frágil demais: bastava navegar, digitar
    o endereço à mão ou recarregar sem o parâmetro para o site inteiro voltar ao
    modo reduzido — sem cursor, sem parallax, sem rastro — dando a impressão de
    que algo tinha quebrado.

    `?motion=full` liga e memoriza. `?motion=system` desliga e volta a obedecer
    a preferência do sistema.
  */
  const param = new URLSearchParams(window.location.search).get("motion");

  if (param === "full") {
    sessionStorage.setItem(MOTION_KEY, "1");
    return true;
  }

  if (param === "system") {
    sessionStorage.removeItem(MOTION_KEY);
    return false;
  }

  return sessionStorage.getItem(MOTION_KEY) === "1";
}
