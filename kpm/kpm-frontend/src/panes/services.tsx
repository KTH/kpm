import React, { Fragment } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIServices } from "kpm-backend-interface";
import { fetchApi, useDataFecther } from "./utils";
import {
  AuthError,
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { i18n } from "../i18n/i18n";
import "./services.scss";
import { IconSettings, IconStar } from "../components/icons";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderServices({
  request,
}: any = {}): Promise<APIServices> {
  const res = await fetchApi("/api/services", {
    signal: request?.signal,
  });
  const json = await res.json();
  if (res.ok) {
    return json;
  } else {
    if (res.status === 401) {
      throw new AuthError(json.message);
    }
    throw new Error(json.message);
  }
}

type TFilter = "favs" | "all";

export function Services() {
  const { res, loading, error } = useDataFecther<APIServices>(loaderServices);
  const { servicelinks, studentlinks } = res || {};

  const isEmptyServiceLinks = !loading && !error && servicelinks?.length === 0;
  const hasStudentlinks =
    Array.isArray(studentlinks) && studentlinks?.length > 0;
  const showStudentLinksWidget = hasStudentlinks;

  return (
    <MenuPane className="kpm-services" error={error}>
      <MenuPaneHeader title={i18n("My Services")}>
        <a
          title={i18n("Help / feedback for the personal menu")}
          href="https://www.kth.se/social/group/feedback-fran-anvand/page/personliga-menyn/"
        >
          Help / feedback
        </a>
        <IconSettings href="https://www.kth.se/social/servicelinks" />
      </MenuPaneHeader>
      <Fragment>
        <div className="kpm-col">
          <h3 className="kpm-col-header">{i18n("LADOK for Students")}</h3>
          <ul>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/start">
                  {i18n("Home page")}
                </a>
              </h4>
              <p>
                {i18n(
                  "Relevant information right now. Course registration, Exam registration"
                )}
              </p>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/min-utbildning/alla">
                  {i18n("My education")}
                </a>
              </h4>
              <p>
                {i18n(
                  "Overview of your studies. Programmes, courses, results on courses"
                )}
              </p>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/examinationstillfallen/oppna-for-anmalan">
                  {i18n("Examinations")}
                </a>
              </h4>
              <p>{i18n("Sign up for examinations")}</p>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/intyg">
                  {i18n("Transcripts")}
                </a>
              </h4>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/examen-bevis">
                  {i18n("Degree Certificate")}
                </a>
              </h4>
              <p>{i18n("Apply for degree certificate")}</p>
            </li>
          </ul>
          {showStudentLinksWidget && (
            <Fragment>
              <h3 className="kpm-col-header">
                {i18n("Services for Students")}
              </h3>
              {loading && <LoadingPlaceholder />}
              {error && <ErrorMessage error={error} />}
              {hasStudentlinks && (
                <ul>
                  {studentlinks?.map((link) => (
                    <li key={link.url}>
                      <h4>
                        <a href={link.url}>{link.name}</a>
                      </h4>
                      {link.info && <p>{link.info}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Fragment>
          )}
        </div>
        <div className="kpm-col kpm-services-links">
          <h3 className="kpm-col-header">{i18n("Other Selected Services")}</h3>
          {loading && <LoadingPlaceholder />}
          {error && <ErrorMessage error={error} />}
          {isEmptyServiceLinks && (
            <EmptyPlaceholder>
              {i18n("You have no service links.")}
            </EmptyPlaceholder>
          )}
          {!isEmptyServiceLinks && (
            <ul>
              {servicelinks?.map((links) => (
                <li key={links.url}>
                  <h4>
                    <a href={links.url}>{links.name}</a>
                  </h4>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Fragment>
    </MenuPane>
  );
}
