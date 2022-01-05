import { useEffect, useRef } from "react";

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
  }

  destroy() {
    if (this.isPlaying) {
      this.stop();
    }
  }

  initialize() {
    this.isPlaying = false;
    this.lastTime = undefined;
  }

  start() {
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
    const delta = now - (this.lastTime === undefined ? now : this.lastTime);
    this.lastTime = now;

    this.update(delta);
    this.render(this.canvas.getContext("2d"));

    requestAnimationFrame(this.nextFrame);
  };

  update(delta) {
    // TODO: Render a stats/fps display if enabled.
  }

  render(ctx) {
    this.clear(ctx);
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
  }
}

export const Game = ({ createGame }) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const game = createGame(canvasRef.current);
    game.start();

    return () => game.destroy();
  }, [canvasRef, createGame]);

  return <canvas ref={canvasRef} />;
};

export default Game;
