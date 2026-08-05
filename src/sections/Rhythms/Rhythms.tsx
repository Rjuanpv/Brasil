import { Fragment, useRef } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { rhythmRows, rhythmTopics } from "./rhythmRows";
import { useRhythmRows } from "./useRhythmRows";
import "./Rhythms.css";

/* Fora do componente: um literal no JSX seria recriado a cada render. */
const TITLE_LINES = ["O Brasil", "se move", "em ritmo."];

/** Losango — a referência à bandeira que o briefing permite, sem reproduzi-la. */
const SEPARATOR = "◆";

/**
 * 05 — RITMOS. "O BRASIL SE MOVE EM RITMO."
 *
 * Quatro faixas de gêneros atravessam a seção em velocidades e sentidos
 * diferentes, sobrepondo-se nas bordas. Cheias e vazadas alternam, e o
 * cruzamento entre elas é o que cria profundidade — não há imagem nenhuma aqui.
 *
 * Amarelo sobre preto, conforme a tabela de cores da direção de arte. Depois do
 * verde de Territórios, é o segundo corte duro da página, e o mais barulhento.
 */
export function Rhythms() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Entra pela esquerda — alterna com Territórios, logo acima. */
  useSectionReveal(sectionRef, "left");
  useRhythmRows(sectionRef);

  /*
    Cada faixa é feita de dois grupos idênticos. O primeiro é o conteúdo real e
    define a largura do ciclo; a cópia existe só para fechar o laço, e o leitor
    de tela a ignora.
  */
  const renderGroup = (row: (typeof rhythmRows)[number], duplicate: boolean) => (
    <div className="rhythms__group" aria-hidden={duplicate || undefined}>
      {row.words.map((word) => (
        <Fragment key={word}>
          <span className="rhythms__word">{word}</span>
          <span className="rhythms__separator" aria-hidden="true">
            {SEPARATOR}
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="rhythms"
      aria-labelledby="rhythms-title"
    >
      <SectionTitle id="rhythms-title" lines={TITLE_LINES} accentIndex={2} />

      <p className="rhythms__lead">
        Um gênero nasce num terreiro, num engenho, numa laje. Atravessa o país inteiro
        antes de ter nome, e quando chega ao mundo já virou outra coisa. Nenhum deles
        ficou parado onde começou.
      </p>

      <ul className="rhythms__topics label">
        {rhythmTopics.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>

      {/*
        `data-self-reveal` mantém as faixas fora da entrada da seção: elas já
        estão em movimento próprio, e deslocá-las mais 72px na chegada só
        embaralharia os dois movimentos.
      */}
      <div className="rhythms__rows" data-self-reveal>
        {rhythmRows.map((row) => (
          <div
            key={row.words[0]}
            className={`rhythms__row${row.outlined ? " rhythms__row--outlined" : ""}`}
            data-speed={row.speed}
            data-direction={row.direction}
          >
            <div className="rhythms__track">
              {renderGroup(row, false)}
              {renderGroup(row, true)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
