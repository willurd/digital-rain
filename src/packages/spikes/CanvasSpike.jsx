import Engine from "../game-engine/Engine";
import Game from "../game-engine/Game";

const CHARS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
  "~!#$%^&*()+-_=[]{}'\";:,.<>/?\\|"
]
  .join("")
  .split("");

class DigitalRain extends Engine {
  constructor(canvas) {
    super(canvas);

    this.canvas.style = `
      background-color: #000300;
    `;
  }

  initialize() {
    super.initialize();
  }

  update(delta) {
    super.update(delta);
  }

  // ctx.measureText
  render(ctx) {
    super.render(ctx);

    // glyphs fade to 0 opacity over time
    const fontSize = 24;
    const font = "matrix-code-nfi";
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = "#00e600";
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 14;

    const len = 10;
    for (let i = 0; i <= len; i++) {
      if (i === len) {
        ctx.fillStyle = "#f4f7f4";
        ctx.shadowColor = "#f4f7f4";
        ctx.shadowBlur = 20;
      }

      ctx.fillText(CHARS[i * 7 + 20], 12, fontSize * (i + 1) + 6);
    }
  }
}

export const CanvasSpike = () => {
  return <Game createGame={(canvas) => new DigitalRain(canvas)} />;
};

export default CanvasSpike;
