import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/*
  Movimento das faixas de ritmos.

  O laço é o mesmo da faixa de estados: dois grupos idênticos, deslocamento
  exatamente igual à largura de um grupo, retorno invisível por construção.

  O que muda aqui é a resposta ao scroll. As faixas correm sozinhas em repouso e
  ACELERAM conforme a página se move — quem rola rápido faz a seção acelerar
  junto. É a leitura literal de "o Brasil se move em ritmo": o ritmo responde a
  quem está lá, e não a um relógio fixo.
*/

/** Teto da aceleração. Acima disso os nomes viram borrão e param de ser lidos. */
const MAX_TIME_SCALE = 4.5;

/**
 * Divisor da velocidade do scroll (px/s) para chegar ao acréscimo de timeScale.
 * Uma rolagem confortável gira em torno de 1500 px/s, o que dá ~2× aqui.
 */
const VELOCITY_DIVISOR = 1400;

/** Silêncio, em ms, a partir do qual o scroll é considerado parado. */
const IDLE_DELAY = 140;

interface Row {
  /** Primeiro grupo — é dele que sai a largura do ciclo. */
  group: HTMLElement;
  animation: gsap.core.Tween;
  build: () => void;
}

/**
 * Anima todas as faixas dentro de `section`.
 *
 * As faixas são encontradas pelo DOM, e não por um array de refs: são quatro
 * elementos irmãos com a mesma estrutura, e um `ref` por linha exigiria um array
 * de refs mutável que o React não reconcilia bem quando a lista muda.
 * Os parâmetros de cada linha viajam em data-attributes, como o índice dos
 * números do Manifesto.
 */
export function useRhythmRows(section: RefObject<HTMLElement>) {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const element = section.current;
    if (!element) return;

    /*
      O estado parado é anunciado no DOM, e não deduzido por media query — a
      regra CSS não enxerga o override de `?motion=full`, e os dois lados
      passariam a discordar sobre o mesmo efeito.
    */
    element.dataset.static = String(reducedMotion);
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const rows: Row[] = [];
      let idleTimer = 0;
      /*
        As faixas só podem ser construídas depois que a fonte carrega, e essa
        espera pode terminar já sem o componente em cena. As animações criadas aí
        nasceriam fora do gsap.context — que só registra o que é criado no seu
        escopo síncrono — e sobreviveriam ao revert.
      */
      let cancelled = false;

      gsap.utils.toArray<HTMLElement>(".rhythms__row").forEach((row) => {
        const track = row.querySelector<HTMLElement>(".rhythms__track");
        const group = row.querySelector<HTMLElement>(".rhythms__group");
        if (!track || !group) return;

        const speed = Number(row.dataset.speed) || 60;
        const direction = Number(row.dataset.direction) === -1 ? -1 : 1;

        /*
          A animação nasce como um tween nulo sobre a própria trilha: assim
          `entry.animation` nunca é nulo, e `build` pode ler progresso e
          timeScale do que existia antes sem checar por indefinido a cada vez.
        */
        const entry: Row = {
          group,
          animation: gsap.to(track, { duration: 0 }),
          build: () => {},
        };

        entry.build = () => {
          const width = group.getBoundingClientRect().width;
          if (width <= 0) return;

          /*
            A duração sai da largura real. Com duração fixa, uma tela larga faria
            a faixa correr muito mais rápido que uma estreita, porque o mesmo
            tempo cobriria mais pixels.
          */
          const duration = width / speed;

          // Preserva o ponto do ciclo: um resize não pode teletransportar a
          // faixa de volta ao começo.
          const progress = entry.animation.progress();
          const timeScale = entry.animation.timeScale();
          entry.animation.kill();

          entry.animation = gsap.fromTo(
            track,
            { x: direction === 1 ? 0 : -width },
            {
              x: direction === 1 ? -width : 0,
              duration,
              ease: "none",
              repeat: -1,
            },
          );

          entry.animation.progress(progress);
          entry.animation.timeScale(timeScale);
        };

        rows.push(entry);
      });

      if (rows.length === 0) return;

      const buildAll = () => {
        if (cancelled) return;
        rows.forEach((row) => row.build());
      };

      /*
        A largura depende da métrica do Anton. Medir antes de a fonte carregar
        daria a largura do fallback: velocidade errada e uma fresta na emenda.
      */
      if (document.fonts?.status === "loaded") {
        buildAll();
      } else {
        document.fonts.ready.then(buildAll);
      }

      const resize = new ResizeObserver(buildAll);
      rows.forEach((row) => resize.observe(row.group));

      /*
        Ao parar de rolar, as faixas VOLTAM à velocidade de repouso interpolando,
        e não de um frame para o outro: a desaceleração é o que mantém a
        sensação de inércia que o motion system pede.
      */
      const relax = () => {
        rows.forEach(({ animation }) => {
          gsap.to(animation, {
            timeScale: 1,
            duration: 0.9,
            ease: "power2.out",
            overwrite: true,
          });
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(
            1,
            MAX_TIME_SCALE,
            1 + Math.abs(self.getVelocity()) / VELOCITY_DIVISOR,
          );

          /*
            Atribuição direta, sem tween: o acréscimo precisa acompanhar o dedo
            no mesmo frame. Criar um tween por frame de scroll seria caro e
            chegaria atrasado. A interpolação existe só na volta ao repouso.
          */
          rows.forEach(({ animation }) => {
            gsap.killTweensOf(animation);
            animation.timeScale(boost);
          });

          window.clearTimeout(idleTimer);
          idleTimer = window.setTimeout(relax, IDLE_DELAY);
        },
      });

      return () => {
        cancelled = true;
        window.clearTimeout(idleTimer);
        resize.disconnect();
        trigger.kill();
        rows.forEach(({ animation }) => {
          gsap.killTweensOf(animation);
          animation.kill();
        });
      };
    }, element);

    return () => ctx.revert();
  }, [section, reducedMotion]);
}
