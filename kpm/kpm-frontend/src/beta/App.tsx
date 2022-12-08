import * as React from "react";
import { Page } from "./Page";
import "./App.scss";

async function doActivateMenu(
  active: boolean,
  setFeedbackMsg: (msg: string) => void
) {
  const res = await fetch("/kpm/api/use_beta", {
    credentials: "include",
    method: "POST",
    body: JSON.stringify({ active }),
    headers: {
      "content-type": "application/json",
    },
  });

  if (!res.ok) {
    return setFeedbackMsg("Something went wrong.");
  }

  document.location.reload();
}

function isMenuActive() {
  const cookies = document.cookie.split(/;\s+/);
  return !!cookies.find(
    (item) => item.startsWith("use_kpm=") && !item.endsWith("=")
  );
}

export function App() {
  const [feedbackMsg, setFeedbackMsg] = React.useState<string>();
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
        <div className="paragraphs">
          <div className="alert alert-success" role="alert">
            You have activated the beta.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => doActivateMenu(false, setFeedbackMsg)}
          >
            De-activate
          </button>
        </div>
      ) : (
        <div className="paragraphs">
          <div className="alert alert-info" role="alert">
            You have <em>not</em> activated the beta.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => doActivateMenu(true, setFeedbackMsg)}
          >
            Activate
          </button>
        </div>
      )}
      {feedbackMsg && (
        <div className="alert alert-danger" role="alert">
          {feedbackMsg}
        </div>
      )}
    </Page>
  );
}
