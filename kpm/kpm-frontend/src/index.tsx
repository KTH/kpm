import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { App } from "./app";
import { authState, initSessionCheck } from "./state/authState";
import { TPubSubEvent } from "./state/PubSub";

function sendKpmLoaded(authorized: boolean) {
  document.dispatchEvent(
    new CustomEvent("kpmLoaded", {
      detail: {
        authorized,
        lang: window.__kpmSettings__?.["lang"] || "en",
      },
    })
  );
}

// Only mount menu in outermost frame
if (window.frameElement === null) {
  const root = ReactDOM.createRoot(document.getElementById("kpm-6cf53")!);
  authState.subscribe((event: TPubSubEvent<any>) => {
    if (event.name === "CurrentUser") {
      sendKpmLoaded(!!event.value);
    }
  });
  initSessionCheck();
  root.render(<App />);
}
