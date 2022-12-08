import * as React from "react";
import { Page } from "./Page";
import "./App.scss";

function doActivateMenu(active: boolean) {
  fetch("/kpm/api/use_beta", {
    credentials: "include",
    method: "POST",
    body: JSON.stringify({ active }),
    headers: {
      "content-type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      document.querySelector("div.stateSwitcher p").textContent =
        "Something went wrong.";
    } else {
      document.location.reload();
    }
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
    <Page id="kpm-activation">
      <h1>New Personal Menu (Beta)</h1>
      <div className="lead">
        <p>
          Welcome to the Beta test of the KTH Personal Menu. You can toggle the
          new menu on and off by visiting this page.
        </p>
      </div>
      <div className="paragraphs">
        <p>
          Be aware that the project is under active development and you may
          experience bugs and short outages. We will however be treating this as
          a production deployment during the Beta phase and effort will be made
          to keep it as smooth as possible.
        </p>
      </div>
      {isActive ? (
        <div className="paragraphs stateSwitcher">
          <p>You have activated the beta.</p>
          <button
            className="btn btn-primary"
            onClick={() => doActivateMenu(false)}
          >
            De-activate
          </button>
        </div>
      ) : (
        <div className="paragraphs">
          <p>
            You have <em>not</em> activated the beta.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => doActivateMenu(true)}
          >
            Activate
          </button>
        </div>
      )}
    </Page>
  );
}
