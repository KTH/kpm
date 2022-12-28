import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { App } from "./app";

// Only mount menu in outermost frame
if (window.frameElement === null) {
  const root = ReactDOM.createRoot(document.getElementById("kpm-6cf53")!);
  root.render(<App />);
}
