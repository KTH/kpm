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

function currentUserDidUpdate(event: TPubSubEvent<any>) {
  if (event.name === "CurrentUser") {
    sendKpmLoaded(!!event.value);
  }
}

// Only mount menu in outermost frame
if (window.frameElement === null) {
  // Send global event kpmLoaded when the app is loaded and on auth state changes
  authState.subscribe(currentUserDidUpdate);
  sendKpmLoaded(!!authState.state("CurrentUser"));

  // Perform internal check to see if the user is logged in
  initSessionCheck();

  // Render the app
  const root = ReactDOM.createRoot(document.getElementById("kpm-6cf53")!);
  root.render(<App />);
}
