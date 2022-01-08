import Engine from "../game-engine/Engine";
import random from "random";
import Stream from "./Stream";
import { createMaskFromImageSource } from "../image-processing/mask";
import { debounce } from "lodash";

const math$sqrt = Math.sqrt;
const math$pow = Math.pow;

const easeInOutCirc = (x) => {
  return x < 0.5
    ? (1 - math$sqrt(1 - math$pow(2 * x, 2))) / 2
    : (math$sqrt(1 - math$pow(-2 * x + 2, 2)) + 1) / 2;
};

export class DigitalRainAnimation extends Engine {
  constructor(canvas) {
    super(canvas);
    canvas.style.backgroundColor = "#000300";

    this.loadMask = debounce(this.loadMask, 100);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    super.destroy();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    const s = this.getGameState();

    // eslint-disable-next-line default-case
    switch (event.code) {
      case "Space": {
        s.isPaused = !s.isPaused;
        break;
      }

      case "ArrowDown": {
        s.isSlowMotion = !s.isSlowMotion;
        break;
      }
    }

    // eslint-disable-next-line default-case
    switch (event.key) {
      case "d": {
        s.isDebugEnabled = !s.isDebugEnabled;
        break;
      }

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        const key = parseInt(event.key, 10);
        const value = key === 0 ? 10 : key;
        s.density = value / 10;
        break;
      }
    }
  };

  onWindowResize() {
    const fontDefs = [
      [24, 22, 12],
      [18, 16, 9],
      [12, 11, 6]
    ];
    const [fontSize, glyphHeight, glyphWidth] = fontDefs[1];
    const gap = fontSize / 12;

    this.rows = Math.floor(this.height / (glyphHeight + gap));
    this.columns = Math.floor(this.width / (glyphWidth + gap));

    const contentHeight = this.rows * glyphHeight + (this.rows - 1) * gap;
    const contentWidth = this.columns * glyphWidth + (this.columns - 1) * gap;

    this.grid = {
      margin: {
        horizontal: Math.floor((this.width - contentWidth) / 2),
        vertical: Math.floor((this.height - contentHeight) / 2)
      },
      glyph: {
        fontSize,
        width: glyphWidth,
        height: glyphHeight,
        cellOffset: {
          horizontal: glyphWidth / 2,
          vertical: glyphHeight / 1.3
        },
        spacing: {
          horizontal: gap,
          vertical: gap
        }
      }
    };

    this.loadMask();
  }

  async loadMask() {
    const imageSource = "/assets/images/matrix/1.jpg";
    const g = this.grid;

    this.mask = await createMaskFromImageSource(
      imageSource,
      this.columns,
      this.rows,
      g.glyph.width,
      g.glyph.height,
      g.glyph.spacing.horizontal,
      g.glyph.spacing.vertical
    );
  }

  initialize() {
    super.initialize();

    const s = this.getGameState();
    s.isPaused = false;
    s.isSlowMotion = false;
    s.isDebugEnabled = false;
    s.slowMotionFactor = 5;
    s.density = 0.3;
    s.streams = [];
    s.maskMaxOpacity = 0;
    s.maskMaxOpacityProgress = 0;
    s.maskMaxOpacityDirection = 1;
    s.maskMaxOpacityDuration = 2000;
    s.maskMaxOpacityMinimum = 0.1;
    s.maskMaxOpacityMaxiumum = 0.8;
  }

  update(delta) {
    const s = this.getGameState();

    if (s.isPaused) {
      return;
    } else if (s.isSlowMotion) {
      delta = delta / s.slowMotionFactor;
    }

    super.update(delta);

    s.streams = s.streams.filter((s) => !s.shouldBeRemoved);

    const glyphWaitCount = 12 - 10 * s.density;

    if (
      Math.random() <=
      (0.05 + 0.8 * s.density) / (s.isSlowMotion ? s.slowMotionFactor : 1)
    ) {
      // Add a new stream.
      let column;
      let maxIterations = 100;
      let i = 0;
      let giveUp = false;

      do {
        column = random.int(0, this.columns - 1);
        i++;

        if (i > maxIterations) {
          giveUp = true;
        }
      } while (
        s.streams.find(
          (s) => s.column === column && s.glyphs.length < glyphWaitCount
        )
      );

      if (!giveUp) {
        s.streams.push(new Stream(this, column));
      }
    }

    s.streams.forEach((s) => s.update(delta, this));

    // s.maskMaxOpacityProgress +=
    //   (s.maskMaxOpacityDirection * delta) / s.maskMaxOpacityDuration;
    // s.maskMaxOpacity = easeInOutCirc(s.maskMaxOpacityProgress);

    // if (s.maskMaxOpacity >= s.maskMaxOpacityMaximum) {
    //   s.maskMaxOpacityProgress = 1;
    //   s.maskMaxOpacityDirection = -1;
    //   s.maskMaxOpacityDuration = 10000;
    //   s.maskMaxOpacity = easeInOutCirc(s.maskMaxOpacityProgress);
    // } else if (s.maskMaxOpacity <= s.maskMaxOpacityMinimum) {
    //   s.maskMaxOpacityProgress = 0;
    //   s.maskMaxOpacityDirection = 1;
    //   s.maskMaxOpacityDuration = 2000;
    //   s.maskMaxOpacity = easeInOutCirc(s.maskMaxOpacityProgress);
    // }

    // console.log(s.maskMaxOpacity);
  }

  // ctx.measureText
  render(ctx) {
    super.render(ctx);
    const s = this.getGameState();
    s.cellsRendered = new Set();
    const g = this.grid;

    // DEBUG: Render the grid.
    if (s.isDebugEnabled) {
      ctx.restore();
      const font = "matrix-code-nfi";
      ctx.font = `${g.glyph.fontSize}px ${font}`;

      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
          let x =
            g.margin.horizontal +
            col * (g.glyph.width + g.glyph.spacing.horizontal);
          let y =
            g.margin.vertical +
            row * (g.glyph.height + g.glyph.spacing.vertical);
          ctx.fillStyle = "rgba(50, 50, 50, 0.5)";
          ctx.fillRect(x, y, g.glyph.width, g.glyph.height);

          // let textY =
          //   g.margin.vertical +
          //   (row + 1) * (g.glyph.height + g.glyph.spacing.vertical);
          // ctx.fillStyle = "rgba(255, 255, 255, 1)";
          // ctx.fillText(
          //   "#",
          //   x + g.glyph.cellOffset.horizontal,
          //   textY + g.glyph.cellOffset.vertical
          // );
        }
      }
    }

    // Render the streams.
    for (let i = s.streams.length - 1; i >= 0; i--) {
      s.streams[i].render(ctx, this);
    }
  }
}

export default DigitalRainAnimation;
