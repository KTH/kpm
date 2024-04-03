import React from "react";
import { i18n } from "../i18n/i18n";
import "./entrances.scss";

/**
 * Component "<Entrances />"
 * Shortcuts to one of the three "KTH sites" (kth.se, student web, intranet)
 */
export function Entrances() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <React.Fragment>
      <nav className="kpm-entrances-expandable" aria-label={i18n("Websites")}>
        <button
          className="kth-menu-item dropdown"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          kth.se
        </button>
        {expanded && (
          <div className="kpm-mini-dialog">
            <h2 id="kpm-entrances-mobile-title">{i18n("Websites")}</h2>
            <ul>
              <li>
                <a href="https://kth.se">kth.se</a>
              </li>
              <li>
                <a href="https://kth.se/student">{i18n("Student web")}</a>
              </li>
              <li>
                <a href="https://intra.kth.se">{i18n("Intranet")}</a>
              </li>
            </ul>
          </div>
        )}
      </nav>
      <nav
        className="kth-entrances kpm-entrances"
        aria-label={i18n("Websites")}
      >
        <ul>
          <li>
            <a href="https://kth.se" className="kth-menu-item">
              kth.se
            </a>
          </li>
          <li>
            <a href="https://kth.se/student" className="kth-menu-item">
              {i18n("Student web")}
            </a>
          </li>
          <li>
            <a href="https://intra.kth.se" className="kth-menu-item">
              {i18n("Intranet")}
            </a>
          </li>
        </ul>
      </nav>
    </React.Fragment>
  );
}
