import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./app/styles/global.css";
import App from "./App";

gsap.registerPlugin(useGSAP);

createRoot(document.getElementById("root")!).render(<App />);
