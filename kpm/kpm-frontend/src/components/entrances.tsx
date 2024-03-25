import React from "react";
import { i18n } from "../i18n/i18n";
import "./entrances.scss";

/**
 * Component "<Entrances />"
 * Shortcuts to one of the three "KTH sites" (kth.se, student web, intranet)
 */
export function Entrances() {
  return (
    <React.Fragment>
      <nav className="kth-entrances-expandable">
        <button className="kth-menu-item dropdown">kth.se</button>
      </nav>
      <nav className="kth-entrances" aria-label={i18n("Websites")}>
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
