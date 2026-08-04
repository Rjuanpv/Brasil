import gsap from "gsap";
import { MAGNETIC_STRENGTH, duration, easing } from "@/lib/motion";

/**
 * Puxa o elemento discretamente em direção ao cursor enquanto ele está por cima.
 *
 * O deslocamento é proporcional à distância do ponteiro ao centro do elemento,
 * limitado a MAGNETIC_STRENGTH px — o doc é explícito em não exagerar.
 *
 * Devolve a função de cleanup.
 */
export function createMagnetic(element: HTMLElement, strength = MAGNETIC_STRENGTH) {
  const moveX = gsap.quickTo(element, "x", { duration: 0.4, ease: easing.entrance });
  const moveY = gsap.quickTo(element, "y", { duration: 0.4, ease: easing.entrance });

  // O rect só é medido ao entrar, não a cada frame.
  let rect: DOMRect | null = null;

  const onEnter = () => {
    rect = element.getBoundingClientRect();
  };

  const onMove = (event: PointerEvent) => {
    if (!rect) rect = element.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normaliza pela metade do elemento: nas bordas o deslocamento é o máximo.
    const offsetX = ((event.clientX - centerX) / (rect.width / 2)) * strength;
    const offsetY = ((event.clientY - centerY) / (rect.height / 2)) * strength;

    moveX(gsap.utils.clamp(-strength, strength, offsetX));
    moveY(gsap.utils.clamp(-strength, strength, offsetY));
  };

  const onLeave = () => {
    rect = null;
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: duration.normal,
      ease: "elastic.out(1, 0.5)",
    });
  };

  element.addEventListener("pointerenter", onEnter);
  element.addEventListener("pointermove", onMove);
  element.addEventListener("pointerleave", onLeave);

  return () => {
    element.removeEventListener("pointerenter", onEnter);
    element.removeEventListener("pointermove", onMove);
    element.removeEventListener("pointerleave", onLeave);
    gsap.killTweensOf(element);
    gsap.set(element, { x: 0, y: 0 });
  };
}
