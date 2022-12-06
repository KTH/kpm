import * as React from "react";
import { Page } from "./Page";

function doActivateMenu(e: any) {
  // TODO: Create endpoint that sets cookie
  fetch(``)
}

function doDeactivateMenu(e: any) {
  // TODO: Create endpoint that clears cookie
  fetch(``)
}

function isMenuActive() {
  const cookies = document.cookie.split(";");
  return !!cookies.find((item) => item.startsWith("use_kpm="));
}

export function App() {
  const isActive = isMenuActive();
  return (
    <Page>
      <h1>New Personal Menu (Beta)</h1>
      {isActive
        ? <button onClick={doActivateMenu}>Activate</button>
        : <button onClick={doDeactivateMenu}>De-activate</button>}
    </Page>
  )
}