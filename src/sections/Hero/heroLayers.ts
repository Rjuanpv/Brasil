/*
  Assets das camadas da Hero.

  Hoje apontam para os placeholders procedurais em src/assets/hero/. Para usar os
  exports do Canva, troque a extensão aqui — ver src/assets/hero/README.md.
  Nenhum outro arquivo precisa mudar.
*/

import background from "@/assets/hero/hero-background.svg";
import shapeBlue from "@/assets/hero/hero-shape-blue.svg";
import main from "@/assets/hero/hero-main.svg";
import shapeYellow from "@/assets/hero/hero-shape-yellow.svg";
import texture from "@/assets/hero/hero-texture.svg";

export const heroLayers = {
  background,
  shapeBlue,
  main,
  shapeYellow,
  texture,
} as const;
