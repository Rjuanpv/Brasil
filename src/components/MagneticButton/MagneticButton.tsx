import { useLayoutEffect, useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { createMagnetic } from "@/animations/magnetic";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./MagneticButton.css";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  strength?: number;
}

/**
 * Botão que se desloca discretamente em direção ao cursor.
 *
 * O elemento animado é o wrapper, não o botão: assim o deslocamento magnético não
 * disputa a propriedade `transform` com o hover do próprio botão.
 */
export function MagneticButton({
  children,
  variant = "primary",
  strength,
  className,
  ...props
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (isTouch || reducedMotion) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    return createMagnetic(wrapper, strength);
  }, [isTouch, reducedMotion, strength]);

  return (
    <span ref={wrapperRef} className="magnetic">
      <button
        type="button"
        className={`btn btn--${variant}${className ? ` ${className}` : ""}`}
        data-cursor="link"
        {...props}
      >
        {children}
      </button>
    </span>
  );
}
