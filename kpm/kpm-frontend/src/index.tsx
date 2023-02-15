import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { App } from "./app";
import { initSessionCheck } from "./state/authState";

// Only mount menu in outermost frame
if (window.frameElement === null) {
  const root = ReactDOM.createRoot(document.getElementById("kpm-6cf53")!);
  initSessionCheck();
  root.render(<App />);
}
