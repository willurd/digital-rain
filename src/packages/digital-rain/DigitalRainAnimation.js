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

// TODO: Use this class.
class Glyph extends Entity {
  constructor() {
    super();
    this.isHotSwappable = random.float() < 0.1;
  }

  update(delta, game) {
    super.update(delta, game);

    // TODO
  }

  render(ctx, canvas) {
    super.render(ctx, canvas);

    // TODO
  }
}

class Stream extends Entity {
  constructor(column, renderCount = 1) {
    super();
    this.column = column;
    this.renderCount = renderCount;
    this.glyphs = [];
    this.newGlyphsPerSecond = 10;
    this.timeBetweenGlyphs = 1000 / this.newGlyphsPerSecond;
    // position increases by 1 every time a glyph fades away.
    this.startingRow = 0;
    this.maxStartingRow = 24;
    this.timeUntilNextGlyph = 0;
    this.fadeDuration = 8;
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

  render(ctx, canvas) {
    super.render(ctx, canvas);

    // glyphs fade to 0 opacity over time
    const fontSize = 24;
    const font = "matrix-code-nfi";
    ctx.font = `${fontSize}px ${font}`;
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 14;

    for (let i = 0, len = this.glyphs.length; i < len; i++) {
      const remainingLength = this.length - this.glyphs.length;
      const distanceToDestruction = remainingLength + i;
      const opacity = distanceToDestruction / this.fadeDuration;
      ctx.fillStyle = `rgba(0, 230, 0, ${opacity})`;

      if (i === len - 1) {
        ctx.fillStyle = "#f4f7f4";
        ctx.shadowColor = "#f4f7f4";
        ctx.shadowBlur = 20;
      }

      ctx.fillText(
        this.glyphs[i],
        this.column * 15 + 12,
        fontSize * (i + this.startingRow + 1) + 6
      );
    }
  }
}

export class DigitalRainAnimation extends Engine {
  constructor(canvas) {
    super(canvas);
    canvas.style.backgroundColor = "#000300";
  }

  initialize() {
    super.initialize();

    const gameState = this.getGameState();
    gameState.density = 0.7;
    gameState.streams = [];
  }

  update(delta) {
    super.update(delta);
    const gameState = this.getGameState();

    gameState.streams = gameState.streams.filter((s) => !s.shouldBeRemoved);

    if (gameState.streams.length === 0) {
      for (let i = 0; i <= 52; i++) {
        const delay = Math.random() * 1500;
        const add = () => {
          gameState.streams.push(new Stream(i));
        };

        if (delay < 100) {
          add();
        } else {
          setTimeout(add, delay);
        }
      }
    }

    gameState.streams.forEach((s) => s.update(delta, this));
  }

  // ctx.measureText
  render(ctx) {
    super.render(ctx);
    const gameState = this.getGameState();

    gameState.streams.forEach((s) => {
      for (let i = 0; i < s.renderCount; i++) {
        s.render(ctx, this.canvas);
      }
    });
  }
}

export default DigitalRainAnimation;
