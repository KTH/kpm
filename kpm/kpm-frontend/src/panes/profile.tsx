import * as React from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { createApiUri } from "./utils";
import { i18n } from "../i18n/i18n";
import { currentUser } from "../app";
import { formatDisplayName } from "../components/utils";
import "./profile.scss";

export function Profile() {
  return (
    <MenuPane>
      <MenuPaneHeader
        title={`${formatDisplayName(currentUser.display_name)} - ${i18n(
          "Settings"
        )}`}
      >
        <a className="kpm-button" href={createApiUri("/auth/logout")}>
          {i18n("Logout")}
        </a>
      </MenuPaneHeader>
      <div className="kpm-col">
        <h3 className="kpm-col-header">{i18n("About me")}</h3>
        <ul>
          <li>
            <a
              className="kpm-profile-link"
              href={`https://www.kth.se/profile/${currentUser.username}/`}
            >
              <img
                src={`https://www.kth.se/files/thumbnail/${currentUser.username}`}
                alt={i18n("Profile Image")}
              />
              {i18n("My Profile")}
            </a>
          </li>
          <li>
            <a href="https://www.kth.se/emailforward">
              {i18n("Forward KTH email")}
            </a>
          </li>
          <li>
            <a href="https://www.student.ladok.se/student/app/studentwebb/mina-uppgifter">
              {i18n("Contact details")}
            </a>{" "}
            {i18n("(in LADOK)")}
          </li>
        </ul>
      </div>
      <div className="kpm-col">
        <h3 className="kpm-col-header">{i18n("My Settings")}</h3>
        <ul>
          <li>
            <a href="https://www.kth.se/social/home/settings/">
              {i18n("Subscriptions, my schedule")}
            </a>
          </li>
          <li>
            <a href="https://www.kth.se/social/home/calendar/settings/">
              {i18n("Export My schedule (e.g. to your mobile phone)")}
            </a>
          </li>
          <li>
            <a href="https://login.sys.kth.se/peap.html">
              {i18n("Wireless network")}
            </a>
          </li>
          <li>
            <a href="https://login.kth.se/password/change">
              {i18n("Change password")}
            </a>
          </li>
        </ul>
      </div>
    </MenuPane>
  );
}
