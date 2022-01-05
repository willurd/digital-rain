import Game, { GameEngine } from "../game-engine/view/Game";

const CHARS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
  "`~!#$%^&*()+-_=[]{}'\";:,.<>/?\\|"
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

  render(ctx) {
    super.render(ctx);

    // font color: #00e600 (has a glow, fades to 0 opacity)
    ctx.font = "12px digital-rain";

    for (let i = 0; i < 10; i++) {
      ctx.fillText(CHARS[i * 5], 10, 10 * (i + 1));
    }
  }
}

export const CanvasSpike = () => {
  return <Game createGame={(canvas) => new DigitalRain(canvas)} />;
};

export default CanvasSpike;
