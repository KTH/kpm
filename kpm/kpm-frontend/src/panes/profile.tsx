import * as React from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { createApiUri } from "./utils";
import { i18n } from "../i18n/i18n";
import { currentUser } from "../app";
import { formatDisplayName } from "../components/utils";

export function Profile() {
  return (
    <MenuPane>
      <MenuPaneHeader title={`${formatDisplayName(currentUser.display_name)} - ${i18n("Settings")}`}>
          <a className="kpm-button" href={createApiUri("/auth/logout")}>{i18n("Logout")}</a>
      </MenuPaneHeader>
        <h2>
          
        </h2>
        <p>
        </p>
    </MenuPane>
  );
}

