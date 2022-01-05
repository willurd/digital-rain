import Game, { GameEngine } from "../game-engine/view/Game";

const CHARS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
  "~!#$%^&*()+-_=[]{}'\";:,.<>/?\\|"
]
  .join("")
  .split("");

class DigitalRain extends GameEngine {
  constructor(canvas) {
    super(canvas);

    this.canvas.style = `
      background-color: #000300;
      margin: 0;
      padding: 0;
    `;

    window.addEventListener("resize", this.handleWindowResize);
    this.handleWindowResize();
  }

  destroy() {
    super.destroy();
    window.removeEventListener("resize", this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.width = window.innerWidth || document.body.clientWidth;
    this.height = window.innerHeight || document.body.clientHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  };

  initialize() {
    super.initialize();
  }

  update(delta) {
    super.update(delta);
  }

  // ctx.measureText
  render(ctx) {
    super.render(ctx);

    // font color: #00e600 (has a glow, fades to 0 opacity)
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
