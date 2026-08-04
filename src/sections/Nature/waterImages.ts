/*
  Imagens do rastro da Natureza — mar, praias e rios.

  Fotografias do Wikimedia Commons, sob licença livre. Autor, licença e link do
  original de cada uma estão em src/assets/water/CREDITS.md — todas são CC BY ou
  CC BY-SA, ou seja, a atribuição é obrigatória e não pode sair do repositório.

  A ordem alterna assunto de propósito: praia, rio, praia, rio. O rastro troca de
  imagem a cada 80px percorridos, e imagens parecidas em sequência leem como uma
  só repetida — alternando, o revezamento demora mais a se denunciar.

  Dez arquivos, ~700px de largura cada, exibidos a ~220px. A folga serve às telas
  de alta densidade; passar disso só pesaria o download sem aparecer.
*/
import gunga from "@/assets/water/water-praia-gunga.jpg";
import amazonas from "@/assets/water/water-rio-amazonas.jpg";
import taipu from "@/assets/water/water-taipu-de-fora.jpg";
import calmaria from "@/assets/water/water-calmaria.jpg";
import bombinhas from "@/assets/water/water-bombinhas.jpg";
import pauloAfonso from "@/assets/water/water-paulo-afonso.jpg";
import caravelas from "@/assets/water/water-caravelas.jpg";
import afluente from "@/assets/water/water-afluente.jpg";
import cumuru from "@/assets/water/water-cumuru.jpg";
import guardaDoEmbau from "@/assets/water/water-guarda-do-embau.jpg";

export const waterImages: readonly string[] = [
  gunga,
  amazonas,
  taipu,
  calmaria,
  bombinhas,
  pauloAfonso,
  caravelas,
  afluente,
  cumuru,
  /* Fecha o ciclo onde o rio encontra o mar — os dois assuntos na mesma foto. */
  guardaDoEmbau,
];
