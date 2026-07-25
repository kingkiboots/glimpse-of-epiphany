import { createRoot } from "react-dom/client";
import "./app/styles/global.css";
import "./app/styles/liquid-glass-compat.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
