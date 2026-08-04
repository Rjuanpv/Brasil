import { isMotionForced } from "@/lib/env";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Quando true: sem parallax contínuo, sem espalhamento das letras, sem movimento
 * automático. As transições essenciais continuam — o conteúdo nunca fica preso
 * num estado inicial.
 *
 * Em desenvolvimento, `?motion=full` ignora a preferência do sistema. Ver env.ts.
 */
export function useReducedMotion(): boolean {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return prefersReduced && !isMotionForced();
}
