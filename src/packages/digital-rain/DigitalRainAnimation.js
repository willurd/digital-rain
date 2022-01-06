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
  };

  onWindowResize() {
    // TODO: These should be based on the canvas dimensions and the font size.
    this.rows = 24;
    this.columns = 53;
  }

  initialize() {
    super.initialize();

    const s = this.getGameState();
    s.isPaused = false;
    s.isSlowMotion = false;
    s.slowMotionFactor = 5;
    s.density = 0.7;
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

    const glyphWaitCount = 12 - 8 * this.density;

    if (Math.random() < 0.3 / (s.isSlowMotion ? s.slowMotionFactor : 1)) {
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

    for (let i = s.streams.length - 1; i >= 0; i--) {
      s.streams[i].render(ctx, this);
    }
  }
}

export default DigitalRainAnimation;
