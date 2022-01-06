import random from "random";
import Entity from "../game-engine/Entity";
import Glyphs from "./Glyphs";
import choose from "../random/choose";

export const createCellKey = (row, column) => `${row}:${column}`;

const createSwapperDelay = () => random.int(100, 800);

export class Stream extends Entity {
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
    // Something like (floor(maxRows*0.5), floor(maxRows*0.8))
    this.length = random.int(14, 19);
    this.swapperConfigs = new Map();
  }

  update(delta, game) {
    super.update(delta, game);

    this.timeUntilNextGlyph -= delta;

    // TODO: This could be more performant. Right now it's O(mn)
    for (const config of this.swapperConfigs.values()) {
      config.delay -= delta;

      if (config.delay <= 0) {
        config.delay = createSwapperDelay();

        for (let i = 0; i < this.glyphs.length; i++) {
          const row = this.startingRow + i;

          if (row === config.row) {
            this.glyphs[i] = choose(Glyphs);
          }
        }
      }
    }

    if (this.timeUntilNextGlyph <= 0) {
      this.timeUntilNextGlyph = this.timeBetweenGlyphs;
      const newGlyph = choose(Glyphs);
      this.glyphs.push(newGlyph);
      const row = this.startingRow + this.glyphs.length - 1;
      const cellKey = createCellKey(row, this.column);

      if (Math.random() < 1 / 20) {
        this.swapperConfigs.set(cellKey, {
          row,
          delay: createSwapperDelay()
        });
      }

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

    const fontSize = 24;
    const font = "matrix-code-nfi";
    ctx.font = `${fontSize}px ${font}`;
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 14;

    for (let i = 0, len = this.glyphs.length; i < len; i++) {
      const row = this.startingRow + i;
      const cellKey = createCellKey(row, this.column);

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

export default Stream;
