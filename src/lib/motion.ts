/*
  Constantes do motion system. Fonte: docs/# MOTION SYSTEM.txt
  Nenhuma animação do projeto deve escrever ease ou duração literal — tudo sai daqui,
  para que o ritmo continue igual nas nove seções.
*/

export const easing = {
  entrance: "power4.out",
  transition: "power4.inOut",
  dramatic: "expo.out",
  smooth: "sine.inOut",
} as const;

export const duration = {
  fast: 0.25,
  normal: 0.6,
  slow: 1.0,
  cinematic: 1.5,
} as const;

/*
  Deslocamento máximo de cada camada no parallax de mouse, em px.
  A diferença entre os valores é o que cria a profundidade — se ficarem próximos,
  a composição achata.
*/
export const parallaxDepth = {
  background: 5,
  shapes: 15,
  image: 30,
  type: 10,
  foreground: 40,
} as const;

export type ParallaxDepth = keyof typeof parallaxDepth;

/** Posição do ponteiro normalizada para -1..1 a partir do centro da viewport. */
export interface NormalizedPointer {
  x: number;
  y: number;
}

/* Deslocamento do efeito magnético. O doc limita a 8–12px. */
export const MAGNETIC_STRENGTH = 10;

/* Suavização do parallax: a inércia e o atraso vêm daqui, via gsap.quickTo. */
export const PARALLAX_SMOOTHING = {
  duration: 0.8,
  ease: "power3.out",
} as const;

/* Teto de 2,8s no doc. 2,4s deixa margem sem parecer arrastado. */
export const LOADER_DURATION = 2.4;
