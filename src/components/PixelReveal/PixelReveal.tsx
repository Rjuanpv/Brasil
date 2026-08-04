import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./PixelReveal.css";

/*
  Revelação por blocos.

  A imagem é dividida numa grade e os blocos acendem em ordem embaralhada até
  completá-la. Cada bloco desenha o pedaço correspondente da imagem — não é um
  fade nem um recorte, é a imagem se montando aos pedaços.

  Canvas e não CSS: seriam centenas de elementos com máscara própria, e o
  navegador teria de compor todos a cada frame. Num canvas é uma superfície só,
  e o custo por frame é uma sequência de drawImage sobre blocos que já estão
  calculados.
*/

/** Lado do bloco em pixels de layout. Menor = mais fino e mais caro. */
const BLOCK_SIZE = 26;

/** Acima de 2 o custo cresce sem ganho visível. */
const MAX_PIXEL_RATIO = 2;

const DURATION = {
  reveal: 0.55,
  hide: 0.35,
} as const;

interface PixelRevealProps {
  /** Imagem a revelar. `null` esconde o que estiver visível. */
  src: string | null;
  /** Todas as imagens possíveis, pré-carregadas para a troca ser instantânea. */
  sources: readonly string[];
  className?: string;
}

/** Embaralhamento in-place (Fisher–Yates). */
function shuffle(values: number[]): number[] {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export function PixelReveal({ src, sources, className }: PixelRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef(new Map<string, HTMLImageElement>());
  const reducedMotion = useReducedMotion();

  /* Pré-carrega tudo: trocar de região não pode esperar rede. */
  useEffect(() => {
    sources.forEach((source) => {
      if (imagesRef.current.has(source)) return;
      const image = new Image();
      image.src = source;
      imagesRef.current.set(source, image);
    });
  }, [sources]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

    /*
      A grade é recalculada quando o painel muda de tamanho. Guardá-la evita
      refazer a divisão e o embaralhamento a cada frame.
    */
    let columns = 0;
    let rows = 0;
    let order: number[] = [];
    let blockWidth = 0;
    let blockHeight = 0;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;

      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);

      columns = Math.max(1, Math.ceil(rect.width / BLOCK_SIZE));
      rows = Math.max(1, Math.ceil(rect.height / BLOCK_SIZE));
      blockWidth = canvas.width / columns;
      blockHeight = canvas.height / rows;

      return true;
    };

    /** Enquadra a imagem cobrindo o painel, preservando a proporção. */
    const coverSource = (image: HTMLImageElement) => {
      const iw = image.naturalWidth || 1;
      const ih = image.naturalHeight || 1;
      const scale = Math.max(canvas.width / iw, canvas.height / ih);
      const sw = canvas.width / scale;
      const sh = canvas.height / scale;
      return { sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw, sh };
    };

    const progress = { value: 0 };
    let current: HTMLImageElement | null = null;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (!current || !current.complete || order.length === 0) return;

      const { sx, sy, sw, sh } = coverSource(current);
      const visible = Math.round(order.length * progress.value);

      for (let i = 0; i < visible; i++) {
        const cell = order[i];
        const cx = (cell % columns) * blockWidth;
        const cy = Math.floor(cell / columns) * blockHeight;

        // Mapeia o bloco de destino de volta para a região correspondente da
        // imagem, para cada pedaço mostrar o trecho certo.
        context.drawImage(
          current,
          sx + (cx / canvas.width) * sw,
          sy + (cy / canvas.height) * sh,
          (blockWidth / canvas.width) * sw,
          (blockHeight / canvas.height) * sh,
          Math.floor(cx),
          Math.floor(cy),
          Math.ceil(blockWidth),
          Math.ceil(blockHeight),
        );
      }
    };

    if (!layout()) return;

    const observer = new ResizeObserver(() => {
      if (layout()) draw();
    });
    observer.observe(canvas);

    /*
      Ordem nova a cada revelação: com uma ordem fixa, todas as regiões se
      montariam exatamente com o mesmo desenho, e a repetição ficaria evidente.
    */
    const nextImage = src ? (imagesRef.current.get(src) ?? null) : null;

    if (nextImage) {
      current = nextImage;
      order = shuffle([...Array(columns * rows).keys()]);
    }

    if (reducedMotion) {
      // Sem dissolução: a imagem aparece inteira ou não aparece.
      progress.value = nextImage ? 1 : 0;
      draw();
      return () => observer.disconnect();
    }

    const tween = gsap.to(progress, {
      value: nextImage ? 1 : 0,
      duration: nextImage ? DURATION.reveal : DURATION.hide,
      ease: "none",
      onUpdate: draw,
      onComplete: draw,
    });

    return () => {
      tween.kill();
      observer.disconnect();
    };
  }, [src, reducedMotion]);

  return <canvas ref={canvasRef} className={`pixel-reveal ${className ?? ""}`} aria-hidden="true" />;
}
