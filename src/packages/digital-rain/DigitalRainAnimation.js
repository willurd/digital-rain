import Engine from "../game-engine/Engine";
import Entity from "../game-engine/Entity";
import random from "random";

const CHARS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
  "~!#$%^&*()+-_=[]{}'\";:,.<>/?\\|"
]
  .join("")
  .split("");

const choose = (arr) => arr[random.int(0, arr.length - 1)];

class Stream extends Entity {
  constructor(game, column) {
    super();
    this.column = column;
    this.glyphs = [];
    this.newGlyphsPerSecond = 10;
    this.timeBetweenGlyphs = 1000 / this.newGlyphsPerSecond;
    this.startingRow = 0;
    this.maxStartingRow = game.rows + 1;
    this.timeUntilNextGlyph = 0;
    this.fadeDuration = random.int(5, 8);
    // TODO: This should be based on the max rows of the screen.
    this.length = random.int(14, 19);
  }

  update(delta, game) {
    super.update(delta, game);

    this.timeUntilNextGlyph -= delta;

    if (this.timeUntilNextGlyph <= 0) {
      this.timeUntilNextGlyph = this.timeBetweenGlyphs;
      const newGlyph = choose(CHARS);
      this.glyphs.push(newGlyph);

      if (this.glyphs.length > this.length) {
        this.glyphs.shift();
        this.startingRow++;

        if (this.startingRow > this.maxStartingRow) {
          this.markForRemoval();
        }
      }
    }
  }

  render(ctx, game) {
    super.render(ctx, game);
    const s = game.getGameState();

    // glyphs fade to 0 opacity over time
    const fontSize = 24;
    const font = "matrix-code-nfi";
    ctx.font = `${fontSize}px ${font}`;
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 14;

    for (let i = 0, len = this.glyphs.length; i < len; i++) {
      const cellKey = `${this.startingRow + i}:${this.column}`;

      if (s.cellsRendered.has(cellKey)) {
        continue;
      }

      s.cellsRendered.add(cellKey);

      const remainingLength = this.length - this.glyphs.length;
      const distanceToDestruction = remainingLength + i;
      const opacity = distanceToDestruction / this.fadeDuration;
      ctx.fillStyle = `rgba(0, 230, 0, ${opacity})`;

      if (i === len - 1) {
        ctx.fillStyle = "#f4f7f4";
        ctx.shadowColor = "#f4f7f4";
        ctx.shadowBlur = 20;
      }

      const x = this.column * 15 + 12;
      const y = fontSize * (i + this.startingRow + 1) + 6;
      ctx.fillText(this.glyphs[i], x, y);
    }
  }
}

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
