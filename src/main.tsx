import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DiceFootballApp from "./DiceFootballApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DiceFootballApp />
  </StrictMode>
);