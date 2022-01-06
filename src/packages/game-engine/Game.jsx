import { useEffect, useRef } from "react";

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
