import * as React from "react";
import { Page } from "./Page";

function doActivateMenu(active: boolean) {
  fetch("/kpm/api/use_beta", {
    credentials: "include",
    method: "POST",
    body: JSON.stringify({ active }),
    headers: {
      "content-type": "application/json",
    },
  });
}

function isMenuActive() {
  const cookies = document.cookie.split(/;\s+/);
  return !!cookies.find(
    (item) => item.startsWith("use_kpm=") && !item.endsWith("=")
  );
}

export function App() {
  const isActive = isMenuActive();
  return (
    <Page>
      <h1>New Personal Menu (Beta)</h1>
      {isActive ? (
        <div>
          <p>You have activated the beta.</p>
          <button onClick={() => doActivateMenu(false)}>De-activate</button>
        </div>
      ) : (
        <div>
          <p>
            You have <em>not</em> activated the beta.
          </p>
          <button onClick={() => doActivateMenu(true)}>Activate</button>
        </div>
      )}
    </Page>
  );
}
