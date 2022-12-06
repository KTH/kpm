import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const appEl = document.getElementById("kpm-activation-6cf53");
const root = createRoot(appEl!);
root.render(<App />);
