import React from "react";
import { i18n } from "../i18n/i18n";
import "./entrances.scss";

const labels = {
  external: "kth.se",
  intra: i18n("shortcut.intranet"),
  student: i18n("shortcut.studentweb"),
};

/** Get the current site */
function getCurrentSite(): "external" | "intra" | "student" | undefined {
  const SITES = ["external", "intra", "student"] as const;

  return SITES.find((site) =>
    document.querySelector("kth-header")?.classList.contains(site)
  );
}

/**
 * Component "<Entrances />"
 * Shortcuts to one of the three "KTH sites" (kth.se, student web, intranet)
 */
export function Entrances() {
  const [expanded, setExpanded] = React.useState(false);
  const currentSite = getCurrentSite();

  return (
    <React.Fragment>
      <nav
        className="kpm-entrances-expandable"
        aria-label={i18n("shortcut.websites")}
      >
        <button
          className="kth-menu-item dropdown"
          aria-expanded={expanded ? "true" : "false"}
          aria-controls="kpm-6cf53-entrances"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {currentSite ? labels[currentSite] : labels["external"]}
        </button>
        <div className="kpm-mini-dialog" id="kpm-6cf53-entrances">
          <ul>
            <li>
              <a href={i18n("shortcut.external.href")}>kth.se</a>
            </li>
            <li>
              <a href={i18n("shortcut.studentweb.href")}>
                {i18n("shortcut.studentweb")}
              </a>
            </li>
            <li>
              <a href={i18n("shortcut.intra.href")}>
                {i18n("shortcut.intranet")}
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <nav
        className="kth-entrances kpm-entrances"
        aria-label={i18n("shortcut.websites")}
      >
        <ul>
          <li>
            <a
              href={i18n("shortcut.external.href")}
              className="kth-menu-item"
              aria-current={currentSite === "external"}
            >
              kth.se
            </a>
          </li>
          <li>
            <a
              href={i18n("shortcut.studentweb.href")}
              className="kth-menu-item"
              aria-current={currentSite === "student"}
            >
              {i18n("shortcut.studentweb")}
            </a>
          </li>
          <li>
            <a
              href={i18n("shortcut.intra.href")}
              className="kth-menu-item"
              aria-current={currentSite === "intra"}
            >
              {i18n("shortcut.intranet")}
            </a>
          </li>
        </ul>
      </nav>
    </React.Fragment>
  );
}
