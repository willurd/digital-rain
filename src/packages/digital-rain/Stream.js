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
    this.length = random.int(
      Math.floor(game.rows * 0.5),
      Math.floor(game.rows * 0.8)
    ); // random.int(14, 19);
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
    const g = game.grid;

    const font = "matrix-code-nfi";
    ctx.font = `${g.glyph.fontSize}px ${font}`;
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 14;

    ctx.textAlign = "left";
    ctx.textBaseline = "center";

    for (let i = 0, len = this.glyphs.length; i < len; i++) {
      const row = this.startingRow + i;

      if (row >= game.rows) {
        break;
      }

      const cellKey = createCellKey(row, this.column);

      if (s.cellsRendered.has(cellKey)) {
        continue;
      }

      s.cellsRendered.add(cellKey);

      // NOTE: This masks a circle.
      // const cx = 26;
      // const cy = 12;
      // const radius = 6;
      // const distance = Math.sqrt(
      //   Math.pow(row - cy, 2) + Math.pow((this.column + 14) / 1.5 - cx, 2)
      // );

      // if (distance <= radius && distance >= radius - 1) {
      //   continue;
      // }

      // NOTE: This masks a rectangle.
      // if (
      //   row === 5 ||
      //   row === 19 ||
      //   (row >= 5 && row <= 19 && (this.column === 10 || this.column === 42))
      // ) {
      //   continue;
      // }

      const remainingLength = this.length - this.glyphs.length;
      const distanceToDestruction = remainingLength + i;
      const opacity = distanceToDestruction / this.fadeDuration;
      ctx.fillStyle = `rgba(0, 230, 0, ${opacity})`;

      if (i === len - 1) {
        ctx.fillStyle = "#f4f7f4";
        ctx.shadowColor = "#f4f7f4";
        ctx.shadowBlur = 20;
      }

      const x =
        this.column * 15 + g.margin.horizontal + g.glyph.cellOffset.horizontal;
      const y =
        g.glyph.fontSize * row +
        g.margin.vertical +
        g.glyph.cellOffset.vertical;
      ctx.fillText(this.glyphs[i], x, y);
    }
  }
}

export default Stream;
