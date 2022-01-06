import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./packages/app/App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
