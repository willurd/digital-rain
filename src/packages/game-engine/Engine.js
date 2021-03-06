import { debounce } from "lodash";

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gameState = {};
    this.handleWindowResize();
    this.handleWindowResize = debounce(this.handleWindowResize, 100);
    window.addEventListener("resize", this.handleWindowResize);
  }

  destroy() {
    window.removeEventListener("resize", this.handleWindowResize);

    if (this.isPlaying) {
      this.stop();
    }
  }

  handleWindowResize = () => {
    this.width = window.innerWidth || document.body.clientWidth;
    this.height = window.innerHeight || document.body.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.onWindowResize();
  };

  getCanvas() {
    return this.canvas;
  }

  getGameState() {
    return this.gameState;
  }

  initialize() {
    this.isPlaying = false;
    this.lastTime = undefined;
  }

  start() {
    this.initialize();
    this.isPlaying = true;
    this.nextFrame();
  }

  stop() {
    this.isPlaying = false;
  }

  nextFrame = () => {
    if (!this.isPlaying) {
      return;
    }

    const now = Date.now();
    const delta = now - (this.lastTime || now);
    this.lastTime = now;

    this.update(delta);
    this.render(this.canvas.getContext("2d"));

    requestAnimationFrame(this.nextFrame);
  };

  onWindowResize() {
    //
  }

  update(delta) {
    // TODO: Render a stats/fps display if enabled.
  }

  render(ctx) {
    this.clear(ctx);
    ctx.restore();
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
  }
}

export default Engine;
