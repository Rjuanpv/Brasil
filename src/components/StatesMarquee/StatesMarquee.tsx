import { Fragment, useRef } from "react";
import type { RefObject } from "react";
import { SEPARATOR, brazilRegions } from "./states";
import { useStatesMarquee } from "./useStatesMarquee";
import styles from "./StatesMarquee.module.css";

/**
 * Faixa horizontal infinita com as 26 unidades federativas e o Distrito Federal.
 *
 * O laço vem de dois grupos idênticos: a trilha desliza exatamente a largura de
 * um grupo e reinicia, momento em que o segundo grupo está precisamente onde o
 * primeiro estava. O retorno é invisível por construção.
 */
export function StatesMarquee() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useStatesMarquee({ container: containerRef, track: trackRef, group: groupRef });

  /*
    Nome e separador são irmãos no mesmo flex, e não aninhados.

    Aninhado, o separador herdaria o `scale` do hover do nome e o espaçamento
    ficaria assimétrico — sobra de um lado, padding do outro. Lado a lado, um
    único `gap` dá o mesmo respiro em toda a faixa, inclusive na emenda entre os
    dois grupos.
  */
  const renderGroup = (ref?: RefObject<HTMLDivElement>, duplicate = false) => (
    <div ref={ref} className={styles.group} aria-hidden={duplicate || undefined}>
      {brazilRegions.map((region) => (
        <Fragment key={region}>
          <span className={styles.item}>{region}</span>
          <span className={styles.separator} aria-hidden="true">
            {SEPARATOR}
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <section ref={containerRef} className={styles.marquee} aria-label="Estados do Brasil">
      <div ref={trackRef} className={styles.track}>
        {/* O primeiro grupo é o conteúdo real e o que define a largura do ciclo. */}
        {renderGroup(groupRef)}

        {/* A cópia existe só para fechar o laço — o leitor de tela ignora. */}
        {renderGroup(undefined, true)}
      </div>
    </section>
  );
}
