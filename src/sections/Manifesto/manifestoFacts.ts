/**
 * Números do manifesto.
 *
 * O briefing pede números na seção, e números só sustentam a ideia de "o Brasil
 * não para" se forem verdadeiros. Estes são dados públicos e estáveis; o valor
 * fica separado do rótulo para que a animação de contagem possa animar só o
 * número, sem tocar no texto.
 */
export interface ManifestoFact {
  /** Valor final, já como número, para a contagem animada. */
  value: number;
  /** Casas decimais exibidas. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export const manifestoFacts: readonly ManifestoFact[] = [
  { value: 27, label: "unidades federativas" },
  { value: 8.5, decimals: 1, suffix: " mi", label: "de km² de território" },
  { value: 203, suffix: " mi", label: "de brasileiros" },
  { value: 5, label: "regiões, um só país" },
];
