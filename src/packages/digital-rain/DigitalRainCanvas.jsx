import Game from "../game-engine/Game";
import { DigitalRainAnimation } from "./DigitalRainAnimation";

export const DigitalRainCanvas = () => {
  return <Game createGame={(canvas) => new DigitalRainAnimation(canvas)} />;
};

export default DigitalRainCanvas;
