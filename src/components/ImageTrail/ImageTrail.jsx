import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import './ImageTrail.css';

/*
  Rastro de imagens que segue o ponteiro.
  Origem: React Bits (https://reactbits.dev) — ImageTrail.

  Cinco desvios do original, todos comentados no ponto onde acontecem:

  1. Nomes de classe com prefixo próprio — ver ImageTrail.css.

  2. Ciclo de vida. O original instancia a classe num useEffect sem retorno:
     nenhum listener é removido, o requestAnimationFrame nunca é cancelado e o
     `resize` de cada imagem fica pendurado no window para sempre. Em React
     StrictMode isso vira dois laços de rAF simultâneos já na montagem, e ao
     desmontar a seção o laço continua rodando contra elementos que saíram do
     DOM. Aqui existe `destroy()`, e o useEffect o chama.

  3. Superfície de ponteiro separada do contêiner. O original escuta no próprio
     elemento das imagens, o que obriga esse elemento a receber eventos — e
     portanto a ficar por cima do conteúdo. Como aqui o rastro passa ATRÁS do
     texto, quem escuta é uma superfície informada por fora (a seção inteira),
     enquanto a geometria continua saindo do contêiner das imagens.

  4. O laço só roda com o ponteiro dentro da superfície. O original liga o rAF no
     primeiro movimento e nunca mais o desliga, custando um frame de trabalho por
     frame de tela pelo resto da sessão, mesmo com o rastro parado e fora de vista.

  5. Máquina compartilhada numa classe base. As oito variantes do original
     repetem o mesmo construtor e o mesmo `render` — oito cópias que só divergem
     em dois parâmetros. O que de fato muda entre elas, `showNextImage`, está
     preservado palavra por palavra em cada subclasse.
*/

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e, rect) {
  let clientX = 0,
    clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function getMouseDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

function getNewPosition(position, offset, arr) {
  const realOffset = Math.abs(offset) % arr.length;
  if (position - realOffset >= 0) {
    return position - realOffset;
  } else {
    return arr.length - (realOffset - position);
  }
}

class ImageItem {
  DOM = { el: null, inner: null };
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
  rect = null;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector('.image-trail__inner');
    this.getRect();
    this.initEvents();
  }

  initEvents() {
    this.resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener('resize', this.resize);
  }

  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }

  /* DESVIO 2 — o original nunca remove este listener. */
  destroy() {
    window.removeEventListener('resize', this.resize);
    gsap.killTweensOf(this.DOM.el);
  }
}

/**
 * DESVIO 5 — máquina compartilhada.
 *
 * Só duas coisas variam no laço entre as oito variantes do original:
 * a suavização do ponteiro e se a distância é checada antes ou depois dela.
 * Ambas viram campos, e o resto é idêntico.
 */
class ImageTrailBase {
  /** Distância mínima, em px, entre uma imagem e a seguinte. */
  threshold = 80;
  /** Suavização da posição do ponteiro a cada frame. */
  lerpAmount = 0.1;
  /** Variantes 4 e 5 disparam a imagem ANTES de suavizar. */
  checkBeforeLerp = false;

  constructor(container, surface) {
    this.container = container;
    /* DESVIO 3 — quem escuta pode não ser o contêiner das imagens. */
    this.surface = surface || container;

    this.DOM = { el: container };
    this.images = [...container.querySelectorAll('.image-trail__img')].map(
      img => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;

    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    this.frame = 0;
    this.running = false;
    this.destroyed = false;

    this.onPointerMove = ev => {
      /*
        A geometria sai do CONTÊINER, não da superfície que escuta. As duas
        coincidem quando o rastro cobre a seção inteira, mas manter a distinção
        é o que permite ao contêiner ser menor que a área sensível ao mouse.
      */
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      if (!this.running) this.start();
    };

    this.onPointerLeave = () => this.stop();

    this.start = () => {
      if (this.running || this.destroyed) return;
      this.cacheMousePos = { ...this.mousePos };
      /*
        `lastMousePos` também parte da posição atual, e o original o deixa em
        (0,0). Sem isto, a primeira leitura mede a distância até o canto superior
        esquerdo — quase sempre acima do limiar — e uma imagem nasce sozinha no
        instante em que o ponteiro entra, sem que ninguém tenha percorrido nada.
      */
      this.lastMousePos = { ...this.mousePos };
      this.running = true;
      this.frame = requestAnimationFrame(this.render);
    };

    this.stop = () => {
      this.running = false;
      cancelAnimationFrame(this.frame);
    };

    this.render = () => {
      if (!this.running) return;

      const distance = getMouseDistance(this.mousePos, this.lastMousePos);

      if (this.checkBeforeLerp && distance > this.threshold) {
        this.showNextImage();
        this.lastMousePos = { ...this.mousePos };
      }

      this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, this.lerpAmount);
      this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, this.lerpAmount);

      if (!this.checkBeforeLerp && distance > this.threshold) {
        this.showNextImage();
        this.lastMousePos = { ...this.mousePos };
      }

      if (this.isIdle && this.zIndexVal !== 1) {
        this.zIndexVal = 1;
      }

      this.frame = requestAnimationFrame(this.render);
    };

    this.surface.addEventListener('mousemove', this.onPointerMove);
    this.surface.addEventListener('touchmove', this.onPointerMove);
    this.surface.addEventListener('mouseleave', this.onPointerLeave);
    this.surface.addEventListener('touchend', this.onPointerLeave);
  }

  /** Sobrescrito por cada variante — é a única coisa que de fato as diferencia. */
  showNextImage() {}

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }

  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }

  /** DESVIO 2 — não existe no original. */
  destroy() {
    this.destroyed = true;
    this.stop();
    this.surface.removeEventListener('mousemove', this.onPointerMove);
    this.surface.removeEventListener('touchmove', this.onPointerMove);
    this.surface.removeEventListener('mouseleave', this.onPointerLeave);
    this.surface.removeEventListener('touchend', this.onPointerLeave);
    this.images.forEach(img => img.destroy());
  }
}

class ImageTrailVariant1 extends ImageTrailBase {
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3',
          opacity: 0,
          scale: 0.2
        },
        0.4
      );
  }
}

class ImageTrailVariant2 extends ImageTrailBase {
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2.8,
          filter: 'brightness(250%)'
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          filter: 'brightness(100%)'
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power2',
          opacity: 0,
          scale: 0.2
        },
        0.45
      );
  }
}

class ImageTrailVariant3 extends ImageTrailBase {
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          xPercent: 0,
          yPercent: 0,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 1.2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.6,
          ease: 'power2',
          opacity: 0,
          scale: 0.2,
          xPercent: () => gsap.utils.random(-30, 30),
          yPercent: -200
        },
        0.6
      );
  }
}

class ImageTrailVariant4 extends ImageTrailBase {
  checkBeforeLerp = true;

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }
    dx *= distance / 100;
    dy *= distance / 100;

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2,
          filter: `brightness(${Math.max((400 * distance) / 100, 100)}%) contrast(${Math.max((400 * distance) / 100, 100)}%)`
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          filter: 'brightness(100%) contrast(100%)'
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3',
          opacity: 0
        },
        0.4
      )
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: 'power4',
          x: `+=${dx * 110}`,
          y: `+=${dy * 110}`
        },
        0.05
      );
  }
}

class ImageTrailVariant5 extends ImageTrailBase {
  checkBeforeLerp = true;
  lastAngle = 0;

  showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    if (angle > 90 && angle <= 270) angle += 180;
    const isMovingClockwise = angle >= this.lastAngle;
    this.lastAngle = angle;
    let startAngle = isMovingClockwise ? angle - 10 : angle + 10;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }
    dx *= distance / 150;
    dy *= distance / 150;

    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          filter: 'brightness(80%)',
          scale: 0.1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
          rotation: startAngle
        },
        {
          duration: 1,
          ease: 'power2',
          scale: 1,
          filter: 'brightness(100%)',
          x: this.mousePos.x - img.rect.width / 2 + dx * 70,
          y: this.mousePos.y - img.rect.height / 2 + dy * 70,
          rotation: this.lastAngle
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'expo',
          opacity: 0
        },
        0.5
      )
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: 'power4',
          x: `+=${dx * 120}`,
          y: `+=${dy * 120}`
        },
        0.05
      );
  }
}

class ImageTrailVariant6 extends ImageTrailBase {
  lerpAmount = 0.3;

  mapSpeedToSize(speed, minSize, maxSize) {
    const maxSpeed = 200;
    return minSize + (maxSize - minSize) * Math.min(speed / maxSpeed, 1);
  }
  mapSpeedToBrightness(speed, minB, maxB) {
    const maxSpeed = 70;
    return minB + (maxB - minB) * Math.min(speed / maxSpeed, 1);
  }
  mapSpeedToBlur(speed, minBlur, maxBlur) {
    const maxSpeed = 90;
    return minBlur + (maxBlur - minBlur) * Math.min(speed / maxSpeed, 1);
  }
  mapSpeedToGrayscale(speed, minG, maxG) {
    const maxSpeed = 90;
    return minG + (maxG - minG) * Math.min(speed / maxSpeed, 1);
  }

  showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let speed = Math.sqrt(dx * dx + dy * dy);

    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    let scaleFactor = this.mapSpeedToSize(speed, 0.3, 2);
    let brightnessValue = this.mapSpeedToBrightness(speed, 0, 1.3);
    let blurValue = this.mapSpeedToBlur(speed, 20, 0);
    let grayscaleValue = this.mapSpeedToGrayscale(speed, 600, 0);

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.8,
          ease: 'power3',
          scale: scaleFactor,
          filter: `grayscale(${grayscaleValue * 100}%) brightness(${brightnessValue * 100}%) blur(${blurValue}px)`,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2
        },
        {
          duration: 0.8,
          ease: 'power3',
          scale: 1
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3.in',
          opacity: 0,
          scale: 0.2
        },
        0.45
      );
  }
}

class ImageTrailVariant7 extends ImageTrailBase {
  lerpAmount = 0.3;
  visibleImagesCount = 0;
  visibleImagesTotal = 9;

  constructor(container, surface) {
    super(container, surface);
    this.visibleImagesTotal = Math.min(this.visibleImagesTotal, this.imagesTotal - 1);
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    ++this.visibleImagesCount;

    gsap.killTweensOf(img.DOM.el);
    const scaleValue = gsap.utils.random(0.5, 1.6);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          scale: scaleValue - Math.max(gsap.utils.random(0.2, 0.6), 0),
          rotationZ: 0,
          opacity: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: 'power3',
          scale: scaleValue,
          rotationZ: gsap.utils.random(-3, 3),
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      );

    if (this.visibleImagesCount >= this.visibleImagesTotal) {
      const lastInQueue = getNewPosition(this.imgPosition, this.visibleImagesTotal, this.images);
      const oldImg = this.images[lastInQueue];
      gsap.to(oldImg.DOM.el, {
        duration: 0.4,
        ease: 'power4',
        opacity: 0,
        scale: 1.3,
        onComplete: () => {
          if (this.activeImagesCount === 0) {
            this.isIdle = true;
          }
        }
      });
    }
  }

  /* A variante 7 devolve o repouso no fim da imagem que SAI, não da que entra. */
  onImageDeactivated() {
    this.activeImagesCount--;
  }
}

class ImageTrailVariant8 extends ImageTrailBase {
  rotation = { x: 0, y: 0 };
  cachedRotation = { x: 0, y: 0 };
  zValue = 0;
  cachedZValue = 0;

  showNextImage() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relX = this.mousePos.x - centerX;
    const relY = this.mousePos.y - centerY;

    this.rotation.x = -(relY / centerY) * 30;
    this.rotation.y = (relX / centerX) * 30;
    this.cachedRotation = { ...this.rotation };

    const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const proportion = distanceFromCenter / maxDistance;
    this.zValue = proportion * 1200 - 600;
    this.cachedZValue = this.zValue;
    const normalizedZ = (this.zValue + 600) / 1200;
    const brightness = 0.2 + normalizedZ * 2.3;

    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .set(this.DOM.el, { perspective: 1000 }, 0)
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          z: 0,
          scale: 1 + this.cachedZValue / 1000,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
          rotationX: this.cachedRotation.x,
          rotationY: this.cachedRotation.y,
          filter: `brightness(${brightness})`
        },
        {
          duration: 1,
          ease: 'expo',
          scale: 1 + this.zValue / 1000,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
          rotationX: this.rotation.x,
          rotationY: this.rotation.y
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power2',
          opacity: 0,
          z: -800
        },
        0.3
      );
  }
}

const variantMap = {
  1: ImageTrailVariant1,
  2: ImageTrailVariant2,
  3: ImageTrailVariant3,
  4: ImageTrailVariant4,
  5: ImageTrailVariant5,
  6: ImageTrailVariant6,
  7: ImageTrailVariant7,
  8: ImageTrailVariant8
};

export default function ImageTrail({ items = [], variant = 1, surfaceRef = null }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (items.length === 0) return;

    /*
      A superfície chega como REF, e não como elemento.

      Um elemento passado por prop seria `null` na primeira renderização de quem
      usa — o efeito rodaria com a superfície vazia, cairia no contêiner (que não
      recebe ponteiro) e o rastro nunca ligaria. O ref já está preenchido quando
      este efeito roda, porque efeitos de filho correm depois do commit do pai.
    */
    const Cls = variantMap[variant] || variantMap[1];
    const instance = new Cls(container, surfaceRef?.current ?? null);

    /* DESVIO 2 — o original não devolve limpeza nenhuma daqui. */
    return () => instance.destroy();
  }, [variant, items, surfaceRef]);

  return (
    <div className="image-trail" ref={containerRef} aria-hidden="true">
      {items.map((url, i) => (
        <div className="image-trail__img" key={url ?? i}>
          <div className="image-trail__inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}
