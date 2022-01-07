import Engine from "../game-engine/Engine";
import random from "random";
import Stream from "./Stream";

export class DigitalRainAnimation extends Engine {
  constructor(canvas) {
    super(canvas);
    canvas.style.backgroundColor = "#000300";

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
    const gap = 2;
    const fontSize = 24;
    const glyphHeight = 22;
    const glyphWidth = 13;

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
        width: 13,
        height: 22,
        cellOffset: {
          horizontal: 0,
          vertical: fontSize / 1.3
        },
        spacing: {
          horizontal: gap,
          vertical: gap
        }
      }
    };
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
      (0.2 + 0.2 * s.density) / (s.isSlowMotion ? s.slowMotionFactor : 1)
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
