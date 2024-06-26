import * as React from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { createApiUri, postApi, prefixHost } from "./utils";
import { useAuthState } from "../state/authState";
import { i18n, LANG } from "../i18n/i18n";
import "./profile.scss";
import { useState } from "react";
import { ErrorMessage } from "../components/common";
import { APILangPostData } from "kpm-backend-interface";

export function Profile() {
  const [currentUser] = useAuthState();
  const { lang, switchLang, errorSwitchLang } = useLang();

  return (
    <MenuPane className="kpm-profile">
      <MenuPaneHeader
        title={`${currentUser?.display_name ?? ""} - ${i18n("Settings")}`}
      >
        <button
          className="kpm-button change-lang"
          lang={lang === "sv" ? "en" : "sv"}
          onClick={switchLang}
        >
          {i18n("lang_other")}
        </button>
        <a className="kpm-button" href={createApiUri("/auth/logout")}>
          {i18n("Logout")}
        </a>
      </MenuPaneHeader>
      {errorSwitchLang && <ErrorMessage error={errorSwitchLang} compact />}
      <div className="kpm-col">
        <h3 className="kpm-col-header">{i18n("About me")}</h3>
        <ul>
          <li>
            <a
              className="kpm-profile-link"
              href={prefixHost("www", `/profile/${currentUser?.username}`)}
            >
              <img
                src={prefixHost(
                  "www",
                  `/files/thumbnail/${currentUser?.username}`
                )}
                alt={i18n("Profile Image")}
              />
              {i18n("My Profile")}
            </a>
          </li>
          <li>
            <a href={prefixHost("www", "/emailforward")}>
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
            <a href={prefixHost("www", "/social/home/settings/")}>
              {i18n("Subscriptions, my schedule")}
            </a>
          </li>
          <li>
            <a href={prefixHost("www", "/social/home/calendar/settings/")}>
              {i18n("Export My schedule (e.g. to your mobile phone)")}
            </a>
          </li>
          <li>
            <a href="https://login.sys.kth.se/peap.html">
              {i18n("Wireless network")}
            </a>
          </li>
          <li>
            <a href="https://auth.id.kth.se/">{i18n("Change password")}</a>
          </li>
        </ul>
      </div>
    </MenuPane>
  );
}

function useLang(): {
  lang: string;
  switchLang(): void;
  errorSwitchLang?: Error;
} {
  const [errorSwitchLang, setSwitchLangError] = useState<Error>();

  const switchLang = async () => {
    const res = await postApi<APILangPostData>("/api/lang", {
      lang: LANG === "en" ? "sv" : "en",
    }).catch((err: any) => {
      setSwitchLangError(err);
      return;
    });
    if (res?.ok) {
      location.reload();
      return;
    }

    setSwitchLangError(new Error("Unexpected response from language API."));
  };

  return {
    lang: LANG,
    switchLang,
    errorSwitchLang,
  };
}
