/*
  Tipos para o componente vendorizado em SplashCursor.jsx.

  O componente é mantido em JavaScript, exatamente como distribuído pelo React
  Bits, para que atualizações do upstream possam ser comparadas linha a linha.
  Como o projeto é TypeScript estrito e `allowJs` está desligado, esta declaração
  é o que permite importá-lo com tipos.
*/

export interface SplashCursorProps {
  /** Resolução da simulação de velocidade. */
  SIM_RESOLUTION?: number;
  /** Resolução da textura de cor. É o parâmetro que mais pesa na GPU. */
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  /** Velocidade com que a cor se dissipa. Maior = rastro mais curto. */
  DENSITY_DISSIPATION?: number;
  /** Velocidade com que o movimento se dissipa. */
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  /** Quantidade de vorticidade — o quanto o fluido redemoinha. */
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  /** Iluminação simples sobre o fluido. */
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: { r: number; g: number; b: number };
  TRANSPARENT?: boolean;
  /** Quando true, cicla cores aleatórias. Quando false, usa COLOR. */
  RAINBOW_MODE?: boolean;
  /** Cor em hexadecimal, usada quando RAINBOW_MODE é false. */
  COLOR?: string;
}

declare function SplashCursor(props: SplashCursorProps): JSX.Element;

export default SplashCursor;
