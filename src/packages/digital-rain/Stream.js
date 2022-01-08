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
    this.newGlyphsPerSecond = 10; // random.int(4, 12);
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

  updateHotSwappableGlyphs(delta) {
    for (const config of this.swapperConfigs.values()) {
      config.delay -= delta;

      if (config.delay <= 0) {
        config.delay = createSwapperDelay();
        const index = config.row - this.startingRow;

        if (index >= 0 && index < this.glyphs.length) {
          this.glyphs[index] = choose(Glyphs);
        }
      }
    }
  }

  updateNewGlyphs(delta) {
    this.timeUntilNextGlyph -= delta;

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

  update(delta, game) {
    super.update(delta, game);
    this.updateHotSwappableGlyphs(delta);
    this.updateNewGlyphs(delta);
  }

  render(ctx, game) {
    super.render(ctx, game);
    const s = game.getGameState();
    const g = game.grid;

    const font = "matrix-code-nfi";
    ctx.font = `${g.glyph.fontSize}px ${font}`;
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 14;

    ctx.textAlign = "center";
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

      const isMasked = game.mask && game.mask[row][this.column] !== 1;
      const remainingLength = this.length - this.glyphs.length;
      const distanceToDestruction = remainingLength + i;
      const maxOpacity = distanceToDestruction / this.fadeDuration;
      const opacity = isMasked
        ? Math.min(
            0.2,
            // s.maskMaxOpacity,
            maxOpacity
          )
        : maxOpacity;
      ctx.fillStyle = `rgba(0, 230, 0, ${opacity})`;

      if (i === len - 1) {
        ctx.fillStyle = "#f4f7f4";
        ctx.shadowColor = "#f4f7f4";
        ctx.shadowBlur = 20;
      }

      const x =
        this.column * (g.glyph.width + g.glyph.spacing.horizontal) +
        g.margin.horizontal +
        g.glyph.cellOffset.horizontal;
      const y =
        row * (g.glyph.height + g.glyph.spacing.vertical) +
        g.margin.vertical +
        g.glyph.cellOffset.vertical;
      ctx.fillText(this.glyphs[i], x, y);
    }
  }
}

export default Stream;
