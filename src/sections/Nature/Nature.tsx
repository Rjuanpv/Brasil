import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import ImageTrail from "@/components/ImageTrail/ImageTrail";
import { playOnEnter } from "@/animations/playOnEnter";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { duration, easing } from "@/lib/motion";
import { biomes } from "./biomes";
import { waterImages } from "./waterImages";
import "./Nature.css";

/* Fora do componente: um literal no JSX seria recriado a cada render. */
const TITLE_LINES = ["Onde a vida", "não para."];

/** Altura da linha da maré, em fração da viewport contada do topo. */
const TIDE_LINE = 0.55;

interface NatureProps {
  /**
   * Avisa que a maré subiu — o fundo fixo da página passa de verde a azul.
   * O gatilho mora aqui, e não no componente do fundo, porque é esta seção que
   * sabe em que ponto da narrativa a água chega.
   */
  onTide: (risen: boolean) => void;
  /**
   * A maré está alta agora. Volta do App em vez de virar estado local: a seção
   * DECIDE quando a água chega, mas quem a guarda é o App, e duplicar o valor
   * aqui criaria duas fontes de verdade para a mesma coisa.
   */
  tideRisen: boolean;
}

/**
 * 06 — NATUREZA. "ONDE A VIDA NÃO PARA."
 *
 * A seção não tem fundo próprio: ela é transparente, e o que aparece atrás é o
 * verde do fundo fixo da página. É por isso que a virada de cor acontece aqui —
 * a água sobe atrás do texto, e a leitura continua sobre azul.
 *
 * Verde + creme, conforme a direção de arte. O destaque do título é creme, não
 * amarelo: o amarelo é da energia de Ritmos, e o briefing pede que ele não seja
 * usado em excesso.
 */
export function Nature({ onTide, tideRisen }: NatureProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const tideRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouch();

  /*
    O rastro só existe com a MARÉ ALTA — ou seja, só enquanto o chão da página é
    o mar. É o mesmo estado que pinta o fundo de azul, e não uma condição
    paralela: assim as imagens de água não têm como aparecer sobre o verde, nem
    aqui em cima nem se a pessoa subir a página e a maré baixar.

    As outras duas condições são as de sempre: o rastro é resposta ao ponteiro,
    então sem ponteiro não existe, e sob movimento reduzido seria justamente o
    tipo de movimento automático que a preferência pede para não acontecer.
  */
  const trailEnabled = tideRisen && !isTouch && !reducedMotion;

  /* Sobe — as duas seções anteriores entraram pelos lados. */
  useSectionReveal(sectionRef, "up");

  useLayoutEffect(() => {
    const marker = tideRef.current;
    if (!marker) return;

    /*
      A maré sobe quando o marcador cruza a linha e continua alta enquanto ele
      estiver ACIMA dela — não basta "entrou na tela", porque o usuário segue
      descendo e o marcador sai por cima. Só a volta ao topo devolve o verde, e
      devolve de propósito: o briefing pede transições orgânicas, e maré que não
      baixa é parede.

      A decisão é lida da posição do marcador a cada transição, e não do
      `isIntersecting`: as duas saídas do recorte — por cima e por baixo —
      significam coisas opostas, e só a coordenada as distingue.

      IntersectionObserver, e não ScrollTrigger, pelo mesmo motivo das
      revelações: nenhuma posição fica guardada contra uma altura de documento
      que muda depois da montagem. Ver animations/playOnEnter.ts.
    */
    const observer = new IntersectionObserver(
      ([entry]) => {
        onTide(entry.boundingClientRect.top <= window.innerHeight * TIDE_LINE);
      },
      { rootMargin: `0px 0px -${Math.round((1 - TIDE_LINE) * 100)}% 0px`, threshold: 0 },
    );

    observer.observe(marker);

    return () => {
      observer.disconnect();
      /* Desmontou com maré alta: devolve o fundo antes de sair de cena. */
      onTide(false);
    };
  }, [onTide]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /*
      Sob redução de movimento os biomas ficam visíveis, sem recorte. O
      `clip-path` inicial vive no CSS para nada piscar antes do GSAP; aqui ele é
      simplesmente removido.
    */
    if (reducedMotion) {
      gsap.set(section.querySelectorAll(".nature__biome"), { clipPath: "none" });
      return;
    }

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".nature__biome");

      /*
        O bioma nasce com o recorte fechado (o estado inicial vive no CSS, para
        nada piscar) e só aparece quando a revelação roda — então o gatilho não
        pode falhar em silêncio. IntersectionObserver, e não ScrollTrigger, pelo
        mesmo motivo de todas as outras revelações: ver animations/playOnEnter.ts.
      */
      const stop = playOnEnter(
        rows,
        (row) => {
          /*
            A revelação é um recorte que abre da esquerda para a direita com as
            pontas arredondadas — o raio é CONSTANTE nos dois estados, e só os
            quatro números do inset variam.

            Isso não é detalhe de estilo: interpolar `round` junto faria o GSAP
            comparar dois valores de estrutura diferente e trocar o recorte de
            uma vez, sem percurso. Com o raio fixo, a borda que avança é curva o
            tempo todo — a transição orgânica que o briefing pede.
          */
          gsap.fromTo(
            row,
            { clipPath: "inset(0% 100% 0% 0% round 40px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 40px)",
              duration: duration.cinematic,
              ease: easing.dramatic,
            },
          );
        },
        { line: 0.88 },
      );

      return stop;
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="nature"
      aria-labelledby="nature-title"
    >
      {/*
        Rastro de água que segue o ponteiro pela seção inteira.

        Fica ATRÁS do texto e não recebe eventos: quem escuta o mouse é a própria
        seção, informada como superfície. É por isso que as imagens aparecem
        também no vazio à esquerda, onde não há conteúdo nenhum para apontar.

        `data-self-reveal` o mantém fora da entrada da seção — é uma camada de
        fundo, e deslocá-la 72px na chegada tiraria as imagens do lugar em que o
        ponteiro as deixou.

        Variante 3: as imagens surgem, sobem e se dispersam, em vez de apenas
        sumirem no lugar. Numa seção cujo assunto é água, subir lê como algo
        atravessando a superfície. Trocar o número muda o estilo inteiro.
      */}
      {trailEnabled && (
        <div className="nature__trail" data-self-reveal>
          <ImageTrail items={waterImages} variant={3} surfaceRef={sectionRef} />
        </div>
      )}

      <SectionTitle id="nature-title" lines={TITLE_LINES} accentIndex={1} />

      <p className="nature__lead">
        Seis biomas dividem o mesmo país e não se parecem em nada. Um seca e volta a
        florescer em dois dias; outro alaga todo ano e conta com isso. A vida aqui não
        se conserva parada — ela se refaz.
      </p>

      {/*
        `data-self-reveal`: cada bioma tem o próprio recorte disparado por
        scroll, e animá-los dentro de um contêiner ainda invisível esconderia
        justamente esse movimento.
      */}
      <ol className="nature__biomes" data-self-reveal>
        {biomes.map((biome) => (
          <li key={biome.name} className="nature__biome">
            <span className="nature__share display" aria-hidden="true">
              {biome.share.toFixed(1).replace(".", ",")}
              <span className="nature__percent">%</span>
            </span>

            <span className="nature__biome-body">
              <span className="nature__name display">{biome.name}</span>
              <span className="nature__note">{biome.note}</span>
            </span>

            <span className="visually-hidden">
              {biome.share.toFixed(1).replace(".", ",")}% do território brasileiro
            </span>
          </li>
        ))}
      </ol>

      <p className="nature__source label">Participação no território — IBGE, mapa de biomas</p>

      {/*
        A virada. O bloco fala de água, e é ele que faz a água chegar: quando
        cruza a linha da maré, o fundo verde da página inteira vira azul e assim
        permanece até o preto de Futuro.

        `data-self-reveal` o mantém fora da entrada da seção — e aqui não é por
        causa de uma animação própria, e sim da MEDIÇÃO: a entrada deslocaria o
        bloco 72px, e o ScrollTrigger, que lê a posição já transformada no
        momento em que é criado, calcularia a linha da maré 72px fora do lugar.
      */}
      <div ref={tideRef} className="nature__tide" data-self-reveal>
        <p className="nature__tide-figure display">7.367 km</p>
        <p className="nature__tide-text">
          de costa. A água chega antes de qualquer cidade, e é por ela que tudo o que
          veio depois chegou. Daqui em diante, o chão desta página é o mar.
        </p>
      </div>
    </section>
  );
}
