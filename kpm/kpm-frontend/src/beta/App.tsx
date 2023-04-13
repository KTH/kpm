import * as React from "react";
import { Page } from "./Page";
import "./App.scss";
import { i18n } from "./i18n";

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
  const lang = "en";
  const [feedbackMsg, setFeedbackMsg] = React.useState<string>();
  const isActive = isMenuActive();
  if (lang === "en") {
    return (
      <Page id="mainContent" lang={lang}>
        <h1>New Personal Menu (Beta)</h1>
        <div className="lead">
          <p>
            Welcome to the Beta test of the KTH Personal Menu. You can toggle
            the new menu on and off by visiting this page.
          </p>
        </div>
        <div className="paragraphs">
          <p>
            Be aware that the project is under active development and you may
            experience bugs and short outages. We will however be treating this
            as a production deployment during the Beta phase and effort will be
            made to keep it as smooth as possible. Please read more about the
            project and the beta testing here:
          </p>
          <ol>
            <li>
              <a href="https://intra.kth.se/en/utbildning/systemstod/nyheter/nya-personliga-menyn-lanseras-i-tre-steg-1.1221268">
                The new Personal menu is launched in three steps
              </a>
            </li>
            <li>
              <a href="https://intra.kth.se/en/it/intro/personliga-menyn/utvecklingsprojekt-nya-personliga-menyn-1.1207009">
                Development Project - New Personal menu
              </a>
            </li>
          </ol>
          <p>
            If you are missing something or have found a bug or anything else
            that isn’t working as intended, please send a screenshot and an
            explanation of the problem to{" "}
            <a href="mailto:it-support@kth.se?subject='KTH Personliga Meny BETA -- Feedback'">
              it-support@kth.se
            </a>
            . Please note that you might need to reactivate the beta during the
            testing. Thank you for participating in the beta development!
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
              {i18n(lang, "Avaktivera")}
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
              {i18n(lang, "Aktivera")}
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

  return (
    <Page id="mainContent" lang={lang}>
      <h1>Nya personliga menyn (Beta)</h1>
      <div className="lead">
        <p>
          Välkommen till betatestet av den nya personliga menyn. Du kan växla
          mellan nya och gamla menyn genom att besöka denna sida.
        </p>
      </div>
      <div className="paragraphs">
        <p>
          Tänk på att projektet är under aktiv utveckling och att du kan uppleva
          buggar och korta störningar. Vi kommer dock att behandla detta som en
          produktionsmiljö under betatestfasen och vi kommer att göra vårt bästa
          för att hålla det så smidigt som möjligt. Läs mer om projektet och
          betatestet här:
        </p>
        <ol>
          <li>
            <a href="https://intra.kth.se/en/utbildning/systemstod/nyheter/nya-personliga-menyn-lanseras-i-tre-steg-1.1221268">
              Nya personliga menyn lanseras i tre steg
            </a>
          </li>
          <li>
            <a href="https://intra.kth.se/en/it/intro/personliga-menyn/utvecklingsprojekt-nya-personliga-menyn-1.1207009">
              Utvecklingsprojekt - Nya personliga menyn
            </a>
          </li>
        </ol>
        <p>
          Om du saknar något eller har hittat en bugg eller något annat som inte
          fungerar som det ska, vänligen skicka en skärmdump och en förklaring
          av problemet till{" "}
          <a href="mailto:it-support@kth.se?subject='KTH Personliga Meny BETA -- Feedback'">
            it-support@kth.se
          </a>
          . Tack för att du deltar i betatestet!
        </p>
      </div>
      {isActive ? (
        <div className="paragraphs">
          <div className="alert alert-success" role="alert">
            Du har aktiverat betan.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => doActivateMenu(false, setFeedbackMsg)}
          >
            {i18n(lang, "Avaktivera")}
          </button>
        </div>
      ) : (
        <div className="paragraphs">
          <div className="alert alert-info" role="alert">
            Du har <em>inte</em> aktiverat betan.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => doActivateMenu(true, setFeedbackMsg)}
          >
            {i18n(lang, "Aktivera")}
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
